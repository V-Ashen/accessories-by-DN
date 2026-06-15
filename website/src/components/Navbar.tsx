"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { user, setAuthModalOpen } = useAuthStore();

  const handleCartClick = () => {
    useCartStore.getState().setCartOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const initials = user?.email
    ? user.email[0].toUpperCase()
    : "?";

  return (
    <nav className="bg-[#FAF9F7] border-b border-[#E0DDD6] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#E0DDD6] group-hover:ring-[#C9A84C] transition-all duration-200">
            <Image
              src="/logo.jpg"
              alt="Accessories by DN Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <span
            className="hidden sm:block font-semibold text-[#1C1C1E] tracking-[0.1em] uppercase text-sm"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "17px" }}
          >
            Accessories by DN
          </span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="flex items-center gap-3">
              {/* Avatar + email */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A84C] text-xs font-semibold leading-none">
                    {initials}
                  </span>
                </div>
                <span className="text-xs text-[#666] max-w-[140px] truncate">
                  {user.email}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-[#E0DDD6]" />

              {/* Logout button — visible pill */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-[#1C1C1E] tracking-wide uppercase border border-[#1C1C1E] px-3 py-1.5 rounded-full hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs font-medium text-[#1C1C1E] tracking-widest uppercase border border-[#1C1C1E] px-4 py-1.5 rounded-full hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200"
            >
              Log In / Register
            </button>
          )}

          {/* Cart button — clearly visible */}
          <button
            onClick={handleCartClick}
            className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#1C1C1E] text-[#1C1C1E] hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200 group"
            aria-label="Open cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-[#1C1C1E] bg-[#C9A84C] rounded-full leading-none">
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}