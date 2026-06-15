"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const saveUserToDB = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Customer",
        roleCode: 99,
        createdAt: new Date(),
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserToDB(result.user);
      setAuthModalOpen(false);
    } catch (error) {
      alert("Authentication failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToDB(result.user);
      }
      setAuthModalOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[#FAF9F7] w-full max-w-sm rounded-2xl border border-[#E0DDD6] overflow-hidden">

        {/* Header band */}
        <div className="bg-[#1C1C1E] px-8 py-6 relative">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A84C] mb-0.5">
            {isLogin ? "Welcome back" : "Join us"}
          </p>
          <h2
            className="text-2xl font-semibold text-white tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close"
            className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/50 hover:border-white/50 hover:text-white transition-all duration-200"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7">

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#888] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E0DDD6] bg-white rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#bbb] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#888] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#E0DDD6] bg-white rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#bbb] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1C1E] text-[#FAF9F7] text-[10px] font-semibold tracking-widest uppercase py-3.5 rounded-full hover:bg-[#333] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E0DDD6]" />
            <span className="text-[10px] tracking-widest uppercase text-[#bbb]">or</span>
            <div className="flex-1 h-px bg-[#E0DDD6]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 border border-[#E0DDD6] bg-white text-[#1C1C1E] text-xs font-semibold tracking-wide py-3 rounded-full hover:border-[#C9A84C] hover:bg-[#FAF9F7] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-4 h-4"
            />
            Continue with Google
          </button>

          {/* Toggle */}
          <p className="mt-6 text-center text-xs text-[#888]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1.5 font-semibold text-[#1C1C1E] hover:text-[#C9A84C] transition-colors duration-150"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}