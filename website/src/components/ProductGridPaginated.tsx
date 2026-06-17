"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  createdAt: any;
}

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
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-100 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8" id="trending">

      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Curated picks</p>
          <h2 className="text-2xl font-medium text-slate-900">Trending & latest</h2>
        </div>
        <button
          onClick={() => router.push("/shop")}
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition"
        >
          View all
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile CTA — only visible on small screens */}
      <div className="sm:hidden text-center mt-10">
        <button
          onClick={() => router.push("/shop")}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-[13px] font-medium py-2.5 px-6 rounded-full hover:bg-slate-700 active:scale-95 transition"
        >
          View all products
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  );
}