"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Icons for pagination

const ITEMS_PER_PAGE = 8; // Change this to how many items you want per page!

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  category: string;
}

// Fallback for older items missing a category in the database
const getFallbackCategory = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("jar") || lowercaseName.includes("rack") || lowercaseName.includes("kitchen") || lowercaseName.includes("bottle") || lowercaseName.includes("box") || lowercaseName.includes("tumbler")) return "Kitchenware";
  if (lowercaseName.includes("vase") || lowercaseName.includes("light") || lowercaseName.includes("shelf") || lowercaseName.includes("radio")) return "Home Decor";
  if (lowercaseName.includes("power") || lowercaseName.includes("speaker")) return "Tech";
  if (lowercaseName.includes("mirror") || lowercaseName.includes("bag") || lowercaseName.includes("grinder")) return "Cosmetics";
  return "Home Decor";
};

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Traditional Pagination States (NEW)
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Initial Fetch (Gets everything active, maps categories)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch DB Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        let dbCats: string[] = [];
        if (!categoriesSnapshot.empty) {
          dbCats = categoriesSnapshot.docs.map(doc => {
            const rawName = doc.data().name.trim();
            return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          });
        }

        // Fetch Active Products
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
          const cleanCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
          
          // Ensure fallback categories also exist in the filter buttons
          if (!dbCats.includes(cleanCategory)) {
            dbCats.push(cleanCategory);
          }

          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            stockQuantity: data.stockQuantity,
            images: data.images || [],
            isActive: data.isActive,
            category: cleanCategory
          };
        }) as Product[];
        
        setAllProducts(fetched);
        setFilteredProducts(fetched);

        // Clean up duplicates in categories list
        const uniqueCats = Array.from(new Set(dbCats));
        setCategories(["All", ...uniqueCats]);

      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 2. Client-Side Filtering (Fixes the filter bug!)
  useEffect(() => {
    let result = allProducts;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to page 1 whenever filters change!
  }, [searchQuery, activeCategory, allProducts]);


  // 3. Pagination Math (NEW)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDisplayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination Handlers
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) return <p className="text-center text-slate-500 py-20">Loading Shop...</p>;

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-extrabold text-[#1C1C1E] mb-8 tracking-tight">Our Collections</h1>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs border border-[#E0DDD6] bg-white rounded-full px-5 py-2.5 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition"
          />

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                  activeCategory === category 
                    ? "bg-[#C9A84C] text-white shadow-md" 
                    : "bg-white text-slate-500 border border-[#E0DDD6] hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E0DDD6] rounded-2xl">
            <p className="text-slate-500 font-medium">No products match your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentDisplayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* --- TRADITIONAL PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                
                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-[#E0DDD6] bg-white text-[#1C1C1E] hover:bg-[#FAF9F7] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Indicator */}
                <span className="text-sm font-semibold text-slate-600 tracking-widest uppercase">
                  Page {currentPage} of {totalPages}
                </span>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-[#E0DDD6] bg-white text-[#1C1C1E] hover:bg-[#FAF9F7] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}