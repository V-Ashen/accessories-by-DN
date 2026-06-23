"use client";

import Image from "next/image";
import { MapPin, Mail, PhoneCall } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="bg-[var(--background)] py-20 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>
            Contact
          </p>
          <h2
            className="text-3xl font-semibold text-[var(--foreground)] tracking-wide mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Get In Touch
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
            Have a question about our collections or need help with your order? Reach out to our dedicated team anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Location */}
          <div className="group flex flex-col items-center text-center bg-white/5 border border-[var(--border)] rounded-2xl p-8 hover:bg-white/10 hover:border-[var(--accent)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-[var(--border)] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-[var(--accent)] transition-all duration-300 shadow-sm">
              <MapPin size={20} className="text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <h3
              className="text-lg font-semibold text-[var(--foreground)] mb-3 tracking-wide"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Our Store
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[200px]">
              158, Rajamahavihara Rd, Mirihana, Kotte, Sri Lanka 10100
            </p>
          </div>

          {/* Card 2: Email */}
          <div className="group flex flex-col items-center text-center bg-white/5 border border-[var(--border)] rounded-2xl p-8 hover:bg-white/10 hover:border-[var(--accent)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-[var(--border)] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-[var(--accent)] transition-all duration-300 shadow-sm">
              <Mail size={20} className="text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <h3
              className="text-lg font-semibold text-[var(--foreground)] mb-2 tracking-wide"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Email Us
            </h3>
            <p className="text-xs text-[var(--muted)] mb-5 tracking-wide">
              dinushenya891@gmail.com
            </p>
            <a
              href="mailto:dinushenya891@gmail.com"
              className="inline-flex items-center gap-1.5 border border-[var(--border)] text-[var(--foreground)] text-[10px] font-semibold tracking-widest uppercase px-5 py-2 rounded-full hover:bg-[var(--accent)] hover:text-[#0f1115] hover:border-[var(--accent)] transition-all duration-200 shadow-sm"
            >
              Send an Email
            </a>
          </div>

          {/* Card 3: Social */}
          <div className="group flex flex-col items-center text-center bg-white/5 border border-[var(--border)] rounded-2xl p-8 hover:bg-white/10 hover:border-[var(--accent)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-[var(--border)] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-[var(--accent)] transition-all duration-300 shadow-sm">
              <PhoneCall size={20} className="text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <h3
              className="text-lg font-semibold text-[var(--foreground)] mb-2 tracking-wide"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Connect Socially
            </h3>
            <p className="text-sm text-[var(--muted)] mb-5 leading-relaxed">
              Follow us for daily drops and style inspiration!
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=100090141546352"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:bg-white/5 transition-all duration-200"
                aria-label="Facebook"
              >
                <Image src="/icons/facebook.svg" alt="Facebook" width={18} height={18} className="opacity-70 hover:opacity-100" />
              </a>
              <a
                href="https://www.instagram.com/accessories_by_dn_?igsh=bjNqbDV5MHBlOWlt"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:bg-white/5 transition-all duration-200"
                aria-label="Instagram"
              >
                <Image src="/icons/instagram.svg" alt="Instagram" width={18} height={18} className="opacity-70 hover:opacity-100" />
              </a>
              <a
                href="https://www.tiktok.com/@dnfashionjewellery25?_r=1&_t=ZS-972Dv3H8MdD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:bg-white/5 transition-all duration-200"
                aria-label="TikTok"
              >
                <Image src="/icons/tiktok.svg" alt="TikTok" width={18} height={18} className="opacity-70 hover:opacity-100" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}