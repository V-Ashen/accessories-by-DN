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
      className="group flex flex-col h-full bg-transparent cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-white/5 border border-white/5 overflow-hidden mb-3 sm:mb-4 rounded-xl">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={`${product.name} - Accessories by DN`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Badges */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 glass-dark px-2 sm:px-3 py-1 text-[var(--foreground)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            Low Stock
          </span>
        )}

        {/* Hover Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex justify-center hidden lg:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-[var(--accent)] text-[#0f1115] text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:bg-white transition-colors shadow-[0_0_15px_var(--accent-glow)]"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col px-1">
        {product.category && (
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1">
            {product.category}
          </p>
        )}
        <h3 className="text-sm sm:text-base font-medium text-[var(--foreground)] leading-snug mb-1" style={{ fontFamily: "var(--font-serif)" }}>
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          LKR {product.price.toLocaleString()}
        </p>

        {/* Mobile Add to Cart (Visible on small screens) */}
        <div className="mt-3 lg:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-white/5 border border-[var(--border)] text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest py-2 rounded-full hover:bg-[var(--accent)] hover:text-[#0f1115] hover:border-[var(--accent)] transition-colors shadow-lg"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}