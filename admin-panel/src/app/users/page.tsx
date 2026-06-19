"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, History, UserCheck, UserMinus, Package, Users, UserPlus, ShoppingBag, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: any;
  userId: string;
}

interface CustomerProfile {
  email: string;
  name: string;
  isRegistered: boolean;
  totalSpent: number;
  orderCount: number;
  orders: Order[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
}) => (
  <div className="bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-4 hover:shadow-md transition duration-300">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-[#C9A84C] font-medium uppercase tracking-wide">{label}</p>
      <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-[#E0DDD6] flex items-center justify-center">
        <Icon size={15} className="text-[#1C1C1E]" />
      </div>
    </div>
    <p className="text-2xl font-semibold text-[#1C1C1E]">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{sub}</p>
  </div>
);

const CustomerTable = ({ data }: { data: CustomerProfile[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-[#E0DDD6] bg-[#FAF9F7]">
          <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
          <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
          <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lifetime spent</th>
          <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">History</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E0DDD6]">
        {data.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
              No customers found.
            </td>
          </tr>
        ) : (
          data.map((c, idx) => (
            <tr key={idx} className="hover:bg-[#FAF9F7] transition-colors">
              {/* Customer */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${
                      c.isRegistered
                        ? "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {c.isRegistered ? getInitials(c.name) : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1E]">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-3.5">
                {c.isRegistered ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                    <UserCheck size={11} />
                    Registered
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    <UserMinus size={11} />
                    Guest
                  </span>
                )}
              </td>

              {/* Orders */}
              <td className="px-5 py-3.5 text-center text-sm font-medium text-slate-700">
                {c.orderCount}
              </td>

              {/* Lifetime spent */}
              <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#1C1C1E] tabular-nums">
                LKR {c.totalSpent.toLocaleString()}
              </td>

              {/* History */}
              <td className="px-5 py-3.5 text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      disabled={c.orders.length === 0}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E0DDD6] text-slate-600 hover:bg-[#1C1C1E] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <History size={13} />
                      View
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base font-semibold">
                        Order history — {c.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                      {c.orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                        >
                          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold uppercase text-slate-700">
                                #{order.id.slice(-8)}
                              </span>
                              <span className="text-xs text-slate-400">
                                {order.createdAt?.toDate().toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                order.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                  <Package size={13} className="text-slate-400" />
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-medium text-slate-800 tabular-nums">
                                  LKR {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 text-right text-sm font-semibold text-slate-900 tabular-nums">
                            Total: LKR {order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default function UsersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "registered" | "guests">("all");

  useEffect(() => {
    fetchAllCustomerData();
  }, []);

  const fetchAllCustomerData = async () => {
    try {
      const usersQ = query(collection(db, "users"), where("roleCode", "==", 99));
      const usersSnap = await getDocs(usersQ);

      const ordersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const ordersSnap = await getDocs(ordersQ);
      const allOrders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];

      const customerMap = new Map<string, CustomerProfile>();

      usersSnap.forEach((doc) => {
        const data = doc.data();
        customerMap.set(data.email, {
          email: data.email,
          name: data.displayName || "Unknown",
          isRegistered: true,
          totalSpent: 0,
          orderCount: 0,
          orders: [],
        });
      });

      allOrders.forEach((order) => {
        const email = order.customerEmail;
        if (!email) return;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: order.customerName,
            isRegistered: false,
            totalSpent: 0,
            orderCount: 0,
            orders: [],
          });
        }
        const profile = customerMap.get(email)!;
        profile.orders.push(order);
        if (order.status !== "Cancelled") {
          profile.totalSpent += order.totalAmount;
          profile.orderCount += 1;
        }
      });

      const finalCustomers = Array.from(customerMap.values()).sort(
        (a, b) => b.totalSpent - a.totalSpent
      );
      setCustomers(finalCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const registered = filtered.filter((c) => c.isRegistered);
  const guests = filtered.filter((c) => !c.isRegistered);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const tableData = activeTab === "all" ? filtered : activeTab === "registered" ? registered : guests;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">
        Compiling customer data…
      </div>
    );

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Customers</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track registered users and guest buyers with their lifetime spending.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total customers" value={customers.length} sub="All time" icon={Users} />
        <StatCard label="Registered" value={customers.filter((c) => c.isRegistered).length} sub="With account" icon={UserPlus} />
        <StatCard label="Guest buyers" value={customers.filter((c) => !c.isRegistered).length} sub="No account" icon={ShoppingBag} />
        <StatCard
          label="Total revenue"
          value={`LKR ${(totalRevenue / 1000).toFixed(0)}k`}
          sub="Lifetime"
          icon={Wallet}
        />
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#E0DDD6] rounded-xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E0DDD6] flex-wrap">
          <p className="text-sm font-bold text-[#1C1C1E] uppercase tracking-wider">Customer database</p>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-[#E0DDD6] rounded-lg bg-[#FAF9F7] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] w-56 transition"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-5 border-b border-[#E0DDD6]">
          {(
            [
              { key: "all", label: `All buyers`, count: filtered.length },
              { key: "registered", label: "Registered", count: registered.length },
              { key: "guests", label: "Guest checkouts", count: guests.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#C9A84C] text-[#C9A84C]"
                  : "border-transparent text-slate-500 hover:text-[#1C1C1E]"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.key
                    ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <CustomerTable data={tableData} />
      </div>
    </div>
  );
}