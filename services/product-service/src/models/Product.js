const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Price must be a valid number',
    },
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative'],
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  inventory: {
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
  },
  specifications: [{
    name: String,
    value: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  searchableText: {
    type: String,
    index: 'text',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Pre-save middleware to update searchable text
productSchema.pre('save', function(next) {
  this.searchableText = `${this.name} ${this.description} ${this.tags.join(' ')}`;
  next();
});

// Instance methods
productSchema.methods.adjustInventory = async function(quantity) {
  if (!this.inventory.trackInventory) return true;
  
  const newQuantity = this.inventory.quantity + quantity;
  if (newQuantity < 0) {
    throw new Error('Insufficient inventory');
  }
  
  this.inventory.quantity = newQuantity;
  await this.save();
  
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) {
    // Emit low stock event (you can integrate with event bus here)
    console.warn(`Low stock alert for product ${this._id}: ${this.inventory.quantity} remaining`);
  }
  
  return true;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;