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
    <div className="flex flex-col rounded-2xl overflow-hidden border border-[#E0DDD6] animate-pulse">
      <div className="h-16 bg-[#E8E4DF]" />
      <div className="bg-gray-500 p-5 flex flex-col gap-3">
        <div className="h-3 bg-[#E8E4DF] rounded-full w-full" />
        <div className="h-3 bg-[#E8E4DF] rounded-full w-5/6" />
        <div className="h-3 bg-[#E8E4DF] rounded-full w-2/3" />
        <div className="flex items-center gap-3 pt-3 border-t border-[#F0EDE8]">
          <div className="w-8 h-8 rounded-full bg-[#E8E4DF]" />
          <div className="h-3 bg-[#E8E4DF] rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}

const services = [
  {
    num: "01",
    icon: Truck,
    title: "Fast Delivery",
    body: "Reliable and swift delivery across Sri Lanka.",
    badge: "Free Delivery above LKR 3,000",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Quality Assured",
    body: "Hand-picked, high-quality trend-setting fashion jewellery.",
    badge: null,
  },
  {
    num: "03",
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
    <div id="services">

      {/* ── Services — horizontal row layout ── */}
      <section className="bg-[#FAF9F7] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
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

          {/* Single bordered panel with stacked rows — no individual cards */}
          <div className="border border-[#E0DDD6] rounded-2xl overflow-hidden bg-white">
            {services.map(({ num, icon: Icon, title, body, badge }, i) => (
              <div
                key={title}
                className={`group flex items-center hover:bg-[#FDFCFA] transition-colors duration-150 ${
                  i < services.length - 1 ? "border-b border-[#E0DDD6]" : ""
                }`}
              >
                {/* Number column */}
                <div className="w-16 sm:w-20 flex items-center justify-center py-7 border-r border-[#E0DDD6] flex-shrink-0">
                  <span
                    className="text-2xl sm:text-3xl font-bold text-[#E0DDD6] leading-none select-none"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {num}
                  </span>
                </div>

                {/* Icon column */}
                <div className="w-14 sm:w-16 flex items-center justify-center py-7 border-r border-[#F0EDE8] flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon size={16} className="text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 sm:px-8 py-7">
                  <h3
                    className="text-[15px] font-semibold text-[#1C1C1E] tracking-wide mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs text-[#888] leading-relaxed">{body}</p>
                </div>

                {/* Badge (if any) */}
                {badge && (
                  <div className="hidden sm:flex items-center px-6 flex-shrink-0">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C] px-3 py-1 rounded-full whitespace-nowrap">
                      {badge}
                    </span>
                  </div>
                )}

                {/* Arrow */}
                <div className="px-5 sm:px-6 flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-[#D0CCC6] group-hover:text-[#C9A84C] transition-colors duration-150"
                    fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

    </div>
  );
}