// website/src/components/HeroSlider.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const banners = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
  // Add more banner image paths here
];

export default function HeroSlider() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] bg-slate-100 overflow-hidden">
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
            priority={index === 0} // Load first banner eagerly
          />
          {/* Optional overlay for text readability */}
          <div className="absolute inset-0 bg-black/20" /> 
        </div>
      ))}
      
    </div>
  );
}