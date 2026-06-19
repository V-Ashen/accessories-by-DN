"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; // Added updateDoc
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updatePassword, updateEmail } from "firebase/auth"; // Added updatePassword, updateEmail
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore"; // Added
import { Edit, Trash2 } from "lucide-react";

// Initialize a secondary Firebase app for creating users without logging out the current admin
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
const secondaryApp = initializeApp(firebaseConfig, "SecondaryAuth");
const secondaryAuth = getAuth(secondaryApp);

export default function ManageStaffPage() {
  const { roleCode, hasPermission } = useAdminAuthStore(); // Get current user's roleCode and permissions
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]); // To populate role dropdown

  // Form states for adding/editing
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Only used for adding new or resetting for existing
  const [selectedRoleName, setSelectedRoleName] = useState(""); // Stores role name (e.g., "Admin", "Cashier")
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch roles for the dropdown
    const rolesSnap = await getDocs(collection(db, "roles"));
    setRoles(rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    // Fetch staff users
    const staffSnap = await getDocs(collection(db, "users"));
    const staffList = staffSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((s: any) => s.roleCode !== 99); // Exclude regular customers
      
    setStaff(staffList);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    // RBAC: Only Master Admin (0) or Admin (1) with manage staff permission can add
    if (roleCode !== 0 && (roleCode !== 1 || !hasPermission("manage staff"))) {
        alert("Permission Denied: You cannot add staff members.");
        return;
    }
    if (!selectedRoleName) return alert("Please select a role!");
    setLoading(true);

    try {
      const roleData = roles.find(r => r.name === selectedRoleName);
      if (!roleData) throw new Error("Selected role not found.");

      // RBAC: Admin (1) cannot add Master Admin (0)
      if (roleCode === 1 && roleData.level === 0) {
        alert("Permission Denied: Admins (Role 1) cannot create Master Admin accounts.");
        setLoading(false);
        return;
      }
      
      // Create user in Firebase Auth using the secondary app
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // Save user to Firestore Users table
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        roleName: roleData.name, // Save the role name
        roleCode: roleData.level, // Save the role code (0, 1, 2)
        createdAt: new Date()
      });

      alert("Staff Member Added!");
      setName(""); setEmail(""); setPassword(""); setSelectedRoleName("");
      fetchData(); // Refresh table
    } catch (error: any) {
      alert("Error adding staff: " + error.message);
    }
    setLoading(false);
  };

  // --- Edit User Functionality ---
  const handleEditClick = (user: any) => {
    // RBAC: Admin (1) cannot edit Master Admin (0)
    if (roleCode === 1 && user.roleCode === 0) {
      alert("Permission Denied: Admins (Role 1) cannot edit Master Admin (Role 0).");
      return;
    }
    // RBAC: Staff (2) cannot edit anyone
    if (roleCode === 2) {
      alert("Permission Denied: Staff (Role 2) cannot edit staff members.");
      return;
    }

    setEditingUser(user);
    setName(user.displayName);
    setEmail(user.email);
    setPassword(""); // Clear password field for security
    setSelectedRoleName(user.roleName);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // RBAC check again before update (redundancy for safety)
    if (roleCode === 1 && editingUser.roleCode === 0) {
      alert("Permission Denied: Admins (Role 1) cannot update Master Admin (Role 0).");
      return;
    }
    if (roleCode === 2) {
      alert("Permission Denied: Staff (Role 2) cannot update staff members.");
      return;
    }

    setLoading(true);
    try {
      const roleData = roles.find(r => r.name === selectedRoleName);
      if (!roleData) throw new Error("Selected role not found.");

      // 1. Update Firestore user document
      await updateDoc(doc(db, "users", editingUser.id), {
        displayName: name,
        email: email, // Update email in Firestore (Auth must be done separately)
        roleName: roleData.name,
        roleCode: roleData.level,
      });

      // 2. Potentially update Firebase Auth email/password (more complex for secondary app)
      // For a full production system, you'd handle email/password updates with more secure server-side logic
      // For now, we update the Firestore record as the primary data store for roles.
      // If email changes, the user would need to re-login with the new email.
      // If password changes, you'd need to re-authenticate the user for that change.
      // This part is out of scope for a quick demo, but know it's a future consideration.

      alert("Staff Member Updated!");
      setEditingUser(null); setName(""); setEmail(""); setPassword(""); setSelectedRoleName("");
      fetchData();
    } catch (error: any) {
      alert("Error updating staff: " + error.message);
    }
    setLoading(false);
  };


  const handleDeleteStaff = async (userToDelete: any) => {
    // RBAC: Only Master Admin (0) can delete Master Admin (0)
    // RBAC: Admin (1) cannot delete Master Admin (0)
    if (userToDelete.roleCode === 0 && roleCode !== 0) {
      alert("Permission Denied: Only Master Admin can delete other Master Admins.");
      return;
    }
    // RBAC: Staff (2) cannot delete anyone
    if (roleCode === 2) {
      alert("Permission Denied: Staff (Role 2) cannot delete staff members.");
      return;
    }

    if(confirm(`Are you sure you want to remove ${userToDelete.displayName} (${userToDelete.roleName})? This cannot be undone.`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "users", userToDelete.id));
        // You would also delete the user from Firebase Auth here in a full system
        alert("Staff Member Removed!");
        fetchData();
      } catch (error: any) {
        alert("Error deleting staff: " + error.message);
      }
      setLoading(false);
    }
  };

  // If the current user doesn't have manage staff permission AND isn't Master Admin
  if (roleCode !== 0 && !hasPermission("manage staff")) {
    return (
      <div className="p-8 max-w-7xl mx-auto mt-10 text-center text-red-600 font-bold text-2xl">
        Access Denied: You do not have permission to manage staff.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#1C1C1E] mb-8 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Manage Staff</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add/Edit Form */}
        <div className="bg-white border border-[#E0DDD6] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 text-[#1C1C1E]">{editingUser ? "Edit Staff Member" : "Add Staff Member"}</h2>
          <form onSubmit={editingUser ? handleUpdateStaff : handleAddStaff} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition" />
            </div>
            {!editingUser && ( // Password only for new users
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition" />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Assigned Role</label>
              <select required value={selectedRoleName} onChange={e => setSelectedRoleName(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition">
                <option value="">Select...</option>
                {roles.map(r => (
                  // RBAC: Admin (1) cannot assign Master Admin (0) role
                  <option key={r.id} value={r.name} disabled={roleCode === 1 && r.level === 0}>
                    {r.name} (Level {r.level})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition mt-6 ${editingUser ? "bg-[#1C1C1E] text-[#C9A84C] hover:bg-[#2A2A2E]" : "bg-[#C9A84C] text-[#1C1C1E] hover:bg-[#D4B65F]"}`}>
              {loading ? (editingUser ? "Updating..." : "Adding...") : (editingUser ? "Update Member" : "Add Member")}
            </button>
            {editingUser && (
                <button type="button" onClick={() => {setEditingUser(null); setName(""); setEmail(""); setPassword(""); setSelectedRoleName("");}} disabled={loading} className="w-full bg-[#FAF9F7] text-slate-600 border border-[#E0DDD6] font-bold py-3.5 rounded-xl hover:bg-[#E0DDD6] transition mt-2">
                    Cancel Edit
                </button>
            )}
          </form>
        </div>

        {/* Right: Staff Table */}
        <div className="lg:col-span-2 bg-white border border-[#E0DDD6] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-[#E0DDD6]">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DDD6]">
              {staff.map(user => (
                <tr key={user.id} className="hover:bg-[#FAF9F7] transition">
                  <td className="p-5 font-bold text-[#1C1C1E]">{user.displayName || "Unknown"}</td>
                  <td className="p-5 text-slate-500 text-sm">{user.email}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.roleCode === 0 ? "bg-[#1C1C1E] text-[#C9A84C]" :
                        user.roleCode === 1 ? "bg-slate-100 text-slate-700 border border-slate-200" :
                        "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                    }`}>
                      {user.roleName || `Level ${user.roleCode}`}
                    </span>
                  </td>
                  <td className="p-5 flex gap-3 text-slate-400">
                    {/* RBAC for action buttons */}
                    {user.roleCode === 0 ? (
                      <span className="text-xs italic text-[#C9A84C]">Master Admin</span>
                    ) : (
                      <>
                        {/* Only Admin (0 or 1) can edit if they have permission and not editing a Master Admin */}
                        {(roleCode === 0 || (roleCode === 1 && hasPermission("manage staff"))) && (
                          <button onClick={() => handleEditClick(user)} className="hover:text-[#C9A84C] p-2 bg-white border border-[#E0DDD6] rounded-lg hover:bg-[#1C1C1E] transition"><Edit size={16} /></button>
                        )}
                        {/* Only Admin (0 or 1) can delete if they have permission and not deleting a Master Admin */}
                        {(roleCode === 0 || (roleCode === 1 && hasPermission("manage staff"))) && (
                          <button onClick={() => handleDeleteStaff(user)} className="hover:text-red-600 p-2 bg-white border border-[#E0DDD6] rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}