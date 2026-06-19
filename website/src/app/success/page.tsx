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
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-sm p-8 md:p-12 text-center border border-[#E0DDD6]">
        
        {/* Success Checkmark Icon */}
        <div className="w-20 h-20 bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <svg className="w-10 h-10 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 
          className="text-3xl md:text-4xl font-semibold text-[#1C1C1E] mb-4 tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Order Confirmed
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Thank you for shopping with Accessories by DN. We have received your order and are getting it beautifully packaged for you.
        </p>

        <div className="bg-[#FAF9F7] py-6 px-4 rounded-xl border border-[#E0DDD6] mb-8">
          <p className="text-[10px] text-[#C9A84C] uppercase tracking-[0.2em] font-semibold mb-2">Your Tracking Number</p>
          <p className="text-2xl font-mono font-bold text-[#1C1C1E] tracking-widest">
            {orderId.slice(-8).toUpperCase()}
          </p>
        </div>

        <p className="text-xs text-slate-400 mb-10 leading-relaxed">
          We have sent a confirmation email with your order details. Our team will contact you shortly to verify delivery.
        </p>

        <button 
          onClick={() => router.push("/")}
          className="w-full bg-[#1C1C1E] text-[#C9A84C] text-xs font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#2A2A2E] transition shadow-md"
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
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Loading order details...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}