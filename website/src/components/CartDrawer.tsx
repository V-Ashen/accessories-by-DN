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
    setCartOpen(false);
    if (!user) {
      setAuthModalOpen(true);
    } else {
      router.push("/checkout");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF9F7] z-50 flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0DDD6]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
              Summary
            </p>
            <h2
              className="text-xl font-semibold text-[#1C1C1E] tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Your Cart
              {cart.length > 0 && (
                <span className="ml-2 text-sm text-[#888] font-normal">
                  ({cart.length} {cart.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E0DDD6] text-[#888] hover:border-[#1C1C1E] hover:text-[#1C1C1E] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              <div className="w-14 h-14 rounded-full bg-[#1C1C1E] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p
                className="text-lg font-semibold text-[#1C1C1E] tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Your cart is empty
              </p>
              <p className="text-xs text-[#888] tracking-wide">Add some pieces to get started.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-2 text-[10px] font-semibold tracking-widest uppercase border border-[#1C1C1E] text-[#1C1C1E] px-5 py-2 rounded-full hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white border border-[#E0DDD6] rounded-xl p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-18 h-18 min-w-[72px] min-h-[72px] object-cover rounded-lg border border-[#E0DDD6]"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div>
                    <h3
                      className="text-sm font-semibold text-[#1C1C1E] tracking-wide truncate"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#888] tracking-widest uppercase mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1C1C1E]">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="self-start mt-1 w-6 h-6 flex items-center justify-center rounded-full border border-[#E0DDD6] text-[#aaa] hover:border-red-300 hover:text-red-400 transition-all duration-200 flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E0DDD6] bg-white">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-[#888] tracking-widest uppercase">Subtotal</span>
              <span
                className="text-xl font-semibold text-[#1C1C1E]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                LKR {cartTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] tracking-wide mb-5">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#1C1C1E] text-[#FAF9F7] text-xs font-semibold tracking-widest uppercase py-4 rounded-full hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}