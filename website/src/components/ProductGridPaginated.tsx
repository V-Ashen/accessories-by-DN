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
    // Only load exactly 4 items for the Home Page
    const fetchHomeProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("stockQuantity", ">", 0),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(4) // Strictly limited to 4
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          stockQuantity: doc.data().stockQuantity,
          images: doc.data().images || [],
          isActive: doc.data().isActive,
          createdAt: doc.data().createdAt
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

  if (loading) return <p className="text-center text-slate-500 py-10">Loading trending items...</p>;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8" id="trending">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Trending & Latest Items</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Redirect Button to Shop Page */}
      <div className="text-center mt-12">
        <button 
          onClick={() => router.push("/shop")} 
          className="bg-slate-900 text-white font-semibold py-3 px-8 rounded-full hover:bg-slate-800 transition active:scale-95"
        >
          View All Products (Shop)
        </button>
      </div>
    </section>
  );
}