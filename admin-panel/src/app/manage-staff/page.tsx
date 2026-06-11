"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export default function ManageStaffPage() {
  const currentUserRole = useAdminAuthStore((state) => state.roleCode); // Will be 0, 1, or 2
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      // Fetch anyone who is NOT a normal customer (99)
      const q = query(collection(db, "users"), where("roleCode", "in", [0, 1, 2]));
      const snapshot = await getDocs(q);
      const staffList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, targetCurrentRole: number, newRole: number) => {
    // ENFORCING THE BUSINESS RULE:
    if (currentUserRole === 1 && targetCurrentRole === 0) {
      alert("Permission Denied: Admins (Role 1) cannot modify Master Admins (Role 0).");
      return;
    }
    
    if (currentUserRole === 2) {
      alert("Permission Denied: Staff (Role 2) cannot change roles.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", targetUserId), { roleCode: newRole });
      alert("Role updated successfully!");
      fetchStaff(); // Refresh the list
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  if (loading) return <div className="p-8">Loading Staff List...</div>;

  // Prevent Role 2 from even seeing this management page
  if (currentUserRole === 2) {
    return <div className="p-8 text-red-600 font-bold">You do not have permission to view this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 mt-10 bg-white rounded-lg shadow border text-slate-800">
      <h1 className="text-2xl font-bold mb-6">Manage Staff Roles</h1>
      <p className="mb-6 text-sm text-slate-500">
        Your current access level: <strong className="text-slate-900">Role {currentUserRole}</strong>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-sm">
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Current Role</th>
              <th className="p-3 border-b">Change Role To</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => {
              // Rule: Disable the dropdown if the logged-in user is Role 1 and the target is Role 0
              const isDropdownDisabled = currentUserRole === 1 && user.roleCode === 0;

              return (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.roleCode === 0 ? "bg-red-100 text-red-700" :
                      user.roleCode === 1 ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {user.roleCode === 0 ? "Master Admin (0)" : user.roleCode === 1 ? "Admin (1)" : "Staff (2)"}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      className="border rounded p-1 text-sm bg-white disabled:opacity-50 disabled:bg-slate-100"
                      value={user.roleCode}
                      disabled={isDropdownDisabled}
                      onChange={(e) => handleRoleChange(user.id, user.roleCode, Number(e.target.value))}
                    >
                      <option value={0}>Master Admin (0)</option>
                      <option value={1}>Admin (1)</option>
                      <option value={2}>Staff (2)</option>
                      <option value={99}>Remove Admin Access (Make Customer)</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}