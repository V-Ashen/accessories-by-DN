"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogOut, UserIcon } from "lucide-react"; // Imported Menu and X icons

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { user, setAuthModalOpen } = useAuthStore();

  // NEW: State to control the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMobileNav = (path: string) => {
    setIsMobileMenuOpen(false); // Close menu when a link is clicked
    router.push(path);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/#about" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Logo (Always visible) */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2 z-50">
          <Image src="/logo.jpg" alt="Accessories by DN Logo" width={36} height={36} className="rounded-full" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 hidden sm:block">
            DN.
          </span>
        </button>

        {/* Middle: Desktop Navigation Links (HIDDEN ON MOBILE) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${isActive ? "text-[#C9A84C]" : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: User Auth, Cart, and Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4 z-50">

          {/* Desktop Auth (HIDDEN ON MOBILE) */}
          <div className="hidden md:flex items-center gap-4 border-r pr-4 mr-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  {user.email}
                </span>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 transition">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition">
                Log In
              </button>
            )}
          </div>

          {/* Cart Button (ALWAYS VISIBLE) */}
          <button onClick={handleCartClick} className="relative p-2 text-slate-800 hover:text-black transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle (HIDDEN ON DESKTOP) */}
          <button
            className="md:hidden p-2 text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-xl flex flex-col p-6 animate-in slide-in-from-top-5 duration-200">

          {/* Mobile Links */}
          <div className="flex flex-col gap-5 mb-6 border-b pb-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleMobileNav(link.path)}
                className="text-left text-lg font-bold text-slate-800 tracking-wide uppercase"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Mobile Auth */}
          <div>
            {user ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Logged in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-sm font-bold text-red-500 mt-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true); }}
                className="flex items-center gap-2 text-sm font-bold text-slate-900"
              >
                <UserIcon size={18} /> Log In / Register
              </button>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}