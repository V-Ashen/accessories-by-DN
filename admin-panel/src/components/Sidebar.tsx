"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Tag, 
  Users, // For Customers
  UserCog, // For Manage Staff
  ShieldAlert, 
  LogOut,
  Hexagon // Logo icon
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission, roleCode } = useAdminAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending orders count for the badge
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("status", "==", "Pending"));
        const snapshot = await getDocs(q);
        setPendingCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching pending orders", error);
      }
    };
    if (user) fetchPendingOrders();
  }, [user]);

  if (pathname === "/login") return null;

  // Helper to get role name for the profile card
  const getRoleName = (code: number | null) => {
    if (code === 0) return "Master Admin";
    if (code === 1) return "Admin";
    if (code === 2) return "Staff";
    return "User";
  };

  const mainLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/", permission: "view dashboard", isNew: true },
    { name: "Orders & Billing", icon: ShoppingCart, path: "/orders", permission: "manage orders", badge: pendingCount },
    { name: "Products", icon: Tag, path: "/products", permission: "manage products" },
  ];

  const managementLinks = [
    { name: "Customers", icon: Users, path: "/users", permission: "view dashboard" }, // New Users Page
    { name: "Manage Staff", icon: UserCog, path: "/manage-staff", permission: "manage staff" },
    { name: "Roles & Perms", icon: ShieldAlert, path: "/roles", permission: "manage roles" },
  ];

  return (
    <div className="w-72 bg-[#0B1121] text-slate-400 h-full flex flex-col border-r border-slate-800/50 font-sans">
      
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 text-white mb-6">
          <div className="bg-[#5A52FF] p-1.5 rounded-lg">
            <Hexagon size={20} className="fill-white/20" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AdminPanel</h1>
        </div>

        {/* User Profile Card */}
        <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5A52FF] flex items-center justify-center text-white font-bold shadow-inner">
            {user?.email?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.email}</p>
            <p className="text-xs text-slate-500">{getRoleName(roleCode)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-6">
        
        {/* MAIN SECTION */}
        <div>
          <p className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-600 mb-3">MAIN</p>
          <div className="space-y-1">
            {mainLinks.map((item) => {
              if (roleCode === 0 || hasPermission(item.permission)) {
                const isActive = pathname === item.path || (item.path === "/products" && pathname.startsWith("/products"));
                return (
                  <Link key={item.name} href={item.path}>
                    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive ? "bg-[#5A52FF] text-white shadow-md shadow-[#5A52FF]/20" : "hover:bg-slate-800/50 hover:text-slate-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      {item.isNew && isActive && (
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">New</span>
                      )}
                      {item.badge && item.badge > 0 ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* MANAGEMENT SECTION */}
        <div>
          <p className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-600 mb-3">MANAGEMENT</p>
          <div className="space-y-1">
            {managementLinks.map((item) => {
              if (roleCode === 0 || hasPermission(item.permission)) {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.name} href={item.path}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive ? "bg-[#5A52FF] text-white shadow-md shadow-[#5A52FF]/20" : "hover:bg-slate-800/50 hover:text-slate-200"
                    }`}>
                      <item.icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 px-3 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}