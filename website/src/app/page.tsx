import { collection, getDocs, query, where, orderBy } from "firebase/firestore"; // Added orderBy
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";

async function getProducts() {
  try {
    // UPDATED QUERY: Only fetch products where isActive is true
    const q = query(
      collection(db, "products"), 
      where("stockQuantity", ">", 0), // Still check stock
      where("isActive", "==", true),  // <-- NEW CONDITION
      orderBy("createdAt", "desc")    // Order by newest first
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        name: data.name,
        price: data.price,
        stockQuantity: data.stockQuantity,
        images: data.images || []
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ShopHome() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-slate-50 py-16 text-center border-b">
        <h1 className="text-4xl font-extrabold text-slate-900">Accessories by DN</h1>
        <p className="mt-4 text-lg text-slate-600">Trendy aesthetic jewelry delivered in Sri Lanka.</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Latest Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-slate-500">No products available right now. Check back soon!</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}