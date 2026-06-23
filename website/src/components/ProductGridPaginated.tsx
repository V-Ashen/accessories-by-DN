"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  createdAt: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProductGridPaginated() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("stockQuantity", ">", 0),
          where("isActive", "==", true),
          where("isFeatured", "==", true),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          stockQuantity: doc.data().stockQuantity,
          images: doc.data().images || [],
          isActive: doc.data().isActive,
          createdAt: doc.data().createdAt,
        })) as Product[];
        setProducts(fetched);
      } catch (error) {
        console.error("Error fetching home products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[var(--background)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/5 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[var(--background)] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="trending">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-2" style={{ textShadow: "0 0 10px var(--accent-glow)" }}>Curated picks</p>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--foreground)] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Trending & latest
            </h2>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--foreground)] border-b border-[var(--foreground)] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300 group"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Product grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA — only visible on small screens */}
        <div className="sm:hidden text-center mt-10">
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center justify-center gap-2 w-full bg-white/5 border border-[var(--border)] text-[var(--foreground)] text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-full hover:bg-[var(--accent)] hover:text-[#0f1115] transition-colors shadow-lg"
          >
            View all products
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}