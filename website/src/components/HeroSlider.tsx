"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const banners = [
  "/banners/banner1.png",
  "/banners/banner2.png",
  "/banners/banner3.png",
  // Add more banner image paths here
];

export default function HeroSlider() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => {
    if (isAnimating || index === currentBanner) return;
    setIsAnimating(true);
    setCurrentBanner(index);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const goPrev = () => goTo((currentBanner - 1 + banners.length) % banners.length);
  const goNext = () => goTo((currentBanner + 1) % banners.length);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-[#1C1C1E] overflow-hidden group">

      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentBanner ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner}
            alt={`Hero Banner ${index + 1}`}
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={index === 0}
            className={`transition-transform duration-[6000ms] ease-out ${
              index === currentBanner ? "scale-105" : "scale-100"
            }`}
          />
          {/* Gradient overlay — bottom-weighted for future text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </div>
      ))}

      {/* Prev arrow */}
      <button
        onClick={goPrev}
        aria-label="Previous banner"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 flex items-center justify-center
          rounded-full border border-white/40 bg-black/20 text-white
          opacity-0 group-hover:opacity-100
          hover:bg-black/50 hover:border-white/70
          transition-all duration-200
          backdrop-blur-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={goNext}
        aria-label="Next banner"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10
          w-10 h-10 flex items-center justify-center
          rounded-full border border-white/40 bg-black/20 text-white
          opacity-0 group-hover:opacity-100
          hover:bg-black/50 hover:border-white/70
          transition-all duration-200
          backdrop-blur-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Go to banner ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              index === currentBanner
                ? "w-6 h-1.5 bg-[#C9A84C]"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Slide counter — top right */}
      <div className="absolute top-4 right-4 z-10 text-white/60 text-xs tracking-widest font-medium tabular-nums">
        {String(currentBanner + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
      </div>

    </div>
  );
}