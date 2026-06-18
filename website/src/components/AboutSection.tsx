"use client";

const policies = [
  {
    title: "Transparent Pricing",
    body: "No hidden costs. What you see is what you pay.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[#C9A84C]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
  },
  {
    title: "Secure COD",
    body: "Cash on Delivery, handled with absolute care.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[#C9A84C]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2zM7 21V10a5 5 0 0110 0v11H7z" />
      </svg>
    ),
  },
  {
    title: "Hassle-Free Returns",
    body: "Easy exchange policy for total peace of mind.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[#C9A84C]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v4H4V4zm0 4v12h16V8H4zm4 4h8" />
      </svg>
    ),
  },
  {
    title: "Privacy Guaranteed",
    body: "Your personal and shipping data is fully secured.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[#C9A84C]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.418-3.134 8.56-7 9.5C8.134 20.56 5 16.418 5 12V7l7-4z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "100%", label: "Hand-curated pieces" },
  { value: "LK", label: "Based in Sri Lanka" },
  { value: "COD", label: "Secure delivery" },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="about">
      <div className="max-w-4xl mx-auto">

        {/* Eyebrow */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
          Our Story
        </p>

        {/* Heading with ghosted monogram */}
        <div className="relative inline-block mb-6">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] font-light text-[#C9A84C] opacity-[0.08] leading-none select-none pointer-events-none whitespace-nowrap"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            DN
          </span>
          <h2
            className="relative z-10 text-[2.6rem] font-light text-[#1C1C1E] leading-tight tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Story &amp;{" "}
            <em className="not-italic font-normal italic">Commitment</em>
          </h2>
        </div>

        {/* Gold divider */}
        <div className="w-10 h-px bg-[#C9A84C] opacity-70 mb-6" aria-hidden="true" />

        {/* Story — two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mb-10">
          <p className="text-sm text-[#555] leading-relaxed">
            Accessories by DN was born from a passion for bringing the most elegant,
            trend-setting fashion jewellery to Sri Lanka. We believe accessories are
            more than additions to an outfit — they are expressions of individuality,
            confidence, and personal style.
          </p>
          <p className="text-sm text-[#555] leading-relaxed">
            Our mission is to offer a curated selection of highly aesthetic and
            affordable pieces that empower you to shine. Every item is hand-picked
            to meet our rigorous standards of quality and durability.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-[#E0DDD6] border border-[#E0DDD6] rounded-xl overflow-hidden mb-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-4 bg-[#FAF9F7]">
              <span
                className="text-[1.8rem] font-light text-[#C9A84C] leading-none"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#888] mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust policies */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-5">
          Our Trust Policies
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#E0DDD6] border border-[#E0DDD6] rounded-xl overflow-hidden">
          {policies.map(({ title, body, icon }) => (
            <div
              key={title}
              className="p-5 bg-[#FAF9F7] hover:bg-[#F0EDE6] transition-colors duration-200"
            >
              {/* Icon circle */}
              <div className="w-7 h-7 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-3 flex-shrink-0">
                {icon}
              </div>
              <h4
                className="text-sm font-semibold text-[#1C1C1E] mb-1 leading-snug tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {title}
              </h4>
              <p className="text-xs text-[#888] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}