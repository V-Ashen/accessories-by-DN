"use client";

import Image from "next/image";

const policies = [
  {
    title: "Transparent Pricing",
    body: "No hidden costs. What you see is what you pay.",
  },
  {
    title: "Secure COD",
    body: "Cash on Delivery, handled with absolute care.",
  },
  {
    title: "Hassle-Free Returns",
    body: "Easy exchange policy for total peace of mind.",
  },
  {
    title: "Privacy Guaranteed",
    body: "Your personal and shipping data is fully secured.",
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Left: Text & Policies */}
        <div>
          {/* Eyebrow + heading */}
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
            Our Story
          </p>
          <h2
            className="text-3xl font-semibold text-[#1C1C1E] tracking-wide mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Story &amp; Commitment
          </h2>

          <p className="text-sm text-[#555] mb-4 leading-relaxed">
            Accessories by DN was born from a passion for bringing the most elegant, trend-setting fashion jewellery to Sri Lanka. We believe that accessories are more than just additions to an outfit — they are expressions of individuality, confidence, and personal style. Our mission is to offer a curated selection of highly aesthetic and affordable pieces that empower you to shine.
          </p>
          <p className="text-sm text-[#555] mb-10 leading-relaxed">
            Every single item in our collection is hand-picked to ensure it meets our rigorous standards of quality and durability. We are committed to providing you with a frictionless shopping experience, from browsing our collections to receiving your secure delivery at your doorstep.
          </p>

          {/* Trust policies */}
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-4">
            Our Trust Policies
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {policies.map(({ title, body }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-4 hover:border-[#C9A84C] transition-all duration-200"
              >
                {/* Gold checkmark circle */}
                <div className="w-5 h-5 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4
                    className="text-sm font-semibold text-[#1C1C1E] mb-0.5 tracking-wide"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {title}
                  </h4>
                  <p className="text-xs text-[#888] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Brand image */}
        <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-[#E0DDD6]">
          <Image
            src="/about-us.jpg"
            alt="About Accessories by DN"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={false}
          />
          {/* Subtle bottom fade to ground the image */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

      </div>
    </section>
  );
}