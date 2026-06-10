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
  const { cart, cartTotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // If cart is empty, don't show the checkout form
  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty!</h1>
        <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in first!");

    setLoading(true);

    try {
      // START FIRESTORE TRANSACTION
      await runTransaction(db, async (transaction) => {
        const productRefs = cart.map((item) => doc(db, "products", item.id));
        
        // 1. READ ALL PRODUCT STOCKS FIRST (Firestore rule: all reads must happen before writes)
        const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
        
        // 2. CHECK IF EVERYTHING IS IN STOCK
        productDocs.forEach((pDoc, index) => {
          if (!pDoc.exists()) throw new Error("Product does not exist!");
          const currentStock = pDoc.data().stockQuantity;
          const requestedQty = cart[index].quantity;
          
          if (currentStock < requestedQty) {
            throw new Error(`Sorry, "${cart[index].name}" is out of stock!`);
          }
        });

        // 3. ALL GOOD! DECREMENT STOCK
        productDocs.forEach((pDoc, index) => {
          const newStock = pDoc.data().stockQuantity - cart[index].quantity;
          transaction.update(pDoc.ref, { stockQuantity: newStock });
        });

        // 4. CREATE THE ORDER DOCUMENT
        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, {
          userId: user.uid,
          customerEmail: user.email,
          customerName: fullName,
          customerPhone: phone,
          shippingAddress: address,
          items: cart, // Save snapshot of the cart
          totalAmount: cartTotal(),
          paymentMethod: "Cash on Delivery",
          status: "Pending", // Admin will update this later
          createdAt: new Date(),
        });
      });
      // END TRANSACTION

      // If we get here, the transaction succeeded!
      alert("Order placed successfully via Cash on Delivery!");
      clearCart();
      router.push("/"); // Send back to home page

    } catch (error: any) {
      console.error("Checkout failed: ", error);
      alert(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Shipping Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Delivery Details</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-slate-900" placeholder="DN Customer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-slate-900" placeholder="07X XXX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Complete Delivery Address</label>
              <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-slate-900" placeholder="No 123, Main Street, Colombo 03" />
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mt-4 text-sm font-medium">
              Payment Method: <strong>Cash on Delivery (COD)</strong>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition mt-6">
              {loading ? "Processing Order..." : `Confirm Order (LKR ${cartTotal()})`}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-white p-8 rounded-xl shadow-sm border h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-slate-900">LKR {item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>LKR {cartTotal()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}