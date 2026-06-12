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
  // NEW: Get deliveryCharge and grandTotal
  const { cart, cartTotal, deliveryCharge, grandTotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (cart.length === 0 && !loading && !isSuccess) {
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
      let createdOrderId = ""; // Variable to hold our new ID

      // START FIRESTORE TRANSACTION
      await runTransaction(db, async (transaction) => {
        const productRefs = cart.map((item) => doc(db, "products", item.id));
        const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
        
        productDocs.forEach((pDoc, index) => {
          if (!pDoc.exists()) throw new Error("Product does not exist!");
          const currentStock = pDoc.data().stockQuantity;
          const requestedQty = cart[index].quantity;
          
          if (currentStock < requestedQty) {
            throw new Error(`Sorry, "${cart[index].name}" is out of stock!`);
          }
        });

        productDocs.forEach((pDoc, index) => {
          const newStock = pDoc.data().stockQuantity - cart[index].quantity;
          transaction.update(pDoc.ref, { stockQuantity: newStock });
        });

        // Create the order and grab the ID!
        const newOrderRef = doc(collection(db, "orders"));
        createdOrderId = newOrderRef.id;

        transaction.set(newOrderRef, {
          userId: user.uid,
          customerEmail: user.email,
          customerName: fullName,
          customerPhone: phone,
          shippingAddress: address,
          items: cart, 
          subtotalAmount: cartTotal(), // NEW: Save subtotal
          deliveryCharge: deliveryCharge(), // NEW: Save delivery charge
          totalAmount: grandTotal(), // UPDATED: Use grandTotal for final amount
          paymentMethod: "Cash on Delivery",
          status: "Pending",
          createdAt: new Date(),
        });
      });
      // END TRANSACTION

      // TRIGGER EMAIL API
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: fullName,
            customerEmail: user.email,
            shippingAddress: address,
            items: cart, // Pass items for email details
            subtotalAmount: cartTotal(), // NEW: Pass subtotal
            deliveryCharge: deliveryCharge(), // NEW: Pass delivery charge
            totalAmount: grandTotal() // NEW: Pass grand total
          }),
        });
      } catch (emailError) {
        console.error("Email failed:", emailError);
      }

      // SUCCESS ROUTING
      setIsSuccess(true);
      clearCart();
      router.push(`/success?orderId=${createdOrderId}`);

    } catch (error: any) {
      console.error("Checkout failed: ", error);
      alert(error.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  const currentDeliveryCharge = deliveryCharge(); // Calculate once for rendering

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

            <button type="submit" disabled={loading || isSuccess} className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition mt-6">
              {loading || isSuccess ? "Processing Order..." : `Confirm Order (LKR ${grandTotal()})`}
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
          
          {/* Subtotal */}
          <div className="border-t pt-4 flex justify-between items-center text-md font-semibold">
            <span>Subtotal:</span>
            <span>LKR {cartTotal()}</span>
          </div>

          {/* Delivery Charge (NEW) */}
          <div className="pt-2 flex justify-between items-center text-md font-semibold">
            <span>Delivery:</span>
            <span>
              {currentDeliveryCharge === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `LKR ${currentDeliveryCharge}`
              )}
            </span>
          </div>

          {/* Grand Total */}
          <div className="border-t mt-4 pt-4 flex justify-between items-center text-lg font-bold text-slate-900">
            <span>Total:</span>
            <span>LKR {grandTotal()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}