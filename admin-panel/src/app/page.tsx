"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, roleCode } = useAdminAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
     fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders Data
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      let revenue = 0;
      let pending = 0;
      const orderCount = ordersSnapshot.size;

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        // Only count revenue if the order isn't cancelled
        if (data.status !== "Cancelled") {
          revenue += data.totalAmount;
        }
        if (data.status === "Pending") {
          pending += 1;
        }
      });

      // 2. Fetch Products Data
      const productsSnapshot = await getDocs(collection(db, "products"));
      const productCount = productsSnapshot.size;
      let lowStock = 0;

      productsSnapshot.forEach((doc) => {
        if (doc.data().stockQuantity <= 5) {
          lowStock += 1;
        }
      });

      // 3. Update State
      setStats({
        totalRevenue: revenue,
        totalOrders: orderCount,
        pendingOrders: pending,
        totalProducts: productCount,
        lowStockItems: lowStock,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 mt-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.email} (Role {roleCode})</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push("/orders")} className="bg-white border shadow-sm px-4 py-2 rounded-lg font-medium hover:bg-slate-50">
            View Orders
          </button>
          <button onClick={() => router.push("/products/new")} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800">
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-slate-900">LKR {stats.totalRevenue.toLocaleString()}</h3>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.totalOrders}</h3>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Orders</p>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-slate-900">{stats.pendingOrders}</h3>
            {stats.pendingOrders > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</p>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-slate-900">{stats.lowStockItems}</h3>
            {stats.lowStockItems > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                Under 5 units
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Quick Links / Next Steps */}
      {roleCode === 0 && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
          <h4 className="font-bold text-blue-900 mb-2">Master Admin Controls</h4>
          <p className="text-blue-700 text-sm mb-4">You have ultimate authority. Need to update staff permissions?</p>
          <button onClick={() => router.push("/manage-staff")} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm font-medium transition">
            Manage Staff Roles
          </button>
        </div>
      )}

    </div>
  );
}