"use client";

import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  // Generate a clean SEO slug from the product name
  // e.g. "Desktop Makeup Mirror" -> "desktop-makeup-mirror"
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleCardClick = () => {
    const slug = generateSlug(product.name);
    // Route to /product/[slug] and pass the actual ID as a query param for fast Firestore lookup
    router.push(`/product/${slug}?id=${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={`${product.name} - Trendy Aesthetic Accessory | Accessories by DN Sri Lanka`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">
            Only {product.stockQuantity} left!
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{product.name}</h3>
        <p className="text-slate-600 mb-4 font-medium">LKR {product.price.toLocaleString()}</p>
        
        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // <-- CRITICAL: Prevents card click navigation!
            addToCart(product);
          }}
          className="mt-auto w-full bg-slate-900 text-white font-semibold py-2 rounded-lg hover:bg-slate-800 transition active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}