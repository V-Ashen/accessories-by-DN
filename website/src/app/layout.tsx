import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import MarketingPixels from "@/components/MarketingPixels";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accessories by DN",
  description: "Trendy aesthetic accessories in Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <AuthModal />
          <CartDrawer />
        </AuthProvider>
        <Footer />
        <MarketingPixels />
      </body>
    </html>
  );
}