import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminGuard from "@/components/AdminGuard";
import Sidebar from "@/components/Sidebar"; // We will create this next

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Panel | Accessories by DN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <AdminGuard>
          {/* If the guard passes, render the layout */}
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50">
              {children}
            </main>
          </div>
        </AdminGuard>
      </body>
    </html>
  );
}