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
    <nav className="bg-white border-b fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Accessories by DN Logo" width={40} height={40} className="rounded-full" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 hidden md:block">
            Accessories by DN
          </span>
        </button>

        {/* Middle: Navigation Links (NEW) */}
        <div className="flex items-center gap-6 md:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.name} 
                href={link.path}
                className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                  isActive ? "text-[#C9A84C]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        
        {/* Right: User Auth & Cart */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 hidden lg:block">
                {user.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Log In
            </button>
          )}

          <button onClick={handleCartClick} className="relative p-2 text-slate-600 hover:text-slate-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}