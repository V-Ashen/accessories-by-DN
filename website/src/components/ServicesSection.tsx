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
    <div className="rounded-2xl border border-slate-100 bg-white animate-pulse overflow-hidden">
      <div className="h-14 bg-slate-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2.5 bg-slate-100 rounded-full w-full" />
        <div className="h-2.5 bg-slate-100 rounded-full w-5/6" />
        <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <div className="w-7 h-7 rounded-full bg-slate-100" />
          <div className="h-2.5 bg-slate-100 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}

const services = [
  {
    num: "01",
    icon: Truck,
    title: "Fast delivery",
    body: "Reliable and swift delivery across Sri Lanka.",
    badge: "Free above LKR 3,000",
    accent: true,
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Quality assured",
    body: "Hand-picked, high-quality trend-setting fashion jewellery.",
    badge: null,
    accent: false,
  },
  {
    num: "03",
    icon: Award,
    title: "Customer first",
    body: "24/7 dedicated customer service to support your purchases.",
    badge: null,
    accent: false,
  },
];

export default function ServicesSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
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
    fetchReviews();
  }, []);

  return (
    <div id="services">

      {/* Services */}
      <section className="bg-[#F7F6F3] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-medium mb-1">
              Our promise
            </p>
            <h2 className="text-2xl font-medium text-slate-900">Why choose us</h2>
          </div>

          <div className="flex flex-col gap-3">
            {services.map(({ num, icon: Icon, title, body, badge, accent }) => (
              <div
                key={title}
                className="group bg-white border-slate-100 rounded-r-2xl flex items-center gap-5 px-6 py-5 transition-colors duration-150 hover:bg-slate-50"
                style={{
                  borderTop: "0.5px solid #e5e7eb",
                  borderRight: "0.5px solid #e5e7eb",
                  borderBottom: "0.5px solid #e5e7eb",
                  borderLeft: `3px solid ${accent ? "#C9A84C" : "#1C1C1E"}`,
                  borderRadius: "0 14px 14px 0",
                }}
              >
                {/* Icon */}
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ background: accent ? "#C9A84C22" : "#1C1C1E" }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    style={{ color: accent ? "#C9A84C" : "#fff" }}
                  />
                </div>

                {/* Number + text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium tracking-wide mb-0.5">{num}</p>
                  <p className="text-[14px] font-medium text-slate-900">{title}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{body}</p>
                </div>

                {/* Badge */}
                {badge && (
                  <span
                    className="hidden sm:inline-block shrink-0 text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
                    style={{
                      color: "#C9A84C",
                      border: "0.5px solid #C9A84C66",
                      background: "#C9A84C11",
                    }}
                  >
                    {badge}
                  </span>
                )}

                {/* Chevron */}
                <svg
                  className="shrink-0 w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors duration-150"
                  fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-widest text-[#C9A84C] font-medium mb-1">
              Testimonials
            </p>
            <h2 className="text-2xl font-medium text-slate-900">What our customers say</h2>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonReview key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="text-slate-700 font-medium mb-1">No reviews yet</p>
              <p className="text-sm text-slate-400">Be the first to leave one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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