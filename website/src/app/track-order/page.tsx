"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { PackageSearch, ArrowLeft, Clock, CheckCircle2, Truck, Package, X } from "lucide-react";

export default function TrackOrderPage() {
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security check: if somehow a guest lands here, send them away and ask to login
    if (!user) {
      router.push("/");
      setAuthModalOpen(true);
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, router]);

  // Helper for visual status timeline
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "Pending": return { text: "Order Placed", icon: <Clock size={16}/>, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
      case "Processing": return { text: "Packing", icon: <Package size={16}/>, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
      case "Dispatched": return { text: "On the Way", icon: <Truck size={16}/>, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" };
      case "Completed": return { text: "Delivered", icon: <CheckCircle2 size={16}/>, color: "text-green-500 bg-green-500/10 border-green-500/20" };
      case "Cancelled": return { text: "Cancelled", icon: <X size={16}/>, color: "text-red-500 bg-red-500/10 border-red-500/20" };
      default: return { text: status, icon: <Clock size={16}/>, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--muted)] font-medium tracking-widest uppercase text-xs">Loading your history...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <button onClick={() => router.push("/shop")} className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white/5 rounded-xl border border-[var(--border)] shadow-[0_0_15px_var(--accent-glow)]"><PackageSearch className="text-[var(--accent)]" /></div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>Order History</h1>
            <p className="text-xs tracking-widest uppercase text-[var(--muted)] mt-1">Tracking for {user?.email}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass-glow border border-[var(--border)] rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2" style={{ fontFamily: "var(--font-serif)" }}>No orders found</h3>
            <p className="text-[var(--muted)] mb-6">Looks like you haven't placed any orders yet.</p>
            <button onClick={() => router.push("/shop")} className="bg-[var(--accent)] text-[#0f1115] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_var(--accent-glow)]">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const displayInfo = getStatusDisplay(order.status);
              
              return (
                <div key={order.id} className="glass-glow border border-[var(--border)] rounded-2xl p-6 shadow-sm overflow-hidden">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--border)] pb-4 mb-4 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Order ID</p>
                      <p className="font-mono text-sm font-bold text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Placed On</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{order.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Total</p>
                      <p className="text-sm font-bold text-[var(--accent)]">LKR {order.totalAmount.toLocaleString()}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold tracking-wide ${displayInfo.color}`}>
                      {displayInfo.icon}
                      {displayInfo.text}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-[var(--border)]">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-[var(--border)] bg-black/20" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-serif)" }}>{item.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}