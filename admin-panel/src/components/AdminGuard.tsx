"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAdminData, roleCode } = useAdminAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user's role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          const fetchedRole = userDoc.data().roleCode;
          
          // Allow 0, 1, or 2. Kick out 99 (Customers).
          if (fetchedRole === 0 || fetchedRole === 1 || fetchedRole === 2) {
            setAdminData(currentUser, fetchedRole);
          } else {
            alert("Access Denied: You are not an administrator.");
            router.push("/login"); // We will create this login page later if needed
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setAdminData]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-xl">Verifying Admin Access...</div>;
  if (roleCode === null) return null; // Prevent flash of content if kicked out

  return <>{children}</>;
}