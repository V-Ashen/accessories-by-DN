"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Log in via Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Send them to the dashboard. The AdminGuard will intercept and verify their 0-1-2 role!
      router.push("/"); 
    } catch (error: any) {
      alert("Invalid Admin Credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A84C]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-[#121214]/80 backdrop-blur-xl border border-[#2A2A2E] max-w-md w-full p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-4">
            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6 text-[#C9A84C]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2zM7 21V10a5 5 0 0110 0v11H7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Accessories by DN</h1>
          <p className="text-[#C9A84C] text-xs font-semibold tracking-[0.2em] uppercase mt-2">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0B0C10]/50 border border-[#2A2A2E] rounded-xl focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0B0C10]/50 border border-[#2A2A2E] rounded-xl focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C] outline-none text-white transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#C9A84C] text-[#121214] font-bold py-3.5 rounded-xl hover:bg-[#D4B65F] transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Secure Entrance"}
          </button>
        </form>
      </div>
    </div>
  );
}