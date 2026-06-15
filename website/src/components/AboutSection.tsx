"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: About Text & Policies */}
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Story & Commitment</h2>
          <p className="text-base text-slate-600 mb-6 leading-relaxed text-justify">
            Accessories by DN was born from a passion for bringing the most elegant, trend-setting fashion jewellery to Sri Lanka. We believe that accessories are more than just additions to an outfit; they are expressions of individuality, confidence, and personal style. Our mission is to offer a curated selection of highly aesthetic and affordable pieces that empower you to shine.
          </p>
          <p className="text-base text-slate-600 mb-8 leading-relaxed text-justify">
            Every single item in our collection is hand-picked to ensure it meets our rigorous standards of quality and durability. We are committed to providing you with a frictionless shopping experience, from browsing our collections to receiving your secure delivery at your doorstep.
          </p>
          
          {/* Highlighted Policy Section */}
          <h3 className="font-bold text-xl text-slate-900 mb-4">Our Trust Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Transparent Pricing</h4>
                <p className="text-xs text-slate-500">No hidden costs. What you see is what you pay.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Secure COD</h4>
                <p className="text-xs text-slate-500">Cash on Delivery, handled with absolute care.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Hassle-Free Returns</h4>
                <p className="text-xs text-slate-500">Easy exchange policy for total peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Privacy Guaranteed</h4>
                <p className="text-xs text-slate-500">Your personal and shipping data is fully secured.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Brand Image (renders from your website/public/about-us.jpg) */}
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-100">
          <Image
            src="/about-us.jpg" 
            alt="About Accessories by DN"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={false}
          />
        </div>

      </div>
    </section>
  );
}