import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard"; // Still needed by ProductGridPaginated indirectly
import HeroSlider from "@/components/HeroSlider"; // NEW
import ProductGridPaginated from "@/components/ProductGridPaginated"; // NEW
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection"; 
import ContactSection from "@/components/ContactSection";

// No direct getProducts call here anymore, ProductGridPaginated handles it
export default async function ShopHome() {
  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      
      
      {/* 1. Hero Section (with Moving Banners & Catchphrase) */}
      <HeroSlider />

      {/* 1.1. Trending & Latest Items (Paginated) */}
      <ProductGridPaginated />

      {/* 2. Services Section (Why Choose Us & Reviews) */}
      <ServicesSection />

      {/* 3. About Section (Our Story & Policies) */}
      <AboutSection /> 

      {/* 4. Contact Section */}
      <ContactSection /> 

    </main>
  );
}