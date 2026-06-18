"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"; 
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 8; 

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  category: string;
}

const getFallbackCategory = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("jar") || lowercaseName.includes("rack") || lowercaseName.includes("kitchen") || lowercaseName.includes("bottle") || lowercaseName.includes("box") || lowercaseName.includes("tumbler")) return "Kitchenware";
  if (lowercaseName.includes("vase") || lowercaseName.includes("light") || lowercaseName.includes("shelf") || lowercaseName.includes("radio")) return "Home Decor";
  if (lowercaseName.includes("power") || lowercaseName.includes("speaker")) return "Tech";
  if (lowercaseName.includes("mirror") || lowercaseName.includes("bag") || lowercaseName.includes("grinder")) return "Cosmetics";
  return "Home Decor";
};

export default function ShopPage() {
  const { user, setAuthModalOpen } = useAuthStore();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        let dbCats: string[] = [];
        if (!categoriesSnapshot.empty) {
          dbCats = categoriesSnapshot.docs.map(doc => {
            const rawName = doc.data().name.trim();
            return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          });
        }

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

  useEffect(() => {
    let result = allProducts;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(result);
    setCurrentPage(1); 
  }, [searchQuery, activeCategory, allProducts]);


  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDisplayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleTrackOrderClick = () => {
    if (!user) {
      setAuthModalOpen(true); 
    } else {
      router.push("/track-order"); 
    }
  };

  if (loading) return <p className="text-center text-slate-500 py-20">Loading Shop...</p>;

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">Our Collections</h1>
          
          <button 
            onClick={handleTrackOrderClick}
            className="flex items-center gap-2 bg-[#C9A84C] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#b0903a] shadow-md transition-all active:scale-95"
          >
            <PackageSearch size={16} /> Track My Orders
          </button>
        </div>

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

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E0DDD6] rounded-2xl">
            <p className="text-slate-500 font-medium">No products match your search or filter.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentDisplayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-[#E0DDD6] bg-white text-[#1C1C1E] hover:bg-[#FAF9F7] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm font-semibold text-slate-600 tracking-widest uppercase">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-[#E0DDD6] bg-white text-[#1C1C1E] hover:bg-[#FAF9F7] disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}