"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/firebase";
import { collection, doc, runTransaction } from "firebase/firestore";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, cartTotal, deliveryCharge, grandTotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (cart.length === 0 && !loading && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1C1C1E] flex items-center justify-center">
          <svg className="w-6 h-6 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1
          className="text-2xl font-semibold text-[#1C1C1E] tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Your cart is empty
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-[10px] font-semibold tracking-widest uppercase border border-[#1C1C1E] text-[#1C1C1E] px-6 py-2.5 rounded-full hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200"
        >
          Back to Shopping
        </button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in first!");

    setLoading(true);

    try {
      let createdOrderId = "";

      await runTransaction(db, async (transaction) => {
        const productRefs = cart.map((item) => doc(db, "products", item.id));
        const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

        // 1. CHECK IF EVERYTHING IS IN STOCK (Type-safe)
        productDocs.forEach((pDoc, index) => {
          const data = pDoc.data();
          if (!pDoc.exists() || !data) {
            throw new Error("Product does not exist!");
          }
          const currentStock = data.stockQuantity;
          const requestedQty = cart[index].quantity;
          if (currentStock < requestedQty) {
            throw new Error(`Sorry, "${cart[index].name}" is out of stock!`);
          }
        });

        // 2. ALL GOOD! DECREMENT STOCK (Type-safe)
        productDocs.forEach((pDoc, index) => {
          const data = pDoc.data();
          if (data) {
            const newStock = data.stockQuantity - cart[index].quantity;
            transaction.update(pDoc.ref, { stockQuantity: newStock });
          }
        });

        const newOrderRef = doc(collection(db, "orders"));
        createdOrderId = newOrderRef.id;

        transaction.set(newOrderRef, {
          userId: user.uid,
          customerEmail: user.email || "",
          customerName: fullName,
          customerPhone: phone,
          shippingAddress: address,
          items: cart,
          subtotalAmount: cartTotal(),
          deliveryCharge: deliveryCharge(),
          totalAmount: grandTotal(),
          paymentMethod: "Cash on Delivery",
          status: "Pending",
          createdAt: new Date(),
        });
      });

      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: fullName,
            customerEmail: user.email || "",
            shippingAddress: address,
            items: cart,
            subtotalAmount: cartTotal(),
            deliveryCharge: deliveryCharge(),
            totalAmount: grandTotal(),
          }),
        });
      } catch (emailError) {
        console.error("Email failed:", emailError);
      }

      setIsSuccess(true);
      clearCart();
      router.push(`/success?orderId=${createdOrderId}`);
    } catch (error: any) {
      console.error("Checkout failed: ", error);
      alert(error.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  const currentDeliveryCharge = deliveryCharge();

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
            Almost there
          </p>
          <h1
            className="text-3xl font-semibold text-[#1C1C1E] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: Shipping Form */}
          <div className="bg-white border border-[#E0DDD6] rounded-2xl p-8">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
              Step 1
            </p>
            <h2
              className="text-xl font-semibold text-[#1C1C1E] tracking-wide mb-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Delivery Details
            </h2>

            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#888] mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="DN Customer"
                  className="w-full border border-[#E0DDD6] bg-[#FAF9F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#bbb] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#888] mb-1.5">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07X XXX XXXX"
                  className="w-full border border-[#E0DDD6] bg-[#FAF9F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#bbb] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#888] mb-1.5">
                  Delivery Address
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="No 123, Main Street, Colombo 03"
                  className="w-full border border-[#E0DDD6] bg-[#FAF9F7] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#bbb] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200 resize-none"
                />
              </div>

              {/* COD notice */}
              <div className="flex items-center gap-3 bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-[#888]">Payment Method</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">Cash on Delivery (COD)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isSuccess}
                className="w-full bg-[#1C1C1E] text-[#FAF9F7] text-xs font-semibold tracking-widest uppercase py-4 rounded-full hover:bg-[#333] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading || isSuccess
                  ? "Processing Order..."
                  : `Confirm Order — LKR ${grandTotal().toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white border border-[#E0DDD6] rounded-2xl p-8 h-fit">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
              Step 2
            </p>
            <h2
              className="text-xl font-semibold text-[#1C1C1E] tracking-wide mb-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border border-[#E0DDD6] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm font-semibold text-[#1C1C1E] truncate tracking-wide"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#888] tracking-widest uppercase">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1C1C1E] flex-shrink-0">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#E0DDD6] pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#888] tracking-widest uppercase">Subtotal</span>
                <span className="text-sm font-semibold text-[#1C1C1E]">LKR {cartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#888] tracking-widest uppercase">Delivery</span>
                <span className="text-sm font-semibold">
                  {currentDeliveryCharge === 0 ? (
                    <span className="text-[#C9A84C] tracking-wide">FREE</span>
                  ) : (
                    <span className="text-[#1C1C1E]">LKR {currentDeliveryCharge.toLocaleString()}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#E0DDD6] pt-3 mt-1">
                <span
                  className="text-base font-semibold text-[#1C1C1E] tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Total
                </span>
                <span
                  className="text-lg font-semibold text-[#1C1C1E]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  LKR {grandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}