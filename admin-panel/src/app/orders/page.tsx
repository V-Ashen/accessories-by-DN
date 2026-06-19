"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Eye, X, MapPin, Package, CreditCard, Calendar } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotalAmount?: number;
  deliveryCharge?: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
  createdAt: any;
}

const STATUS_TABS = ["All", "Pending", "Processing", "Dispatched", "Completed", "Cancelled"];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-GB", { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // --- Search & Filter Logic ---
  const filteredOrders = orders.filter((order) => {
    // 1. Check Tab Status
    const matchesTab = activeTab === "All" || order.status === activeTab;
    
    // 2. Check Search Query (ID, Name, or Phone)
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Orders...</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-8 mt-4 text-slate-800">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Order Management</h1>
        <p className="text-sm text-slate-500 mt-1">Process and track customer fulfillments.</p>
      </div>

      {/* --- Filter & Search Toolbar --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E0DDD6] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab 
                  ? "bg-[#1C1C1E] text-[#C9A84C]" 
                  : "bg-[#FAF9F7] text-slate-600 hover:bg-[#F0EDE6] border border-[#E0DDD6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Name, Phone, or Order ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF9F7] border border-[#E0DDD6] rounded-full text-sm outline-none focus:border-[#C9A84C] focus:bg-white transition"
          />
        </div>
      </div>

      {/* --- Simplified Orders Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E0DDD6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F7] text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-[#E0DDD6]">
                <th className="p-5">Order ID & Date</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Total</th>
                <th className="p-5">Update Status</th>
                <th className="p-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DDD6] text-sm">
              {paginatedOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">No orders found matching your criteria.</td></tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F7] transition">
                    
                    <td className="p-5 align-middle">
                      <div className="font-bold text-[#1C1C1E] uppercase tracking-wider">#{order.id.slice(-8)}</div>
                      <div className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</div>
                    </td>

                    <td className="p-5 align-middle">
                      <div className="font-bold text-[#1C1C1E]">{order.customerName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.customerPhone}</div>
                    </td>

                    <td className="p-5 align-middle">
                      <div className="font-bold text-[#1C1C1E]">LKR {order.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-[#C9A84C] mt-1 uppercase tracking-wider">
                        {order.paymentMethod === "Cash on Delivery" ? "COD" : order.paymentMethod}
                      </div>
                    </td>

                    <td className="p-5 align-middle w-48">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`w-full border rounded-lg p-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition ${
                          order.status === 'Pending' ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'Dispatched' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-green-50 text-green-700 border-green-200' // Completed
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-5 align-middle text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF9F7] hover:bg-[#1C1C1E] hover:text-[#C9A84C] text-[#1C1C1E] border border-[#E0DDD6] text-xs font-bold rounded-lg transition"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#E0DDD6] bg-white gap-4">
            <span className="text-xs font-semibold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E0DDD6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAF9F7] text-[#1C1C1E] transition"
              >
                Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                      currentPage === page 
                        ? "bg-[#1C1C1E] text-[#C9A84C]" 
                        : "text-slate-600 hover:bg-[#FAF9F7]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E0DDD6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAF9F7] text-[#1C1C1E] transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#E0DDD6] bg-[#FAF9F7]">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C]">Order Details</p>
                <h2 className="text-xl font-extrabold text-[#1C1C1E] uppercase">#{selectedOrder.id.slice(-8)}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white border border-[#E0DDD6] rounded-full text-slate-400 hover:text-[#1C1C1E] shadow-sm transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              
              {/* Top Row: Customer & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Shipping Card */}
                <div className="p-5 rounded-2xl border border-[#E0DDD6] bg-[#FAF9F7]">
                  <div className="flex items-center gap-2 mb-4 text-[#1C1C1E]">
                    <MapPin size={18} className="text-[#C9A84C]" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Shipping Info</h3>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><strong className="text-[#1C1C1E]">Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong className="text-[#1C1C1E]">Phone:</strong> {selectedOrder.customerPhone}</p>
                    <p><strong className="text-[#1C1C1E]">Email:</strong> {selectedOrder.customerEmail || "N/A"}</p>
                    <p className="pt-2 mt-2 border-t border-[#E0DDD6]">
                      <strong className="block text-[#1C1C1E] mb-1">Address:</strong> 
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>

                {/* Order Meta Card */}
                <div className="p-5 rounded-2xl border border-[#E0DDD6] bg-[#FAF9F7]">
                  <div className="flex items-center gap-2 mb-4 text-[#1C1C1E]">
                    <Calendar size={18} className="text-[#C9A84C]" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Order Meta</h3>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between items-center pb-2 border-b border-[#E0DDD6]">
                      <span>Date Placed:</span>
                      <span className="font-medium text-[#1C1C1E]">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#E0DDD6]">
                      <span>Payment Method:</span>
                      <span className="font-medium text-[#1C1C1E] flex items-center gap-1">
                        <CreditCard size={14} /> {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Current Status:</span>
                      <span className="font-bold text-[#1C1C1E] uppercase">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-[#1C1C1E]">
                  <Package size={18} className="text-[#C9A84C]" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Purchased Items</h3>
                </div>
                
                <div className="border border-[#E0DDD6] rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF9F7] border-b border-[#E0DDD6] text-xs text-slate-500 uppercase">
                      <tr>
                        <th className="p-4">Item</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0DDD6]">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF9F7]">
                          <td className="p-4 flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-[#E0DDD6]" />
                            <span className="font-bold text-[#1C1C1E] text-sm">{item.name}</span>
                          </td>
                          <td className="p-4 text-center font-medium text-slate-600">{item.quantity}</td>
                          <td className="p-4 text-right font-medium text-[#1C1C1E]">LKR {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 flex justify-end">
                <div className="w-full sm:w-1/2 p-5 bg-[#FAF9F7] rounded-2xl border border-[#E0DDD6] space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span>LKR {selectedOrder.subtotalAmount?.toLocaleString() || selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 pb-3 border-b border-[#E0DDD6]">
                    <span>Delivery Charge:</span>
                    <span>{selectedOrder.deliveryCharge === 0 ? "FREE" : `LKR ${selectedOrder.deliveryCharge || 0}`}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-[#1C1C1E] uppercase tracking-wider">Grand Total:</span>
                    <span className="text-xl font-extrabold text-[#C9A84C]">LKR {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}