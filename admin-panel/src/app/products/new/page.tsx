"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Imports the DB connection we made
import ImageUpload from "@/components/ImageUpload";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !stockQuantity || !imageUrl) {
      alert("Please fill all fields and upload an image!");
      return;
    }

    setLoading(true);

    try {
      // Save data to the 'products' collection in Firebase
      await addDoc(collection(db, "products"), {
        name: name,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        images: [imageUrl], // Saved as an array in case you want multiple images later
        isActive: true,
        createdAt: new Date(),
      });

      alert("Product Added Successfully!");
      
      // Clear the form
      setName("");
      setPrice("");
      setStockQuantity("");
      setImageUrl("");
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-lg shadow-md border text-slate-800">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Gold Butterfly Necklace"
          />
        </div>

        {/* Price & Stock Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Price (LKR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 50"
            />
          </div>
        </div>

        {/* Cloudinary Image Upload Component */}
        <div className="p-4 border-2 border-dashed rounded-md bg-slate-50 flex flex-col items-center justify-center">
          {imageUrl ? (
             // Show preview if image is uploaded
            <div className="text-center">
              <img src={imageUrl} alt="Preview" className="h-32 object-contain mb-2 rounded" />
              <p className="text-sm text-green-600 font-semibold">Image Uploaded!</p>
            </div>
          ) : (
             // Show upload button if no image yet
            <ImageUpload onUpload={(url) => setImageUrl(url)} />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-md hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {loading ? "Saving to Database..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}