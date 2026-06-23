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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="glass-glow bg-[var(--background)] w-full max-w-sm rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">

        {/* Header band */}
        <div className="bg-white/5 border-b border-[var(--border)] px-8 py-6 relative">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-0.5" style={{ textShadow: "0 0 8px var(--accent-glow)" }}>
            {isLogin ? "Welcome back" : "Join us"}
          </p>
          <h2
            className="text-2xl font-semibold text-[var(--foreground)] tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close"
            className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200"
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
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[var(--border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest uppercase text-[var(--muted)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-[#0f1115] text-[10px] font-bold tracking-widest uppercase py-3.5 rounded-full hover:bg-white active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-[0_0_15px_var(--accent-glow)]"
            >
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 border border-[var(--border)] bg-transparent text-[var(--foreground)] text-xs font-semibold tracking-wide py-3 rounded-full hover:border-[var(--accent)] hover:bg-white/5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-4 h-4"
            />
            Continue with Google
          </button>

          {/* Toggle */}
          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1.5 font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-150"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}