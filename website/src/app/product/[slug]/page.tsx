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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Product details...</div>;
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
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-8 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl border shadow-sm">
          
          {/* Left: Image Carousel placeholder */}
          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border">
            <img 
              src={product.images[0] || "/placeholder-image.jpg"} 
              alt={`${product.name} - Premium ${product.category || 'Aesthetic Accessory'} | Accessories by DN`} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Info Column */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">
              {product.category || "Accessories"}
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
            
            <p className="text-2xl font-bold text-slate-900 mb-6">LKR {product.price.toLocaleString()}</p>
            
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                product.stockQuantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} units)` : "Out of Stock"}
              </span>
            </div>

            {/* Product Details accordion */}
            <div className="border-t pt-6 mt-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">
                  {product.description || seoData.mainText}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Key Features</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {seoData.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Care & Usage Tips</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                  {seoData.usage.map((tip, i) => <li key={i}>{tip}</li>)}
                </ol>
              </div>
            </div>

            {/* Add to Cart button */}
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <ShoppingBag size={20} /> Add to Cart
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading Product details...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}