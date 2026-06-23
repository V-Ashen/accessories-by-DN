"use client";

import { useEffect, useState, Suspense } from "react"; // 1. Added Suspense
import { useRouter, useSearchParams } from "next/navigation";

// 2. Extract the actual success UI content into its own component
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      setOrderId(id);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
      <div className="glass-glow max-w-lg w-full rounded-2xl shadow-sm p-8 md:p-12 text-center border border-[var(--border)]">
        
        {/* Success Checkmark Icon */}
        <div className="w-20 h-20 bg-white/5 border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_var(--accent-glow)]">
          <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 
          className="text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-4 tracking-wide"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Order Confirmed
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8 leading-relaxed">
          Thank you for shopping with Accessories by DN. We have received your order and are getting it beautifully packaged for you.
        </p>

        <div className="bg-white/5 py-6 px-4 rounded-xl border border-[var(--border)] mb-8">
          <p className="text-[10px] text-[var(--accent)] uppercase tracking-[0.2em] font-semibold mb-2" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>Your Tracking Number</p>
          <p className="text-2xl font-mono font-bold text-[var(--foreground)] tracking-widest">
            {orderId.slice(-8).toUpperCase()}
          </p>
        </div>

        <p className="text-xs text-[var(--muted)] mb-10 leading-relaxed">
          We have sent a confirmation email with your order details. Our team will contact you shortly to verify delivery.
        </p>

        <button 
          onClick={() => router.push("/")}
          className="w-full bg-[var(--accent)] text-[#0f1115] text-xs font-bold uppercase tracking-widest py-4 rounded-full hover:bg-white transition shadow-[0_0_15px_var(--accent-glow)]"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// 3. Export the main page component wrapped in a Suspense Boundary
export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Loading order details...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}