"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { Edit, Trash2, PlusCircle, ToggleLeft, ToggleRight, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  category?: string;
  description?: string;
  createdAt: any;
}

const generateAIPlaceholderDescription = (name: string) => {
  return `${name} is an exquisite addition to our exclusive catalog. Crafted with meticulous attention to detail, this item embodies the perfect blend of modern aesthetic appeal and practical durability. Designed for daily use, it adds a touch of elegance and convenience to your lifestyle.`;
};

const DEFAULT_CATEGORIES = ["Kitchenware", "Home Decor", "Tech", "Cosmetics"];

export default function ManageProductsPage() {
  const { roleCode, hasPermission } = useAdminAuthStore();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Dynamic Categories from DB
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Inline "Add New Category" States (NEW)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch & Auto-Seed Categories
      const catSnapshot = await getDocs(collection(db, "categories"));
      let fetchedCats = catSnapshot.docs.map(doc => {
        const rawName = doc.data().name.trim();
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        return { id: doc.id, name: formattedName };
      });

      if (catSnapshot.empty) {
        console.log("Categories collection is empty. Auto-seeding defaults...");
        const seedPromises = DEFAULT_CATEGORIES.map(cat => 
          addDoc(collection(db, "categories"), { name: cat, createdAt: new Date() })
        );
        await Promise.all(seedPromises);
        
        const freshCatSnapshot = await getDocs(collection(db, "categories"));
        fetchedCats = freshCatSnapshot.docs.map(doc => {
          const rawName = doc.data().name.trim();
          const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          return { id: doc.id, name: formattedName };
        });
      }

      // CRITICAL: Filter out duplicate category names from the Admin dropdown state!
      const uniqueCats = fetchedCats.filter((cat, index, self) =>
        index === self.findIndex((c) => c.name === cat.name)
      );
      setCategories(uniqueCats);

      // 2. Fetch Products
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
  const handleEditClick = (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot edit products.");
      return;
    }
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditStock(String(product.stockQuantity));
    setEditCategory(product.category || "Home Decor");
    setEditDescription(product.description || generateAIPlaceholderDescription(product.name));
    
    // Reset category adder state
    setShowNewCategoryInput(false);
    setNewCategoryName("");
    
    setIsEditModalOpen(true);
  };

  // --- NEW: Handle Inline Custom Category Creation ---
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return alert("Please enter a valid category name!");
    setAddingCategory(true);
    try {
      // 1. Save new category to Firestore
      const newCatRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        createdAt: new Date()
      });

      const newlyAddedCategory = { id: newCatRef.id, name: newCategoryName.trim() };
      
      // 2. Update local state
      setCategories(prev => [...prev, newlyAddedCategory]);
      setEditCategory(newCategoryName.trim()); // Set as selected category in form
      setShowNewCategoryInput(false); // Close input
      setNewCategoryName("");
      alert("New category added successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category.");
    } finally {
      setAddingCategory(false);
    }
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
      fetchData(); // Refresh list & categories
    } catch (error) {
      console.error("Error updating product: ", error);
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot change product status.");
      return;
    }
    try {
      const newStatus = !product.isActive;
      await updateDoc(doc(db, "products", product.id), { isActive: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
    } catch (error) {
      console.error("Error toggling product status:", error);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot delete products.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "products", productId));
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (roleCode !== 0 && !hasPermission("manage products")) {
    return (
      <div className="p-8 max-w-7xl mx-auto mt-10 text-center text-red-600 font-bold text-2xl">
        Access Denied: You do not have permission to manage products.
      </div>
    );
  }

  if (loading && !isEditModalOpen) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading Products...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Product Management</h1>
        <button 
          onClick={() => router.push("/products/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusCircle size={20} /> Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border text-center text-slate-500">
          No products found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-sm border-b text-slate-600">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Product Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price (LKR)</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md border" />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{product.name}</td>
                    <td className="p-4 text-slate-600 font-medium capitalize">{product.category || "Unassigned"}</td>
                    <td className="p-4 font-bold text-slate-900">LKR {product.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`${product.stockQuantity <= 5 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleActive(product)} 
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                          product.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 flex gap-4 text-slate-400">
                      <button onClick={() => handleEditClick(product)} className="hover:text-blue-600"><Edit size={18} /></button>
                      {(roleCode === 0 || (roleCode === 1 && hasPermission("manage products"))) && (
                          <button onClick={() => handleDeleteProduct(product.id, product.name)} className="hover:text-red-600"><Trash2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT DETAILS MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">✕</button>
            <h2 className="text-2xl font-bold mb-6">Edit Product Details</h2>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4 text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Product Name</label>
                  <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                {/* DYNAMIC CATEGORY DROPDOWN WITH INLINE ADD */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select 
                    value={editCategory} 
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setShowNewCategoryInput(true);
                        setEditCategory("");
                      } else {
                        setEditCategory(e.target.value);
                        setShowNewCategoryInput(false);
                      }
                    }} 
                    className="w-full border rounded-lg p-2.5 outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="ADD_NEW" className="text-blue-600 font-bold">+ Add New Category...</option>
                  </select>
                </div>
              </div>

              {/* INLINE NEW CATEGORY INPUT BOX */}
              {showNewCategoryInput && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-2 items-center animate-in fade-in duration-200">
                  <input 
                    type="text" 
                    placeholder="Enter custom category..." 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg p-2 text-sm outline-none bg-white focus:border-blue-500"
                  />
                  <button 
                    type="button" 
                    disabled={addingCategory}
                    onClick={handleAddNewCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingCategory ? "Adding..." : "Add"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowNewCategoryInput(false); setEditCategory(categories[0]?.name || "Home Decor"); }}
                    className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Price (LKR)</label>
                  <input type="number" required value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock Quantity</label>
                  <input type="number" required value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Product Description (SEO Sheet)</label>
                <textarea 
                  rows={6}
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)} 
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                  placeholder="Paste or write detailed specifications here..."
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                {loading ? "Saving Changes..." : "Save Product Details"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}