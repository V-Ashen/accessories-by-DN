// website/src/components/ProductGridPaginated.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

const PRODUCTS_PER_LOAD = 4; // Initial load: 4, Subsequent loads: 8 (per requirements)

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
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false); // To handle initial 4 vs subsequent 8

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
          startAfter(startAfterDoc), // Start fetching after the last document
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
          images: data.images || []
        };
      });

      setProducts((prev) => [...prev, ...fetchedProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(fetchedProducts.length === loadSize); // If we fetched less than limit, no more docs
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load: 4 items
    if (!initialLoadDone) {
        fetchProducts(PRODUCTS_PER_LOAD, null);
        setInitialLoadDone(true);
    }
  }, [fetchProducts, initialLoadDone]);

  const handleLoadMore = () => {
    // Subsequent loads: 8 items
    fetchProducts(PRODUCTS_PER_LOAD * 2, lastDoc);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8" id="trending">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Trending & Latest Items</h2>
      
      {products.length === 0 && !loading ? (
        <p className="text-slate-500 text-center">No products available right now. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-12">
          <button 
            onClick={handleLoadMore} 
            className="bg-slate-900 text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-800 transition"
          >
            Load More Products
          </button>
        </div>
      )}

      {loading && products.length === 0 && (
        <p className="text-center text-slate-500">Loading products...</p>
      )}
    </section>
  );
}