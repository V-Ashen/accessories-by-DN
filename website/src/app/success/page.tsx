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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-8 text-center border">
        
        {/* Success Checkmark Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for shopping with Accessories by DN. We have received your Cash on Delivery order and are getting it ready.
        </p>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8">
          <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Your Tracking Number</p>
          <p className="text-2xl font-mono font-bold text-slate-900 tracking-widest">
            {orderId.slice(-8).toUpperCase()}
          </p>
        </div>

        <p className="text-sm text-slate-500 mb-8">
          We have sent a confirmation email with your order details. Our team will contact you shortly to verify delivery.
        </p>

        <button 
          onClick={() => router.push("/")}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition"
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">
          Loading order details...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}