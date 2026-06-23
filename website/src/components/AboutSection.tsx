"use client";

const policies = [
  {
    title: "Transparent Pricing",
    body: "No hidden costs. What you see is what you pay.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[var(--accent)]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
  },
  {
    title: "Secure COD",
    body: "Cash on Delivery, handled with absolute care.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[var(--accent)]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2zM7 21V10a5 5 0 0110 0v11H7z" />
      </svg>
    ),
  },
  {
    title: "Hassle-Free Returns",
    body: "Easy exchange policy for total peace of mind.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[var(--accent)]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v4H4V4zm0 4v12h16V8H4zm4 4h8" />
      </svg>
    ),
  },
  {
    title: "Privacy Guaranteed",
    body: "Your personal and shipping data is fully secured.",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="w-3 h-3 text-[var(--accent)]">
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]" id="about">
      <div className="max-w-4xl mx-auto">

        {/* Eyebrow */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>
          Our Story
        </p>

        {/* Heading with ghosted monogram */}
        <div className="relative inline-block mb-6">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] font-light text-[var(--accent)] opacity-5 leading-none select-none pointer-events-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            DN
          </span>
          <h2
            className="relative z-10 text-[2.6rem] font-light text-[var(--foreground)] leading-tight tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Story &amp;{" "}
            <em className="not-italic font-normal italic">Commitment</em>
          </h2>
        </div>

        {/* Gold divider */}
        <div className="w-10 h-px bg-[var(--accent)] opacity-70 mb-6 shadow-[0_0_8px_var(--accent-glow)]" aria-hidden="true" />

        {/* Story — two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mb-10">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Accessories by DN was born from a passion for bringing the most elegant,
            trend-setting fashion jewellery to Sri Lanka. We believe accessories are
            more than additions to an outfit — they are expressions of individuality,
            confidence, and personal style.
          </p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Our mission is to offer a curated selection of highly aesthetic and
            affordable pieces that empower you to shine. Every item is hand-picked
            to meet our rigorous standards of quality and durability.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden mb-10">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-4 bg-white/5">
              <span
                className="text-[1.8rem] font-light text-[var(--accent)] leading-none"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust policies */}
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-5" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>
          Our Trust Policies
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
          {policies.map(({ title, body, icon }) => (
            <div
              key={title}
              className="p-5 bg-white/5 hover:bg-white/10 transition-colors duration-200 group"
            >
              {/* Icon circle */}
              <div className="w-7 h-7 rounded-full bg-white/10 border border-[var(--border)] flex items-center justify-center mb-3 flex-shrink-0 group-hover:border-[var(--accent)] transition-colors shadow-sm">
                {icon}
              </div>
              <h4
                className="text-sm font-semibold text-[var(--foreground)] mb-1 leading-snug tracking-wide"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {title}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}