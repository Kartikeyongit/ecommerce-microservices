'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import Link from 'next/link';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';

export default function Header() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              🛍️ E-Shop
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/products" className="text-black font-medium hover:text-blue-600 transition">
                Products
              </Link>
              <Link href="/cart" className="relative text-black hover:text-blue-600 transition">
                <FiShoppingCart className="text-xl" />
              </Link>
              <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🛍️ E-Shop
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-black font-medium hover:text-blue-600 transition">
              Products
            </Link>

            <Link href="/cart" className="relative text-black hover:text-blue-600 transition">
              <FiShoppingCart className="text-xl" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {token ? (
              <div className="flex items-center gap-4">
                <Link href="/auth/profile" className="flex items-center gap-2 text-black font-medium hover:text-blue-600">
                  <FiUser />
                  {user?.firstName || 'User'}
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700"
                >
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
