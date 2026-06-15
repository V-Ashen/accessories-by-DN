"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

const PRODUCTS_PER_LOAD = 4;

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  createdAt: any;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#FAF9F7] border border-[#E0DDD6] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#E8E4DF]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-[#E8E4DF] rounded-full w-3/4" />
        <div className="h-3 bg-[#E8E4DF] rounded-full w-1/3" />
        <div className="h-9 bg-[#E8E4DF] rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function ProductGridPaginated() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchProducts = useCallback(async (loadSize: number, startAfterDoc: QueryDocumentSnapshot<DocumentData> | null) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "products"),
        where("stockQuantity", ">", 0),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(loadSize)
      );

      if (startAfterDoc) {
        q = query(
          collection(db, "products"),
          where("stockQuantity", ">", 0),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(startAfterDoc),
          limit(loadSize)
        );
      }

      const snapshot = await getDocs(q);
      const fetchedProducts: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          stockQuantity: data.stockQuantity,
          images: data.images || [],
          isActive: data.isActive,
          createdAt: data.createdAt,
        };
      });

      setProducts((prev) => [...prev, ...fetchedProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(fetchedProducts.length === loadSize);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDone) {
      fetchProducts(PRODUCTS_PER_LOAD, null);
      setInitialLoadDone(true);
    }
  }, [fetchProducts, initialLoadDone]);

  const handleLoadMore = () => {
    fetchProducts(PRODUCTS_PER_LOAD * 2, lastDoc);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8" id="trending">

      {/* Section header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
            Collection
          </p>
          <h2
            className="text-3xl font-semibold text-[#1C1C1E] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Trending &amp; Latest
          </h2>
        </div>
        <div className="hidden sm:block h-px flex-1 bg-[#E0DDD6] mx-8 mb-2" />
        <p className="hidden sm:block text-xs text-[#888] tracking-widest uppercase mb-2">
          {products.length} items
        </p>
      </div>

      {/* Empty state */}
      {products.length === 0 && !loading && (
        <div className="py-24 text-center">
          <p className="text-[#888] text-sm tracking-wide">
            No products available right now. Check back soon!
          </p>
        </div>
      )}

      {/* Product grid */}
      {(products.length > 0 || loading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {/* Skeleton cards while loading more */}
          {loading && Array.from({ length: loading && products.length === 0 ? PRODUCTS_PER_LOAD : PRODUCTS_PER_LOAD * 2 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-14">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 border border-[#1C1C1E] text-[#1C1C1E] text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-full hover:bg-[#1C1C1E] hover:text-[#FAF9F7] transition-all duration-200 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Load More
          </button>
        </div>
      )}

    </section>
  );
}