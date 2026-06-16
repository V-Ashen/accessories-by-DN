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
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-[#E0DDD6] hover:border-[#C9A84C] transition-all duration-300">

      {/* Dark header band with platform + stars */}
      <div className="bg-[#1C1C1E] px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: platformColor }}
          />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#666]">
            via {platformName}
          </span>
        </div>
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-3 h-3" viewBox="0 0 24 24" fill="#C9A84C">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
        </div>
      </div>

      {/* Review body */}
      <div className="bg-white flex flex-col flex-1 px-5 pt-5 pb-4">
        <p className="text-[13px] text-[#555] leading-relaxed italic flex-1 mb-4"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {reviewText}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0">
              <span className="text-[#C9A84C] text-[10px] font-semibold tracking-wide">
                {initials}
              </span>
            </div>
            <div>
              <p
                className="text-[13px] font-semibold text-[#1C1C1E] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {reviewerName}
              </p>
              <p className="text-[10px] text-[#aaa] tracking-widest uppercase">
                Verified buyer
              </p>
            </div>
          </div>

          {/* Platform logo */}
          <div className="opacity-40 group-hover:opacity-70 transition-opacity duration-200">
            <Image src={platformLogo} alt={platformName} width={16} height={16} />
          </div>
        </div>
      </div>

    </div>
  );
}