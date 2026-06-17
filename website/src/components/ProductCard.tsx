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
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-transform duration-200"
    >
      {/* Image */}
      <div className="relative w-full h-[200px] md:h-[230px] bg-slate-50 overflow-hidden">
        <img
          src={product.images[0] || "/placeholder-image.jpg"}
          alt={`${product.name} - Trendy Aesthetic Accessory | Accessories by DN Sri Lanka`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-50 text-amber-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">
            {product.category}
          </p>
        )}
        <h3 className="text-[15px] font-medium text-slate-900 leading-snug mb-1.5">
          {product.name}
        </h3>
        <p className="text-base font-medium text-slate-900 mb-4">
          LKR {product.price.toLocaleString()}
        </p>

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-[13px] font-medium py-2.5 rounded-full hover:bg-slate-700 active:scale-95 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Add to cart
        </button>
      </div>
    </div>
  );
}