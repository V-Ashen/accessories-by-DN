"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { db, auth } from "@/lib/firebase"; // Make sure auth is imported!
import { collection, doc, runTransaction, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth"; // For inline registration
import { Landmark, CreditCard, Banknote, Upload } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, cartTotal, deliveryCharge, grandTotal, clearCart } = useCartStore();

  // --- Shipping & Guest States ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // Required for guests/receipts
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // --- Account Creation States ---
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Payment Method States ---
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "bank" | "card"
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cardNumber, setCardCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Auto-fill email if user is already logged in
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  if (cart.length === 0 && !loading && !isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-[var(--border)] flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)]">
          <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>Your cart is empty</h1>
        <button onClick={() => router.push("/")} className="text-[10px] font-semibold tracking-widest uppercase border border-[var(--border)] text-[var(--foreground)] px-6 py-2.5 rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200">Back to Shopping</button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Payment Validation
    if (paymentMethod === "bank" && !receiptFile) return alert("Please upload your bank receipt slip!");
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) return alert("Please fill in all credit card details!");

    setLoading(true);

    try {
      let currentUid = user?.uid || "guest";
      let currentEmail = email.trim();
      let createdOrderId = "";

      // --- INLINE ACCOUNT CREATION LOGIC ---
      if (!user && createAccount) {
        if (password.length < 6) {
          setLoading(false);
          return alert("Password must be at least 6 characters.");
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, currentEmail, password);
          currentUid = userCredential.user.uid;
          await setDoc(doc(db, "users", currentUid), {
            uid: currentUid,
            email: currentEmail,
            displayName: fullName,
            roleCode: 99, 
            createdAt: new Date()
          });
        } catch (authError: any) {
          setLoading(false);
          return alert(`Account creation failed: ${authError.message}`);
        }
      }

      // --- TRANSACTION LOGIC ---
      await runTransaction(db, async (transaction) => {
        const productRefs = cart.map((item) => doc(db, "products", item.id));
        const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

        // Type-safe stock checking
        productDocs.forEach((pDoc, index) => {
          const data = pDoc.data();
          if (!pDoc.exists() || !data) throw new Error("Product does not exist!");
          if (data.stockQuantity < cart[index].quantity) {
            throw new Error(`Sorry, "${cart[index].name}" is out of stock!`);
          }
        });

        // Type-safe stock decrement
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
          userId: currentUid,
          customerEmail: currentEmail,
          customerName: fullName,
          customerPhone: phone,
          shippingAddress: address,
          items: cart,
          subtotalAmount: cartTotal(),
          deliveryCharge: deliveryCharge(),
          totalAmount: grandTotal(),
          paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bank" ? "Bank Transfer" : "Card Payment",
          status: "Pending",
          createdAt: new Date(),
        });
      });

      // --- EMAIL TRIGGER ---
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: fullName,
            customerEmail: currentEmail,
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
    <div className="min-h-screen bg-[var(--background)] py-16 px-4 sm:px-6 lg:px-8 text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto">

        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>Almost there</p>
          <h1 className="text-3xl font-semibold text-[var(--foreground)] tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: Shipping & Payment Form */}
          <div className="glass-glow border border-[var(--border)] rounded-2xl p-8 space-y-8">
            
            {/* Step 1: Delivery Details */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1">Step 1</p>
              <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-wide mb-6" style={{ fontFamily: "var(--font-serif)" }}>Delivery Details</h2>

              <form onSubmit={handleCheckout} className="space-y-4">
                
                {/* RESTORED: Email Field for guests/receipts */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">Email Address</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!user} // Locked if logged in
                    placeholder="you@example.com"
                    className={`w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 ${user ? 'bg-white/5 text-[var(--muted)]' : 'bg-transparent'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">Full Name</label>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="DN Customer" className="w-full border border-[var(--border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">Phone Number</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07X XXX XXXX" className="w-full border border-[var(--border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200" />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">Delivery Address</label>
                  <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="No 123, Main Street, Colombo 03" className="w-full border border-[var(--border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 resize-none" />
                </div>

                {/* RESTORED: CREATE ACCOUNT WIDGET (GUESTS ONLY) */}
                {!user && (
                  <div className="bg-white/5 border border-[var(--border)] rounded-xl p-4 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={createAccount} 
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="w-4 h-4 text-[var(--accent)] bg-transparent rounded border-[var(--border)] focus:ring-[var(--accent)]"
                      />
                      <span className="text-sm font-semibold text-[var(--foreground)]">Create an Account</span>
                    </label>
                    
                    {createAccount && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">Create Password</label>
                        <input
                          type="password" required={createAccount} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full border border-[var(--border)] bg-black/20 rounded-lg px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-[var(--muted)] mt-3 italic">*only registered users can track their order</p>
                  </div>
                )}
              </form>
            </div>

            {/* Step 2: Payment Selector */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1">Step 2</p>
              <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-wide mb-6" style={{ fontFamily: "var(--font-serif)" }}>Payment Method</h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <button type="button" onClick={() => setPaymentMethod("cod")} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${paymentMethod === "cod" ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_10px_var(--accent-glow)]" : "border-[var(--border)] hover:bg-white/5"}`}>
                  <Banknote size={20} className={paymentMethod === "cod" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-2">COD</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod("bank")} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${paymentMethod === "bank" ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_10px_var(--accent-glow)]" : "border-[var(--border)] hover:bg-white/5"}`}>
                  <Landmark size={20} className={paymentMethod === "bank" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Bank</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod("card")} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${paymentMethod === "card" ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_10px_var(--accent-glow)]" : "border-[var(--border)] hover:bg-white/5"}`}>
                  <CreditCard size={20} className={paymentMethod === "card" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Card</span>
                </button>
              </div>

              {/* Dynamic Payment Details Display */}
              {paymentMethod === "cod" && (
                <div className="flex items-center gap-3 bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm"><Banknote size={16} className="text-[var(--accent)]" /></div>
                  <div><p className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted)]">Cash on Delivery</p><p className="text-xs text-[var(--foreground)]">Pay with cash upon delivery to your doorstep.</p></div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-white/5 border border-[var(--border)] rounded-xl p-4 text-xs space-y-1.5 text-[var(--muted)]">
                    <p className="font-bold text-[var(--foreground)] text-sm mb-1">Accessories by DN Bank Details:</p>
                    <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                    <p><strong>Branch:</strong> Mirihana Branch</p>
                    <p><strong>Account Name:</strong> D. N. Accessories (Pvt) Ltd</p>
                    <p><strong>Account Number:</strong> 811061864234</p>
                  </div>
                  <div className="border border-dashed border-[var(--border)] rounded-xl p-4 bg-transparent flex flex-col items-center justify-center hover:border-[var(--accent)] transition-colors cursor-pointer group">
                    <input type="file" id="receipt" className="hidden" accept="image/*" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} />
                    <label htmlFor="receipt" className="flex flex-col items-center cursor-pointer w-full h-full">
                      <Upload size={24} className="text-[var(--muted)] mb-2 group-hover:text-[var(--accent)] transition-colors" />
                      <span className="text-xs font-bold text-[var(--foreground)]">{receiptFile ? receiptFile.name : "Upload Bank Slip / Receipt"}</span>
                      <span className="text-[10px] text-[var(--muted)] mt-1">PNG, JPG, PDF up to 5MB</span>
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-3 bg-white/5 border border-[var(--border)] rounded-xl p-4 animate-in fade-in duration-200">
                  <p className="font-bold text-[var(--foreground)] text-sm mb-2">Credit / Debit Card</p>
                  <div className="space-y-3">
                    <input type="text" placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full border border-[var(--border)] bg-transparent rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]" />
                    <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardCardNumber(e.target.value)} className="w-full border border-[var(--border)] bg-transparent rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="border border-[var(--border)] bg-transparent rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]" />
                      <input type="text" placeholder="CVC" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="border border-[var(--border)] bg-transparent rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)]" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || isSuccess}
              className="w-full bg-[var(--accent)] text-[#0f1115] text-xs font-semibold tracking-widest uppercase py-4 rounded-full hover:bg-white active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_var(--accent-glow)]"
            >
              {loading || isSuccess ? "Processing Order..." : `Confirm Order — LKR ${grandTotal().toLocaleString()}`}
            </button>

          </div>

          {/* Right: Order Summary */}
          <div className="glass-glow border border-[var(--border)] rounded-2xl p-8 h-fit">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-1">Step 3</p>
            <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-wide mb-6" style={{ fontFamily: "var(--font-serif)" }}>Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white/5 border border-[var(--border)] rounded-xl p-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-[var(--border)] flex-shrink-0 bg-black/20" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] truncate tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>{item.name}</h4>
                    <p className="text-[11px] text-[var(--muted)] tracking-widest uppercase">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)] flex-shrink-0">LKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs text-[var(--muted)] tracking-widest uppercase">Subtotal</span><span className="text-sm font-semibold text-[var(--foreground)]">LKR {cartTotal().toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-[var(--muted)] tracking-widest uppercase">Delivery</span><span className="text-sm font-semibold">{currentDeliveryCharge === 0 ? <span className="text-[var(--accent)] tracking-wide" style={{ textShadow: "0 0 5px var(--accent-glow)" }}>FREE</span> : <span className="text-[var(--foreground)]">LKR {currentDeliveryCharge.toLocaleString()}</span>}</span></div>
              <div className="flex justify-between items-center border-t border-[var(--border)] pt-3 mt-1"><span className="text-base font-semibold text-[var(--foreground)] tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>Total</span><span className="text-lg font-semibold text-[var(--accent)]" style={{ fontFamily: "var(--font-serif)" }}>LKR {grandTotal().toLocaleString()}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}