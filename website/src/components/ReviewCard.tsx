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

  const initials = reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group flex flex-col bg-white border border-[#E0DDD6] rounded-2xl p-6 h-full hover:border-[#C9A84C] transition-all duration-300">

      {/* Quote mark */}
      <div
        className="text-[56px] leading-none text-[#C9A84C] mb-2 select-none"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1 }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      {/* Review text */}
      <p className="text-[#444] text-sm leading-relaxed flex-1 mb-6 italic">
        {reviewText}
      </p>

      {/* Footer: avatar + name + platform */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E0DDD6]">
        <div className="flex items-center gap-3">
          {/* Initials avatar */}
          <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C9A84C] text-[10px] font-semibold tracking-wide">
              {initials}
            </span>
          </div>
          <div>
            <p
              className="text-[13px] font-semibold text-[#1C1C1E] leading-tight tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {reviewerName}
            </p>
            <p className="text-[10px] text-[#888] tracking-widest uppercase">
              Verified buyer
            </p>
          </div>
        </div>

        {/* Platform logo */}
        <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-80 transition-opacity duration-200">
          <Image src={platformLogo} alt={platformName} width={16} height={16} />
          <span className="text-[10px] text-[#888] tracking-widest uppercase">{platformName}</span>
        </div>
      </div>

    </div>
  );
}