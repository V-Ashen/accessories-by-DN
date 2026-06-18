"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULT_CATEGORIES = ["Kitchenware", "Home Decor", "Tech", "Cosmetics"];

export default function AddProductPage() {
  const router = useRouter();
  
  // Core Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // New Fields (Category, Description, Alt Text)
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  // Categories list from DB
  const [categories, setCategories] = useState<any[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const catSnapshot = await getDocs(collection(db, "categories"));
      
      // FIX: Explicitly tell TypeScript that 'name' is a string
      let fetchedCats = catSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name as string, 
        ...doc.data() 
      }));

      if (catSnapshot.empty) {
        // Auto-seed defaults if collection is empty
        const seedPromises = DEFAULT_CATEGORIES.map(cat => 
          addDoc(collection(db, "categories"), { name: cat, createdAt: new Date() })
        );
        await Promise.all(seedPromises);
        
        const freshCatSnapshot = await getDocs(collection(db, "categories"));
        fetchedCats = freshCatSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name as string, 
          ...doc.data() 
        }));
      }

      setCategories(fetchedCats);
      if (fetchedCats.length > 0) {
        setCategory(fetchedCats[0].name); // Now TypeScript knows 'name' exists!
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Inline Custom Category Creation
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return alert("Please enter a valid category name!");
    setAddingCategory(true);
    try {
      const newCatRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        createdAt: new Date()
      });

      const newlyAddedCategory = { id: newCatRef.id, name: newCategoryName.trim() };
      
      setCategories(prev => [...prev, newlyAddedCategory]);
      setCategory(newCategoryName.trim()); // Set as selected category
      setShowNewCategoryInput(false);
      setNewCategoryName("");
      alert("New category added successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category.");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !stockQuantity || !imageUrl || !category) {
      alert("Please fill all mandatory fields and upload an image!");
      return;
    }

    setLoading(true);

    try {
      // Save data to Firestore with your new dynamic fields!
      await addDoc(collection(db, "products"), {
        name: name,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        category: category,
        description: description, // Saved to DB
        imageAlt: imageAlt, // Saved to DB for image SEO!
        images: [imageUrl], 
        isActive: true,
        createdAt: new Date(),
      });

      alert("Product Added Successfully!");
      
      // Reset form
      setName("");
      setPrice("");
      setStockQuantity("");
      setImageUrl("");
      setDescription("");
      setImageAlt("");
      router.push("/products"); // Push back to product overview list
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-2xl shadow-sm border text-slate-800 mb-20">
      
      {/* Header with Back Button (NEW) */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push("/products")} 
          className="p-2 border rounded-xl hover:bg-slate-50 transition text-slate-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Inventory Catalog</p>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Product Name & Dynamic Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Gold Butterfly Necklace"
            />
          </div>

          {/* DYNAMIC CATEGORY DROPDOWN */}
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === "ADD_NEW") {
                  setShowNewCategoryInput(true);
                  setCategory("");
                } else {
                  setCategory(e.target.value);
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
              onChange={(e) => setNewCategoryName(e.target.value)}
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
              onClick={() => { setShowNewCategoryInput(false); setCategory(categories[0]?.name || "Home Decor"); }}
              className="bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Row 2: Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Price (LKR)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Stock Quantity</label>
            <input
              type="number"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 50"
            />
          </div>
        </div>

        {/* SEO Description (NEW) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Product Description (Optional)</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
            placeholder="Write custom specifications here (leave blank to let our website AI auto-generate it!)"
          />
        </div>

        {/* Image Alt Text for Google SEO Indexing (NEW) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Image Alt Text (SEO)</label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Gold Butterfly Ring with floral engravings"
          />
          <p className="text-[10px] text-slate-400 mt-1">Describe this image in a sentence. Helps Google index your products in Search!</p>
        </div>

        {/* Image Uploader */}
        <div className="p-4 border-2 border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center">
          {imageUrl ? (
            <div className="text-center">
              <img src={imageUrl} alt="Preview" className="h-32 object-contain mb-2 rounded" />
              <p className="text-sm text-green-600 font-semibold">Image Uploaded!</p>
            </div>
          ) : (
            <ImageUpload onUpload={(url) => setImageUrl(url)} />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {loading ? "Adding Product..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}