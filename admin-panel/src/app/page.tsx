"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useRouter } from "next/navigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { ClipboardList, ShoppingBag, AlertTriangle, Coins, TrendingUp } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, roleCode } = useAdminAuthStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false); // Safeguard against Next.js hydration issues
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    lowStockItems: 0,
  });

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [mostSoldData, setMostSoldData] = useState<any[]>([]);
  const [dailySalesData, setDailySalesData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      let revenue = 0;
      let pendingCount = 0;
      const orderCount = ordersSnapshot.size;

      const allOrders: Order[] = [];
      const productSalesMap: { [key: string]: number } = {};
      const daySalesMap: { [key: string]: number } = {};

      // Initialize the last 7 days with 0 sales for our Bar Chart
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7DaysLabels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = daysOfWeek[d.getDay()];
        last7DaysLabels.push(dayLabel);
        daySalesMap[dayLabel] = 0; // Initialize
      }

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate() || new Date();
        
        const order: Order = {
          id: doc.id,
          customerName: data.customerName,
          totalAmount: data.totalAmount,
          status: data.status,
          items: data.items || [],
          createdAt: data.createdAt,
        };
        allOrders.push(order);

        if (data.status !== "Cancelled") {
          revenue += data.totalAmount;

          // Process Sales Volume Day-by-Day (last 7 days)
          const orderDayLabel = daysOfWeek[orderDate.getDay()];
          if (daySalesMap[orderDayLabel] !== undefined) {
            // Add quantities of items sold on this day
            const totalItemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);
            daySalesMap[orderDayLabel] += totalItemsInOrder;
          }

          // Process Most Sold Items
          order.items.forEach((item: any) => {
            if (productSalesMap[item.name]) {
              productSalesMap[item.name] += item.quantity;
            } else {
              productSalesMap[item.name] = item.quantity;
            }
          });
        }

        if (data.status === "Pending") {
          pendingCount += 1;
        }
      });

      // 2. Fetch Products for Stock Alert
      const productsSnapshot = await getDocs(collection(db, "products"));
      const productCount = productsSnapshot.size;
      let lowStock = 0;
      productsSnapshot.forEach((doc) => {
        if (doc.data().stockQuantity <= 5) {
          lowStock += 1;
        }
      });

      // 3. Process data for charts
      // Most Sold Items (Top 5)
      const formattedMostSold = Object.keys(productSalesMap).map(name => ({
        name: name.length > 15 ? name.slice(0, 15) + "..." : name, // Truncate long names
        qty: productSalesMap[name]
      })).sort((a, b) => b.qty - a.qty).slice(0, 5);

      // Day-by-Day Sales (Ordered chronologically)
      const formattedDailySales = last7DaysLabels.map(day => ({
        day: day,
        itemsSold: daySalesMap[day]
      }));

      // Last 5 Pending Orders
      const pendingList = allOrders
        .filter(o => o.status === "Pending")
        .sort((a, b) => b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime())
        .slice(0, 5);

      setStats({
        totalRevenue: revenue,
        totalOrders: orderCount,
        pendingOrdersCount: pendingCount,
        lowStockItems: lowStock,
      });

      setPendingOrders(pendingList);
      setMostSoldData(formattedMostSold);
      setDailySalesData(formattedDailySales);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Prevents render issues prior to client mounting
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-700 bg-slate-50">Loading Dashboard Analytics...</div>;

  const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

  return (
    <div className="max-w-7xl mx-auto p-8 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Operational KPIs and Sales Volume Analysis</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/orders")} className="bg-white border text-sm shadow-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition active:scale-95">
            Process Orders
          </button>
          <button onClick={() => router.push("/products/add")} className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow transition active:scale-95">
            + Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">LKR {stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Coins size={22} /></div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalOrders}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><ShoppingBag size={22} /></div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.pendingOrdersCount}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600"><ClipboardList size={22} /></div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.lowStockItems}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600"><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* CHARTS GRID (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Chart 1: Daily Volume */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#C9A84C] mb-1">Last 7 Days</p>
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-500" /> Items Sold Day-by-Day
          </h2>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySalesData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#F8FAFC" }} />
                <Bar dataKey="itemsSold" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {dailySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.itemsSold > 0 ? "#3B82F6" : "#E2E8F0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Most Sold Items */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#C9A84C] mb-1">Performance</p>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Best Selling Products (Qty)</h2>
          <div className="w-full h-72">
            {mostSoldData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No sales data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostSoldData} layout="vertical">
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={100} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#F8FAFC" }} />
                  <Bar dataKey="qty" radius={[0, 4, 4, 0]} maxBarSize={25}>
                    {mostSoldData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Last 5 Pending Orders */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-[#C9A84C] mb-1">Fulfillment Task</p>
            <h2 className="text-lg font-bold text-slate-900">Last 5 Pending Orders</h2>
          </div>
          <button 
            onClick={() => router.push("/orders")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage All Orders
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">
            Fantastic! No pending orders remaining to process.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">#{order.id.slice(-6)}</div>
                    </td>
                    <td className="p-4">
                      <ul className="text-xs text-slate-600 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <li key={idx}><span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      LKR {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => router.push("/orders")}
                        className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}