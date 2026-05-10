const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Product = require('../models/Product');

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const redis = req.app.get('redis');
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original send
      const originalSend = res.json;
      res.json = function(body) {
        redis.setex(key, duration, JSON.stringify(body));
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Get all products with filtering, sorting, and pagination
router.get('/',
  cacheMiddleware(300),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isMongoId(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('search').optional().trim(),
    query('sort').optional().isIn(['price', '-price', 'name', '-name', 'createdAt', '-createdAt', 'rating', '-rating']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice,
        search,
        sort = '-createdAt',
        inStock,
        tags,
      } = req.query;

      // Build filter
      const filter = { isActive: true };
      
      if (category) filter.category = category;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = minPrice;
        if (maxPrice) filter.price.$lte = maxPrice;
      }
      if (inStock === 'true') {
        filter['inventory.quantity'] = { $gt: 0 };
      }
      if (tags) {
        filter.tags = { $in: tags.split(',') };
      }
      if (search) {
        filter.$text = { $search: search };
      }

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      res.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
        filters: {
          category,
          minPrice,
          maxPrice,
          search,
          sort,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single product
router.get('/:id',
  cacheMiddleware(600),
  param('id').isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id)
        .populate('category', 'name slug parent')
        .populate({
          path: 'reviews',
          options: { sort: { createdAt: -1 }, limit: 10 },
        });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Increment view count in Redis
      const redis = req.app.get('redis');
      await redis.zincrby('product:views', 1, req.params.id);

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// Create product
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('category').isMongoId(),
    body('inventory.quantity').optional().isInt({ min: 0 }),
    body('sku').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = new Product(req.body);
      await product.save();

      // Invalidate category cache
      const redis = req.app.get('redis');
      await redis.del(`cache:/api/products?category=${product.category}`);

      res.status(201).json({ product });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
      next(error);
    }
  }
);

// Update product
router.put('/:id',
  param('id').isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Invalidate cache
      const redis = req.app.get('redis');
      await redis.del(`cache:/api/products/${req.params.id}`);

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// Delete product (soft delete)
router.delete('/:id',
  param('id').isMongoId(),
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Invalidate cache
      const redis = req.app.get('redis');
      await redis.del(`cache:/api/products/${req.params.id}`);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Adjust inventory
router.patch('/:id/inventory',
  param('id').isMongoId(),
  body('quantity').isInt(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await product.adjustInventory(req.body.quantity);

      res.json({
        product,
        newQuantity: product.inventory.quantity,
      });
    } catch (error) {
      if (error.message === 'Insufficient inventory') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
);

module.exports = router;