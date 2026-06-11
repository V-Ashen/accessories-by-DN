"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ShoppingCart, Tag, Users, ShieldAlert, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission, roleCode } = useAdminAuthStore();

  if (pathname === "/login") return null;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/", permission: "view dashboard" },
    { name: "Orders & Billing", icon: ShoppingCart, path: "/orders", permission: "manage orders" },
    { name: "Products", icon: Tag, path: "/products", permission: "manage products" },
    { name: "Manage Staff", icon: Users, path: "/manage-staff", permission: "manage staff" },
    { name: "Roles & Perms", icon: ShieldAlert, path: "/roles", permission: "manage roles" },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-slate-300 h-full flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight"><span className="text-blue-500">Admin</span>Panel</h1>
        <p className="text-xs mt-2 text-slate-400 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          // Only show item if user has the permission OR is Master Admin (roleCode 0)
          if (roleCode === 0 || hasPermission(item.permission)) {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
                }`}>
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          }
          return null; // Don't render if no permission
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}