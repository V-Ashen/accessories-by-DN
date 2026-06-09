"use client"; // This tells Next.js this component runs in the browser

import { useCartStore } from "@/store/cartStore";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="group flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {/* Low Stock Badge */}
        {product.stockQuantity <= 5 && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
            Only {product.stockQuantity} left!
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{product.name}</h3>
        <p className="text-slate-600 mb-4 font-medium">LKR {product.price}</p>
        
        {/* Functional Add to Cart Button */}
        <button 
          onClick={() => addToCart(product)}
          className="mt-auto w-full bg-slate-900 text-white font-semibold py-2 rounded-lg hover:bg-slate-800 transition active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}