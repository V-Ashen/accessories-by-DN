"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/#about" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 shrink-0"
        >
          <Image
            src="/logo.jpg"
            alt="Accessories by DN Logo"
            width={34}
            height={34}
            className="rounded-full"
          />
          <span className="font-medium text-[15px] tracking-tight text-slate-900 hidden md:block">
            Accessories by DN
          </span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-[13px] tracking-wide transition-colors duration-150 ${
                  isActive
                    ? "text-slate-900 font-medium"
                    : "text-slate-500 hover:text-slate-800 font-normal"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="block h-px bg-slate-900 mt-0.5 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: auth + cart */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-400 hidden lg:block truncate max-w-[140px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-[12px] font-medium text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-full transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-[13px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3.5 py-1.5 rounded-full transition"
            >
              Log in
            </button>
          )}

          {/* Cart */}
          <button
            onClick={handleCartClick}
            aria-label="Open cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-medium text-white bg-slate-900 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}