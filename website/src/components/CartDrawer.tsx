"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, cartTotal } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setCartOpen(false); // Close the drawer
    if (!user) {
      setAuthModalOpen(true); // Pop the login modal if not logged in
    } else {
      router.push("/checkout"); // Go to checkout if logged in
    }
  };

  return (
    <>
      {/* Dark Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Slide-out Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">Your Cart</h2>
          <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-800 transition">
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <p>Your cart is currently empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-slate-500 text-sm">Qty: {item.quantity}</p>
                  <p className="font-bold text-slate-900 mt-1">LKR {item.price * item.quantity}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Button */}
        {cart.length > 0 && (
          <div className="p-6 border-t bg-slate-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-900">
              <span>Subtotal</span>
              <span>LKR {cartTotal()}</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Shipping & taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}