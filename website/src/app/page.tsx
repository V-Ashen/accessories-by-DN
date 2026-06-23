import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard"; // Still needed by ProductGridPaginated indirectly
import HeroSlider from "@/components/HeroSlider"; // NEW
import ProductGridPaginated from "@/components/ProductGridPaginated"; // NEW
import ServicesSection from "@/components/ServicesSection";

// No direct getProducts call here anymore, ProductGridPaginated handles it
export default async function ShopHome() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      
      
      {/* 1. Hero Section (with Moving Banners & Catchphrase) */}
      <HeroSlider />

      {/* 1.1. Trending & Latest Items (Paginated) */}
      <ProductGridPaginated />

      {/* 2. Services Section (Why Choose Us & Reviews) */}
      <ServicesSection />

    </main>
  );
}