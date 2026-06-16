"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  category?: string;
}

const getFallbackCategory = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (
    lowercaseName.includes("jar") || lowercaseName.includes("rack") || 
    lowercaseName.includes("kitchen") || lowercaseName.includes("bottle") || 
    lowercaseName.includes("box") || lowercaseName.includes("tumbler")
  ) return "Kitchenware";
  if (
    lowercaseName.includes("vase") || lowercaseName.includes("light") || 
    lowercaseName.includes("shelf") || lowercaseName.includes("radio")
  ) return "Home Decor";
  if (lowercaseName.includes("power") || lowercaseName.includes("speaker")) return "Tech";
  if (lowercaseName.includes("mirror") || lowercaseName.includes("bag") || lowercaseName.includes("grinder")) return "Cosmetics";
  return "Home Decor";
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]); // Dynamic Categories list
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Categories from Firestore
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        if (!categoriesSnapshot.empty) {
          // Map to names, and normalize casing (e.g., "cosmetics" -> "Cosmetics")
          const dbCats = categoriesSnapshot.docs.map(doc => {
            const rawName = doc.data().name.trim();
            return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          });
          
          // CRITICAL: Remove duplicates using a JavaScript Set!
          const uniqueCats = Array.from(new Set(dbCats));
          setCategories(["All", ...uniqueCats]);
        } else {
          setCategories(["All", "Kitchenware", "Home Decor", "Tech", "Cosmetics"]);
        }

        // 2. Fetch Products
        const q = query(
          collection(db, "products"),
          where("stockQuantity", ">", 0),
          where("isActive", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => {
          const data = doc.data();
          const rawCategory = data.category || getFallbackCategory(data.name);
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            stockQuantity: data.stockQuantity,
            images: data.images || [],
            isActive: data.isActive,
            // Normalize product category name as well
            category: rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase()
          };
        }) as Product[];
        
        setProducts(fetched);
        setFilteredProducts(fetched);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products]);

  if (loading) return <p className="text-center text-slate-500 py-20">Loading Shop...</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Our Collections</h1>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C] transition"
          />

          {/* DYNAMIC CATEGORY BUTTONS */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  activeCategory === category 
                    ? "bg-[#C9A84C] text-white" 
                    : "bg-white text-slate-600 border hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No products match your search or filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}