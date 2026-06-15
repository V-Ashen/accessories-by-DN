"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReviewCard from "./ReviewCard";
import { Truck, CheckCircle, Award } from "lucide-react";

interface Review {
  id: string;
  platform: "facebook" | "google";
  reviewerName: string;
  reviewText: string;
}

function SkeletonReview() {
  return (
    <div className="flex flex-col gap-3 bg-white border border-[#E0DDD6] rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E8E4DF]" />
        <div className="h-3 bg-[#E8E4DF] rounded-full w-1/3" />
      </div>
      <div className="h-3 bg-[#E8E4DF] rounded-full w-full" />
      <div className="h-3 bg-[#E8E4DF] rounded-full w-5/6" />
      <div className="h-3 bg-[#E8E4DF] rounded-full w-2/3" />
    </div>
  );
}

const services = [
  {
    icon: Truck,
    title: "Fast Delivery",
    body: "Reliable and swift delivery across Sri Lanka.",
    badge: "FREE delivery above LKR 3,000",
  },
  {
    icon: CheckCircle,
    title: "Quality Assured",
    body: "Hand-picked, high-quality trend-setting fashion jewellery.",
    badge: null,
  },
  {
    icon: Award,
    title: "Customer First",
    body: "24/7 dedicated customer service to support your purchases.",
    badge: null,
  },
];

export default function ServicesSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(3));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <section className="bg-[#FAF9F7] py-20 px-4 sm:px-6 lg:px-8" id="services">
      <div className="max-w-7xl mx-auto">

        {/* ── Service Highlights ── */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
            Our Promise
          </p>
          <h2
            className="text-3xl font-semibold text-[#1C1C1E] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {services.map(({ icon: Icon, title, body, badge }) => (
            <div
              key={title}
              className="group flex flex-col items-center text-center bg-white border border-[#E0DDD6] rounded-2xl p-8 hover:border-[#C9A84C] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                <Icon size={24} className="text-[#C9A84C]" strokeWidth={1.5} />
              </div>
              <h3
                className="text-lg font-semibold text-[#1C1C1E] mb-2 tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {title}
              </h3>
              <p className="text-[#888] text-sm leading-relaxed mb-4">{body}</p>
              {badge && (
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C] px-3 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ── Customer Reviews ── */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-1">
            Testimonials
          </p>
          <h2
            className="text-3xl font-semibold text-[#1C1C1E] tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            What Our Customers Say
          </h2>
        </div>

        {loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonReview key={i} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#888] text-sm tracking-wide">
              No reviews yet — be the first to leave one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}