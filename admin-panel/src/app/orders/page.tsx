"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: any[];
  createdAt: any;
}

// THIS LINE IS CRITICAL:
export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      alert(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading Orders...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Order Management</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border text-center text-slate-500">
          No orders have been placed yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-sm border-b text-slate-600">
                  <th className="p-4 font-semibold">Date / ID</th>
                  <th className="p-4 font-semibold">Customer Details</th>
                  <th className="p-4 font-semibold">Items Ordered</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900">{formatDate(order.createdAt)}</div>
                      <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                        #{order.id.slice(-6)}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-sm text-slate-600 mt-1">{order.customerPhone}</div>
                      <div className="text-sm text-slate-500 mt-1 max-w-[200px] truncate">
                        {order.shippingAddress}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <ul className="text-sm text-slate-700 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="font-bold text-slate-900">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 align-top font-bold text-slate-900">
                      LKR {order.totalAmount}
                      <div className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}