"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const banners = [
  "/banners/banner1.png",
  "/banners/banner2.png",
  "/banners/banner3.png",
];

export default function HeroSlider() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => setCurrentBanner(index);
  const goPrev = () => goTo((currentBanner - 1 + banners.length) % banners.length);
  const goNext = () => goTo((currentBanner + 1) % banners.length);

  return (
    <div 
      className="relative w-full h-[250px] sm:h-[400px] md:h-[600px] bg-[var(--background)] overflow-hidden cursor-pointer"
      onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={banners[currentBanner]}
            alt={`Hero Banner ${currentBanner + 1}`}
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={currentBanner === 0}
            className="transition-transform duration-[10000ms] ease-linear scale-100 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115]/90 via-black/40 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next arrows - Hidden on small mobile, visible on sm+ */}
      <div className="hidden sm:block">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Previous banner"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 glass-dark text-white opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-[var(--accent)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Next banner"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 glass-dark text-white opacity-0 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-[var(--accent)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {/* Invisible hover zones to trigger arrow opacity */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-24 z-10 group" onMouseEnter={(e) => { const btn = e.currentTarget.previousElementSibling?.previousElementSibling?.previousElementSibling as HTMLElement; if(btn) btn.style.opacity = '1'; }} onMouseLeave={(e) => { const btn = e.currentTarget.previousElementSibling?.previousElementSibling?.previousElementSibling as HTMLElement; if(btn) btn.style.opacity = '0'; }} />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-24 z-10 group" onMouseEnter={(e) => { const btn = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLElement; if(btn) btn.style.opacity = '1'; }} onMouseLeave={(e) => { const btn = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLElement; if(btn) btn.style.opacity = '0'; }} />

      {/* Animated Progress Bars */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); goTo(index); }}
            aria-label={`Go to banner ${index + 1}`}
            className="h-1 sm:h-1.5 rounded-full overflow-hidden bg-white/20 relative transition-all duration-300"
            style={{ width: index === currentBanner ? "30px" : "15px" }}
          >
            {index === currentBanner && (
              <motion.div
                layoutId="active-indicator"
                className="absolute inset-0 bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}