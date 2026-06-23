"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReviewCard from "./ReviewCard";
import { Truck, CheckCircle, Award } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  platform: "facebook" | "google";
  reviewerName: string;
  reviewText: string;
}

function SkeletonReview() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/5 animate-pulse overflow-hidden">
      <div className="h-14 bg-white/5" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2.5 bg-white/10 rounded-full w-full" />
        <div className="h-2.5 bg-white/10 rounded-full w-5/6" />
        <div className="h-2.5 bg-white/10 rounded-full w-2/3" />
        <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
          <div className="w-7 h-7 rounded-full bg-white/10" />
          <div className="h-2.5 bg-white/10 rounded-full w-1/3" />
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
      <section className="bg-[var(--background)] py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#161921] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">

          <div className="mb-10 text-center sm:text-left">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-2" style={{ textShadow: "0 0 10px var(--accent-glow)" }}>
              Our promise
            </p>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--foreground)] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Why choose us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {services.map(({ num, icon: Icon, title, body, badge, accent }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass-glow rounded-2xl flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[var(--accent)]"
              >
                {/* Icon & Number Header */}
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-[0_0_20px_var(--accent-glow)] ${accent ? 'bg-[var(--accent)] text-[#0f1115]' : 'bg-white/10 text-[var(--foreground)] border border-white/20'}`}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] text-white/30 font-bold tracking-widest">{num}</span>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors">{title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{body}</p>
                </div>

                {/* Badge */}
                {badge && (
                  <div className="mt-auto pt-4 border-t border-[var(--border)]">
                    <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-[var(--accent)] text-[#0f1115] shadow-[0_0_10px_var(--accent-glow)]">
                      {badge}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[#161921] py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center mb-16">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-2" style={{ textShadow: "0 0 10px var(--accent-glow)" }}>
              Testimonials
            </p>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--foreground)] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What our customers say
            </h2>
          </div>

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonReview key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-[var(--border)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)]">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="text-[var(--foreground)] font-semibold mb-1">No reviews yet</p>
              <p className="text-sm text-[var(--muted)]">Be the first to leave one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ReviewCard {...review} />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}