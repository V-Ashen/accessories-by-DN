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
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-[#0f1115]/90 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2.5 z-50 shrink-0">
          <Image src="/logo.jpg" alt="Accessories by DN Logo" width={34} height={34} className="rounded-full shadow-[0_0_10px_var(--accent-glow)]" />
          <span className="font-semibold text-lg md:text-xl tracking-wide text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
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
                className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                style={isActive ? { textShadow: "0 0 8px var(--accent-glow)" } : {}}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: auth + cart + hamburger */}
        <div className="flex items-center gap-2 z-50">

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3 border-r border-[var(--border)] pr-4 mr-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium tracking-wide text-[var(--muted)] truncate max-w-[140px]">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--accent)] transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[#0f1115] px-4 py-1.5 rounded-full transition shadow-sm"
              >
                Log in
              </button>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={handleCartClick}
            aria-label="Open cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 text-[var(--foreground)] transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-[#0f1115] bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent-glow)]">
                {totalItems}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 text-[var(--foreground)] transition ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0f1115]/95 backdrop-blur-md border-b border-[var(--border)] shadow-xl flex flex-col px-6 py-6 animate-in slide-in-from-top-2 duration-200">

          {/* Links */}
          <div className="flex flex-col gap-1 mb-6 border-b border-[var(--border)] pb-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleMobileNav(link.path)}
                  className={`text-left px-3 py-3 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Auth */}
          <div className="pt-2">
            {user ? (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Signed in as</p>
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user.email}</p>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)] border border-[var(--border)] hover:bg-white/10 hover:border-[var(--foreground)] px-4 py-2.5 rounded-full w-fit transition mt-2"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true); }}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)] border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[#0f1115] px-4 py-2.5 rounded-full w-fit transition"
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