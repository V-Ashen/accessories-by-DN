"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { ChevronLeft, ChevronRight, Search } from "lucide-react"; 
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 12; // Increased for standard grid

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

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--muted)] font-medium tracking-widest uppercase text-xs">Loading Collections...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-20">
      
      {/* Hero Banner */}
      <div className="glass-glow text-center py-16 px-4 mb-8 md:mb-12 max-w-7xl mx-auto rounded-2xl border border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-5" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-4 relative z-10" style={{ fontFamily: "var(--font-serif)" }}>
          Our Collections
        </h1>
        <p className="text-[var(--accent)] text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold relative z-10" style={{ textShadow: "0 0 10px var(--accent-glow)" }}>
          Curated Elegance for Every Lifestyle
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Filters (Desktop) / Top Filters (Mobile) */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-6">

              {/* Track Order */}
              <button
                onClick={() => router.push("/track-order")}
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[#0f1115] text-[11px] font-bold uppercase tracking-widest py-3.5 hover:bg-white transition-colors shadow-[0_0_15px_var(--accent-glow)] rounded-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22h14"/>
                  <path d="M5 2h14"/>
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                </svg>
                Track My Order
              </button>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search pieces..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition"
                />
              </div>

              {/* Categories Desktop */}
              <div className="hidden lg:block">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-4 pb-2 border-b border-[var(--border)]">Categories</h3>
                <ul className="space-y-3">
                  {categories.map(category => (
                    <li key={category}>
                      <button
                        onClick={() => setActiveCategory(category)}
                        className={`text-sm tracking-wide transition-colors ${
                          activeCategory === category 
                            ? "font-bold text-[var(--accent)]" 
                            : "font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        style={activeCategory === category ? { textShadow: "0 0 8px var(--accent-glow)" } : {}}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories Mobile (Horizontal Scroll) */}
              <div className="lg:hidden">
                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-full transition-all ${
                        activeCategory === category 
                          ? "bg-[var(--accent)] text-[#0f1115] border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]" 
                          : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 glass-glow rounded-xl border border-[var(--border)]">
                <p className="text-[var(--muted)] font-medium">No pieces found matching your criteria.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {currentDisplayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-[var(--border)]">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-3 bg-white/5 border border-[var(--border)] rounded-full text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[#0f1115] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="text-[11px] font-bold text-[var(--muted)] tracking-widest uppercase">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-3 bg-white/5 border border-[var(--border)] rounded-full text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[#0f1115] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}