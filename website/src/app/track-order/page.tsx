"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { PackageSearch, ArrowLeft, Clock, CheckCircle2, Truck, Package } from "lucide-react";

export default function TrackOrderPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security check: if somehow a guest lands here, send them away
    if (!user) {
      router.push("/");
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
      case "Pending": return { text: "Order Placed", icon: <Clock size={16}/>, color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
      case "Processing": return { text: "Packing", icon: <Package size={16}/>, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "Dispatched": return { text: "On the Way", icon: <Truck size={16}/>, color: "text-purple-600 bg-purple-50 border-purple-200" };
      case "Completed": return { text: "Delivered", icon: <CheckCircle2 size={16}/>, color: "text-green-600 bg-green-50 border-green-200" };
      case "Cancelled": return { text: "Cancelled", icon: <X size={16}/>, color: "text-red-600 bg-red-50 border-red-200" };
      default: return { text: status, icon: <Clock size={16}/>, color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your history...</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <button onClick={() => router.push("/shop")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition">
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-[#E0DDD6]"><PackageSearch className="text-[#C9A84C]" /></div>
          <div>
            <h1 className="text-3xl font-semibold text-[#1C1C1E]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Order History</h1>
            <p className="text-xs tracking-widest uppercase text-[#888] mt-1">Tracking for {user?.email}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-[#E0DDD6] rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <button onClick={() => router.push("/shop")} className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const displayInfo = getStatusDisplay(order.status);
              
              return (
                <div key={order.id} className="bg-white border border-[#E0DDD6] rounded-2xl p-6 shadow-sm overflow-hidden">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E0DDD6] pb-4 mb-4 gap-4">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#888]">Order ID</p>
                      <p className="font-mono text-sm font-bold text-[#1C1C1E]">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#888]">Placed On</p>
                      <p className="text-sm font-semibold text-[#1C1C1E]">{order.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#888]">Total</p>
                      <p className="text-sm font-bold text-[#C9A84C]">LKR {order.totalAmount.toLocaleString()}</p>
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
                      <div key={idx} className="flex items-center gap-4 bg-[#FAF9F7] p-3 rounded-xl border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#1C1C1E]">{item.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#888] mt-0.5">Qty: {item.quantity}</p>
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