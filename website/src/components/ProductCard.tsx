"use client";

import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-[#FAF9F7] border border-[#E0DDD6] rounded-2xl overflow-hidden hover:border-[#C9A84C] transition-all duration-300">

      {/* Product Image */}
      <div className="relative aspect-square bg-[#F0EDE8] overflow-hidden">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Low Stock Badge */}
        {product.stockQuantity <= 5 && (
          <span className="absolute top-3 left-3 bg-[#1C1C1E] text-[#C9A84C] text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Only {product.stockQuantity} left
          </span>
        )}

        {/* Quick-add overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-[#1C1C1E]/90 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#1C1C1E] transition-colors duration-150"
          >
            {added ? "✓ Added" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-[15px] font-semibold text-[#1C1C1E] mb-0.5 leading-snug tracking-wide truncate"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {product.name}
        </h3>
        <p className="text-xs text-[#888] uppercase tracking-widest mb-4 font-medium">
          LKR {product.price.toLocaleString()}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`mt-auto w-full py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase border transition-all duration-200 active:scale-95 ${
            added
              ? "bg-[#C9A84C] border-[#C9A84C] text-[#1C1C1E]"
              : "bg-transparent border-[#1C1C1E] text-[#1C1C1E] hover:bg-[#1C1C1E] hover:text-[#FAF9F7]"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}