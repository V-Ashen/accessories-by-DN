"use client";

import Image from "next/image";

interface ReviewProps {
  platform: 'facebook' | 'google';
  reviewerName: string;
  reviewText: string;
}

export default function ReviewCard({ platform, reviewerName, reviewText }: ReviewProps) {
  // Select the correct SVG icon based on the platform from your public/icons/ folder
  const platformLogo = platform === 'facebook' ? '/icons/facebook.svg' : '/icons/google.svg';
  const platformName = platform === 'facebook' ? 'Facebook' : 'Google';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full text-slate-800">
      {/* Platform Header */}
      <div className="flex items-center gap-3 mb-4">
        <Image src={platformLogo} alt={platformName} width={24} height={24} />
        <span className="text-sm font-semibold text-slate-400">via {platformName}</span>
      </div>
      
      {/* Review Text */}
      <p className="text-slate-600 flex-1 mb-4 text-justify italic leading-relaxed">
        &ldquo;{reviewText}&rdquo;
      </p>
      
      {/* Reviewer Name */}
      <p className="font-bold text-slate-900 text-sm">
        - {reviewerName}
      </p>
    </div>
  );
}