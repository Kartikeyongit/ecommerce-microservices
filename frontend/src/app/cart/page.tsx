'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, total } = useSelector((state: RootState) => state.cart);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Your Cart is Empty</h1>
        <p className="text-gray-700 mb-8">Add some products to get started!</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-black">{item.name}</h3>
                <p className="text-black font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                  className="px-3 py-1 border rounded text-black hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center text-black">{item.quantity}</span>
                <button
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  className="px-3 py-1 border rounded text-black hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="font-semibold w-24 text-right text-black">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}

          <button
            onClick={() => dispatch(clearCart())}
            className="text-red-500 hover:text-red-700 mt-4 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 text-black">Order Summary</h2>
          <div className="flex justify-between mb-2 text-black">
            <span>Items ({items.length})</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2 text-black">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr className="my-4 border-gray-300" />
          <div className="flex justify-between mb-4 text-xl font-bold text-black">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
