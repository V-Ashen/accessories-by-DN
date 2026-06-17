"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { Edit, Save, X, Trash2, Plus, ToggleLeft, ToggleRight, Star, Search, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  isFeatured?: boolean; // NEW: Featured flag
  category?: string;
  description?: string;
  createdAt: any;
}

const generateAIPlaceholderDescription = (name: string) => {
  return `${name} is an exquisite addition to our exclusive catalog. Crafted with meticulous attention to detail, this item embodies the perfect blend of modern aesthetic appeal and practical durability. Designed for daily use, it adds a touch of elegance and convenience to your lifestyle.`;
};

export default function ManageProductsPage() {
  const { roleCode, hasPermission } = useAdminAuthStore();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Categories
      const catSnapshot = await getDocs(collection(db, "categories"));
      let fetchedCats = catSnapshot.docs.map(doc => {
        const rawName = doc.data().name.trim();
        return { id: doc.id, name: rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() };
      });
      // Remove duplicates
      const uniqueCats = fetchedCats.filter((cat, index, self) => index === self.findIndex((c) => c.name === cat.name));
      setCategories(uniqueCats);

      // Fetch Products
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching database data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Search & Filter Logic ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Bulk Category Update (NEW) ---
  const handleBulkStatusUpdate = async (newStatus: boolean) => {
    if (activeCategory === "All") return alert("Please select a specific category first to bulk update.");
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) return alert("Permission Denied.");
    
    if (confirm(`Are you sure you want to mark ALL items in "${activeCategory}" as ${newStatus ? 'Active' : 'Inactive'}?`)) {
      setLoading(true);
      try {
        const batch = writeBatch(db);
        const productsToUpdate = products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
        
        productsToUpdate.forEach(p => {
          const pRef = doc(db, "products", p.id);
          batch.update(pRef, { isActive: newStatus });
        });

        await batch.commit(); // Execute all updates instantly
        
        // Update local state
        setProducts(prev => prev.map(p => 
          p.category?.toLowerCase() === activeCategory.toLowerCase() ? { ...p, isActive: newStatus } : p
        ));
        alert(`Bulk update complete!`);
      } catch (error) {
        console.error("Bulk update failed:", error);
        alert("Bulk update failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Toggle Handlers ---
  const handleToggleActive = async (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) return alert("Permission Denied.");
    try {
      const newStatus = !product.isActive;
      await updateDoc(doc(db, "products", product.id), { isActive: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) return alert("Permission Denied.");
    try {
      const newFeatured = !product.isFeatured;
      await updateDoc(doc(db, "products", product.id), { isFeatured: newFeatured });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: newFeatured } : p));
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  // --- Edit & Delete Handlers ---
  const handleEditClick = (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) return alert("Permission Denied.");
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditStock(String(product.stockQuantity));
    setEditCategory(product.category || "Home Decor");
    setEditDescription(product.description || generateAIPlaceholderDescription(product.name));
    setShowNewCategoryInput(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "products", editingProduct.id), {
        name: editName,
        price: Number(editPrice),
        stockQuantity: Number(editStock),
        category: editCategory,
        description: editDescription,
      });
      alert("Product updated successfully!");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchData(); 
    } catch (error) {
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) return alert("Permission Denied.");
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "products", productId));
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        alert("Failed to delete product.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (roleCode !== 0 && !hasPermission("manage products")) {
    return <div className="p-8 text-center text-red-600 font-bold text-2xl">Access Denied</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8 mt-4 text-slate-800">
      
      {/* Header with Modern Pill Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h1>
        <button 
          onClick={() => router.push("/products/add")}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 flex items-center gap-2 shadow-md transition active:scale-95"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* --- Filter & Search Toolbar --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Categories Pill Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
          {["All", ...categories.map(c => c.name)].map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === category ? "bg-[#C9A84C] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          {/* Bulk Update Buttons (Only show if a specific category is selected) */}
          {activeCategory !== "All" && (
            <div className="flex gap-2">
              <button onClick={() => handleBulkStatusUpdate(true)} className="text-xs font-bold px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition whitespace-nowrap">
                Activate All
              </button>
              <button onClick={() => handleBulkStatusUpdate(false)} className="text-xs font-bold px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition whitespace-nowrap">
                Deactivate All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Cleaner Table Design --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-5">Image</th>
                <th className="p-5">Product Details</th>
                <th className="p-5">Price (LKR)</th>
                <th className="p-5">Stock</th>
                <th className="p-5 text-center">Featured</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-400">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-5">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">{product.category || "Unassigned"}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{product.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`${product.stockQuantity <= 5 ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    
                    {/* Featured Toggle Column */}
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggleFeatured(product)} className="focus:outline-none transition-transform active:scale-90 hover:opacity-80">
                        <Star size={22} className={product.isFeatured ? "fill-[#C9A84C] text-[#C9A84C]" : "text-slate-300"} />
                      </button>
                    </td>

                    {/* Status Toggle Column */}
                    <td className="p-4 text-center">
                      <button onClick={() => handleToggleActive(product)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          product.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    
                    <td className="p-4 pr-5 flex justify-end gap-3 text-slate-400">
                      <button onClick={() => handleEditClick(product)} className="hover:text-blue-600 p-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteProduct(product.id, product.name)} className="hover:text-red-600 p-2 bg-slate-50 rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 p-2 rounded-full transition"><X size={18} /></button>
            <h2 className="text-2xl font-bold mb-6">Edit Product Details</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
               {/* Same form inputs as before... */}
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Product Name</label>
                  <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full border rounded-xl p-3 outline-none bg-white focus:ring-2 focus:ring-[#C9A84C]">
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Price (LKR)</label>
                  <input type="number" required value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock Quantity</label>
                  <input type="number" required value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">SEO Product Description</label>
                <textarea rows={5} value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full border rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm text-slate-600 leading-relaxed bg-slate-50" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1C1C1E] text-white font-bold py-4 rounded-xl hover:bg-[#333] transition mt-4">
                {loading ? "Saving Changes..." : "Save Product Details"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}