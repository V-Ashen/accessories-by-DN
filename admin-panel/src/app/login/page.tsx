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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-black"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition mt-4"
          >
            {loading ? "Verifying..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}