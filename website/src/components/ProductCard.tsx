"use client";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleCardClick = () => {
    const slug = generateSlug(product.name);
    router.push(`/product/${slug}?id=${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col h-full bg-transparent overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-slate-50 overflow-hidden mb-4">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={`${product.name} - Accessories by DN`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Badges */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute top-3 left-3 bg-[#FAF9F7]/90 backdrop-blur-sm text-[#1C1C1E] text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-[#E0DDD6]">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col text-center px-2 flex-grow">
        {product.category && (
          <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] mb-1.5">
            {product.category}
          </p>
        )}
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#1C1C1E] leading-snug mb-1.5" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4">
          LKR {product.price.toLocaleString()}
        </p>

        <div className="mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-transparent border border-[#1C1C1E] text-[#1C1C1E] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest py-2.5 sm:py-3 hover:bg-[#1C1C1E] hover:text-[#C9A84C] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}