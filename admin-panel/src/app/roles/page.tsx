"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; // Added updateDoc, deleteDoc
import { db } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/adminAuthStore"; // Added
import { Edit, Trash2 } from "lucide-react"; // Added

const AVAILABLE_PERMS = [
  "view dashboard", "manage orders", "manage products", 
  "manage staff", "manage roles" // Relevant permissions for your system
];

export default function RolesPage() {
  const { roleCode, hasPermission } = useAdminAuthStore(); // Get current user's roleCode
  const [roles, setRoles] = useState<any[]>([]);
  const [roleName, setRoleName] = useState("");
  const [level, setLevel] = useState("2");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null); // For editing existing roles

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const snapshot = await getDocs(collection(db, "roles"));
    setRoles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleTogglePerm = (perm: string) => {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleCode !== 0 && !hasPermission("manage roles")) { // Only Master Admin can create/edit roles
        alert("Permission Denied: Only Master Admin can create/manage roles.");
        return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "roles"), {
        name: roleName,
        level: Number(level),
        permissions: selectedPerms
      });
      alert("Role Created!");
      setRoleName(""); setSelectedPerms([]); setLevel("2");
      fetchRoles();
    } catch (error) {
      alert("Failed to create role");
      console.error(error);
    }
    setLoading(false);
  };

  // --- New: Edit Functionality ---
  const handleEditRoleClick = (role: any) => {
    if (roleCode !== 0 && !hasPermission("manage roles")) {
        alert("Permission Denied: Only Master Admin can create/manage roles.");
        return;
    }
    setEditingRole(role);
    setRoleName(role.name);
    setLevel(String(role.level));
    setSelectedPerms(role.permissions || []);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleCode !== 0 && !hasPermission("manage roles")) {
        alert("Permission Denied: Only Master Admin can create/manage roles.");
        return;
    }
    if (!editingRole) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "roles", editingRole.id), {
        name: roleName,
        level: Number(level),
        permissions: selectedPerms
      });
      alert("Role Updated!");
      setRoleName(""); setSelectedPerms([]); setLevel("2"); setEditingRole(null);
      fetchRoles();
    } catch (error) {
      alert("Failed to update role");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteRole = async (roleId: string, roleName: string, roleLevel: number) => {
    if (roleCode !== 0 && !hasPermission("manage roles")) {
        alert("Permission Denied: Only Master Admin can create/manage roles.");
        return;
    }
    if (roleLevel === 0 || roleLevel === 1) { // Prevent deleting Master Admin or default Admin roles
      alert("Cannot delete core admin roles (Level 0 or 1).");
      return;
    }
    if (confirm(`Are you sure you want to delete the role "${roleName}"? This cannot be undone.`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "roles", roleId));
        alert("Role Deleted!");
        fetchRoles();
      } catch (error) {
        alert("Failed to delete role");
        console.error(error);
      }
      setLoading(false);
    }
  };


  // If the current user doesn't have manage roles permission AND isn't Master Admin
  if (roleCode !== 0 && !hasPermission("manage roles")) {
    return (
      <div className="p-8 max-w-7xl mx-auto mt-10 text-center text-red-600 font-bold text-2xl">
        Access Denied: You do not have permission to manage roles.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#1C1C1E] mb-8 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>System Roles & Permissions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Create/Edit Role Form */}
        <div className="bg-white border border-[#E0DDD6] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 text-[#1C1C1E]">{editingRole ? "Edit Role" : "Create Custom Role"}</h2>
          <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Role Name</label>
              <input required value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition" placeholder="e.g. Cashier" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Hierarchy Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-[#FAF9F7] border border-[#E0DDD6] rounded-xl p-3 outline-none focus:border-[#C9A84C] transition">
                <option value="0">Master Admin (Level 0)</option>
                <option value="1">Admin (Level 1)</option>
                <option value="2">Staff / Cashier (Level 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Granted Permissions</label>
              <div className="h-48 overflow-y-auto border border-[#E0DDD6] rounded-xl p-4 space-y-3 bg-[#FAF9F7]">
                {AVAILABLE_PERMS.map(perm => (
                  <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedPerms.includes(perm)} onChange={() => handleTogglePerm(perm)} className="w-4 h-4 text-[#C9A84C] border-[#E0DDD6] rounded focus:ring-[#C9A84C]" />
                    <span className="text-sm font-semibold text-[#1C1C1E] capitalize group-hover:text-[#C9A84C] transition">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition mt-6 ${editingRole ? "bg-[#1C1C1E] text-[#C9A84C] hover:bg-[#2A2A2E]" : "bg-[#C9A84C] text-[#1C1C1E] hover:bg-[#D4B65F]"}`}>
              {loading ? "Saving..." : (editingRole ? "Update Role" : "+ Create Role")}
            </button>
            {editingRole && (
                <button type="button" onClick={() => {setEditingRole(null); setRoleName(""); setSelectedPerms([]); setLevel("2");}} disabled={loading} className="w-full bg-[#FAF9F7] text-slate-600 border border-[#E0DDD6] font-bold py-3.5 rounded-xl hover:bg-[#E0DDD6] transition mt-2">
                    Cancel Edit
                </button>
            )}
          </form>
        </div>

        {/* Right Col: Roles Table */}
        <div className="lg:col-span-2 bg-white border border-[#E0DDD6] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-[#E0DDD6]">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Permissions</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DDD6]">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-[#FAF9F7] transition">
                  <td className="p-5 font-bold text-[#1C1C1E]">{role.name}</td>
                  <td className="p-5"><span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Lvl {role.level}</span></td>
                  <td className="p-5 flex flex-wrap gap-2">
                    {role.permissions?.map((p: string) => (
                      <span key={p} className="bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">
                        {p.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </td>
                  <td className="p-5">
                    <div className="flex gap-3 justify-end text-slate-400">
                      {/* Edit button */}
                      <button onClick={() => handleEditRoleClick(role)} className="hover:text-[#C9A84C] p-2 bg-white border border-[#E0DDD6] rounded-lg hover:bg-[#1C1C1E] transition"><Edit size={16} /></button>
                      {/* Delete button (only if not core admin roles) */}
                      {role.level !== 0 && role.level !== 1 && (
                        <button onClick={() => handleDeleteRole(role.id, role.name, role.level)} className="hover:text-red-600 p-2 bg-white border border-[#E0DDD6] rounded-lg hover:bg-red-50 transition"><Trash2 size={16} /></button>
                      )}
                    </div>
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