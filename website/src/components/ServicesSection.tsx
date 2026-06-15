"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReviewCard from "./ReviewCard";
import { Truck, CheckCircle, Award } from "lucide-react"; // Premium vector icons

interface Review {
  id: string;
  platform: 'facebook' | 'google';
  reviewerName: string;
  reviewText: string;
}

export default function ServicesSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Query Firestore to grab the 3 most recent customer reviews
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(3));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8" id="services">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Why Choose Us?</h2>

        {/* Service Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* 1. Delivery (Explicitly highlighting your LKR 3000 free delivery rule!) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <Truck size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">Fast Delivery</h3>
            <p className="text-slate-600 text-sm">Reliable and swift delivery across Sri Lanka.</p>
            <p className="font-extrabold text-blue-600 mt-3 text-sm bg-blue-50 py-1 px-3 rounded-full inline-block">
              FREE Delivery above LKR 3,000!
            </p>
          </div>

          {/* 2. Quality */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <CheckCircle size={40} className="mx-auto text-green-600 mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">Quality Assured</h3>
            <p className="text-slate-600 text-sm">Hand-picked, high-quality trend-setting fashion jewellery.</p>
          </div>

          {/* 3. Satisfaction */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <Award size={40} className="mx-auto text-yellow-600 mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">Customer First</h3>
            <p className="text-slate-600 text-sm">24/7 dedicated customer service to support your purchases.</p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">What Our Customers Say</h2>
        
        {loadingReviews ? (
          <p className="text-center text-slate-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-slate-500">No reviews yet. Be the first to leave one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}