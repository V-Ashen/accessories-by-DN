"use client";

import Image from "next/image";

interface ReviewProps {
  platform: "facebook" | "google";
  reviewerName: string;
  reviewText: string;
}

export default function ReviewCard({ platform, reviewerName, reviewText }: ReviewProps) {
  const platformLogo = platform === "facebook" ? "/icons/facebook.svg" : "/icons/google.svg";
  const platformName = platform === "facebook" ? "Facebook" : "Google";
  const platformColor = platform === "facebook" ? "#1877F2" : "#4285F4";

  const initials = reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-[var(--border)] glass-glow hover:-translate-y-2 hover:border-[var(--accent)] transition-all duration-300 h-full">

      {/* Review body */}
      <div className="flex flex-col flex-1 p-6 sm:p-8 relative">
        {/* Decorative quote icon */}
        <div className="absolute top-6 right-6 opacity-[0.03]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--foreground)">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-4" style={{ filter: "drop-shadow(0 0 5px var(--accent-glow))" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>

        <p className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed flex-1 mb-8 relative z-10"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          "{reviewText}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-[0_0_10px_var(--accent-glow)] group-hover:border-[var(--accent)] transition-colors">
              <span className="text-[var(--accent)] text-xs font-bold tracking-wide">
                {initials}
              </span>
            </div>
            <div>
              <p
                className="text-sm font-semibold text-[var(--foreground)] leading-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {reviewerName}
              </p>
              <p className="text-[10px] text-[var(--muted)] tracking-widest uppercase mt-0.5">
                Verified buyer
              </p>
            </div>
          </div>

          {/* Platform logo */}
          <div className="flex flex-col items-end">
            <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-200" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}>
              <Image src={platformLogo} alt={platformName} width={18} height={18} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}