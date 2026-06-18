"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogOut, UserIcon } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.cart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { user, setAuthModalOpen } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => useCartStore.getState().setCartOpen(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMobileNav = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/#about" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2.5 z-50 shrink-0">
          <Image src="/logo.jpg" alt="Accessories by DN Logo" width={34} height={34} className="rounded-full" />
          <span className="font-medium text-[15px] tracking-tight text-slate-900 hidden sm:block">
            Accessories by DN
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
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

        {/* Right: auth + cart + hamburger */}
        <div className="flex items-center gap-2 z-50">

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-400 truncate max-w-[140px]">
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
          </div>

          {/* Cart */}
          <button
            onClick={handleCartClick}
            aria-label="Open cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg flex flex-col px-6 py-6 animate-in slide-in-from-top-2 duration-200">

          {/* Links */}
          <div className="flex flex-col gap-1 mb-6 border-b border-slate-100 pb-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleMobileNav(link.path)}
                  className={`text-left px-3 py-2.5 rounded-xl text-[15px] transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Auth */}
          <div>
            {user ? (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Signed in as</p>
                <p className="text-[13px] font-medium text-slate-800 truncate">{user.email}</p>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3.5 py-2 rounded-full w-fit transition mt-1"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true); }}
                className="flex items-center gap-2 text-[13px] font-medium text-slate-900 border border-slate-200 hover:border-slate-400 px-3.5 py-2 rounded-full w-fit transition"
              >
                <UserIcon size={14} /> Log in / Register
              </button>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}