"use client";
 
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { Edit, Save, X, Trash2, PlusCircle, ToggleLeft, ToggleRight } from "lucide-react"; // Added ToggleLeft, ToggleRight
import { useRouter } from "next/navigation";
 
interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean; // Crucial field for visibility
  createdAt: any;
}
 
export default function ManageProductsPage() {
  const { roleCode, hasPermission } = useAdminAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
 
  // State for Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number | null>(null);
 
  // State for Stock Editing
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockQuantity, setNewStockQuantity] = useState<number | null>(null);
 
  // State for Status Toggling (NEW)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
 
  useEffect(() => {
    fetchProducts();
  }, []);
 
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
 
  // --- Price Editing Handlers ---
  const handleEditPriceClick = (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot edit product prices.");
      return;
    }
    setEditingPriceId(product.id);
    setNewPrice(product.price);
    // Close other editing modes
    setEditingStockId(null);
  };
 
  const handleSavePrice = async (productId: string) => {
    if (newPrice === null || newPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "products", productId), { price: newPrice });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: newPrice } : p));
      setEditingPriceId(null);
      setNewPrice(null);
      alert("Price updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price.");
    } finally {
      setLoading(false);
    }
  };
 
  // --- Stock Editing Handlers ---
  const handleEditStockClick = (product: Product) => {
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot edit product stock.");
      return;
    }
    setEditingStockId(product.id);
    setNewStockQuantity(product.stockQuantity);
    // Close other editing modes
    setEditingPriceId(null);
  };
 
  const handleSaveStock = async (productId: string) => {
    if (newStockQuantity === null || newStockQuantity < 0) {
      alert("Please enter a valid stock quantity (0 or more).");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "products", productId), { stockQuantity: newStockQuantity });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockQuantity: newStockQuantity } : p));
      setEditingStockId(null);
      setNewStockQuantity(null);
      alert("Stock updated successfully!");
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock.");
    } finally {
      setLoading(false);
    }
  };
 
  // --- Status Toggling Handlers (NEW) ---
  const handleToggleActive = async (product: Product) => {
    // RBAC: Only Master Admin or Admin with 'manage products' can toggle status
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage products"))) {
      alert("Permission Denied: You cannot change product status.");
      return;
    }
   
    setTogglingStatusId(product.id); // Set ID to show loading state on specific item
    try {
      const newStatus = !product.isActive;
      await updateDoc(doc(db, "products", product.id), { isActive: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
      alert(`Product status changed to ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch (error) {
      console.error("Error toggling product status:", error);
      alert("Failed to update product status.");
    } finally {
      setTogglingStatusId(null); // Clear loading state
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
 
  // RBAC: Deny access if not Master Admin and no specific permission
  if (roleCode !== 0 && !hasPermission("manage products")) {
    return (
      <div className="p-8 max-w-7xl mx-auto mt-10 text-center text-red-600 font-bold text-2xl">
        Access Denied: You do not have permission to manage products.
      </div>
    );
  }
 
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading Products...</div>;
  }
 
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
            <table className="w-full text-left border-collapse min-w-[1200px]"> {/* Increased min-width */}
              <thead>
                <tr className="bg-slate-50 text-sm border-b text-slate-600">
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Product Name</th>
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
                   
                    {/* Price Cell */}
                    <td className="p-4">
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newPrice !== null ? newPrice : ''}
                            onChange={(e) => setNewPrice(Number(e.target.value))}
                            className="w-24 border rounded-md p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button onClick={() => handleSavePrice(product.id)} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                          <button onClick={() => {setEditingPriceId(null); setNewPrice(null);}} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">LKR {product.price.toLocaleString()}</span>
                          <button onClick={() => handleEditPriceClick(product)} className="text-slate-400 hover:text-blue-600">
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </td>
 
                    {/* Stock Cell */}
                    <td className="p-4">
                      {editingStockId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newStockQuantity !== null ? newStockQuantity : ''}
                            onChange={(e) => setNewStockQuantity(Number(e.target.value))}
                            className="w-20 border rounded-md p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button onClick={() => handleSaveStock(product.id)} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                          <button onClick={() => {setEditingStockId(null); setNewStockQuantity(null);}} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`${product.stockQuantity <= 5 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity <= 5 && product.stockQuantity > 0 && ( // Only show low stock if > 0
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Low Stock</span>
                          )}
                          {product.stockQuantity === 0 && ( // Out of stock specific badge
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Out of Stock</span>
                          )}
                           <button onClick={() => handleEditStockClick(product)} className="text-slate-400 hover:text-blue-600">
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </td>
 
                    {/* Status Cell (NOW CLICKABLE) */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingStatusId === product.id} // Disable during update
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                          product.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {togglingStatusId === product.id ? (
                          'Updating...'
                        ) : (
                          <>
                            {product.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {product.isActive ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                   
                    {/* Actions Cell */}
                    <td className="p-4 flex gap-3 text-slate-400">
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
    </div>
  );
}