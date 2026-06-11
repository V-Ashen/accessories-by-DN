"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setAdminData, roleCode } = useAdminAuthStore(); // roleCode is just for initial checks
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fetchedRoleCode = userData.roleCode;
          const fetchedRoleName = userData.roleName; // Master Admin, Admin, Cashier, etc.

          // 1. Check if the user has an admin role code
          if (fetchedRoleCode === 0 || fetchedRoleCode === 1 || fetchedRoleCode === 2) {
            // 2. Fetch the permissions associated with their role name
            const rolesQuery = query(collection(db, "roles"), where("name", "==", fetchedRoleName));
            const rolesSnapshot = await getDocs(rolesQuery);
            
            let permissions: string[] = [];
            if (!rolesSnapshot.empty) {
              permissions = rolesSnapshot.docs[0].data().permissions || [];
            } else {
              // Fallback for Master Admin if no role entry in 'roles' collection yet
              if (fetchedRoleCode === 0) {
                 permissions = ["view dashboard", "manage orders", "manage products", "manage staff", "manage roles"];
              }
            }
            
            setAdminData(currentUser, fetchedRoleCode, permissions);
          } else {
            // User is logged into Auth but has a customer roleCode (99)
            if (pathname !== "/login") {
              alert("Access Denied: Your account does not have admin privileges.");
              await signOut(auth); // Log them out from the admin panel
              router.push("/login");
            }
          }
        } else {
          // User is logged into Auth, but no Firestore document for role info (likely deleted)
          if (pathname !== "/login") {
            alert("Access Denied: Your admin role profile is missing.");
            await signOut(auth); // Force log out to clear bad state
            router.push("/login");
          }
        }
      } else {
        // User is not authenticated in Firebase Auth
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, setAdminData]);

  // If we are on the login page, just render its content directly
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-xl bg-slate-900 text-white">Verifying Admin Access...</div>;
  
  // Important: If after loading, roleCode is still null, it means guard failed authentication.
  // This helps prevent showing content to unauthorized users before redirection.
  if (roleCode === null) {
      return null; 
  }

  return <>{children}</>;
}