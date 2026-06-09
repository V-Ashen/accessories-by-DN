"use client";

import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  // Get the total number of items in the cart
  const cartItems = useCartStore((state) => state.cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight text-slate-900">
          DN.
        </div>
        
        {/* Cart Button */}
        <button className="relative p-2 text-slate-600 hover:text-slate-900 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {/* Cart Badge */}
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}