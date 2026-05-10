'use client';

import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
    }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/products/${product._id}`}>
        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 text-black hover:text-blue-600">{product.name}</h3>
        </Link>
        <p className="text-gray-800 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-black">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-600">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
