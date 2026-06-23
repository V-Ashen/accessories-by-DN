"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  category?: string;
  description?: string;
}

function ProductDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (!productId) {
      router.push("/");
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, router]);

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-bold text-[var(--muted)] tracking-widest uppercase text-xs">Loading Product details...</div>;
  if (!product) return null;

  // --- Dynamic AI SEO Description Generator ---
  // If the product doesn't have a database description yet, we generate an elite one on-the-fly!
  const generateSEODescription = (name: string, category: string = "Accessories") => {
    return {
      mainText: `${name} is an exquisite addition to our exclusive catalog. Crafted with meticulous attention to detail, this item embodies the perfect blend of modern aesthetic appeal and practical durability. Designed for daily use, it adds a touch of elegance and convenience to your lifestyle.`,
      features: [
        "Premium Craftsmanship: Engineered with high-quality materials to guarantee long-lasting durability.",
        "Aesthetic Appeal: Features a minimalist and sleek design that effortlessly matches any modern aesthetic.",
        "Ideal Gift Choice: Packaged beautifully, making it a perfect present for friends, family, or loved ones."
      ],
      usage: [
        "Keep away from direct exposure to water or harsh chemicals to preserve the product's premium finish.",
        "Clean gently using a soft, dry microfibre cloth after use."
      ]
    };
  };

  const seoData = generateSEODescription(product.name, product.category);

  return (
    <div className="min-h-screen bg-[var(--background)] py-24 px-4 sm:px-6 lg:px-8 text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 glass-glow border border-[var(--border)] p-8 rounded-2xl shadow-sm">
          
          {/* Left: Image Carousel placeholder */}
          <div className="aspect-square bg-black/20 rounded-xl overflow-hidden border border-[var(--border)] relative">
            <img 
              src={product.images[0] || "/placeholder-image.jpg"} 
              alt={`${product.name} - Premium ${product.category || 'Aesthetic Accessory'} | Accessories by DN`} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Info Column */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-1" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>
              {product.category || "Accessories"}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--foreground)] mb-4 tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>{product.name}</h1>
            
            <p className="text-2xl font-bold text-[var(--accent)] mb-6" style={{ fontFamily: "var(--font-serif)" }}>LKR {product.price.toLocaleString()}</p>
            
            <div className="mb-6">
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                product.stockQuantity > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
              </span>
            </div>

            {/* Product Details accordion */}
            <div className="border-t border-[var(--border)] pt-6 mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Description</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed text-justify">
                  {product.description || seoData.mainText}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Key Features</h3>
                <ul className="list-disc list-inside text-sm text-[var(--muted)] space-y-1.5">
                  {seoData.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Care & Usage Tips</h3>
                <ol className="list-decimal list-inside text-sm text-[var(--muted)] space-y-1.5">
                  {seoData.usage.map((tip, i) => <li key={i}>{tip}</li>)}
                </ol>
              </div>
            </div>

            {/* Add to Cart button */}
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              className="mt-8 w-full bg-[var(--accent)] text-[#0f1115] font-bold text-xs tracking-widest uppercase py-4 rounded-full hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_15px_var(--accent-glow)]"
            >
              <ShoppingBag size={18} /> {product.stockQuantity === 0 ? "Sold Out" : "Add to Cart"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Wrapping PDP in Suspense to satisfy Vercel production build rules
export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-[var(--muted)]">Loading Product details...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}