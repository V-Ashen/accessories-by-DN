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
      <h1 className="text-3xl font-extrabold text-[#0f172a] mb-8">System Roles & Permissions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Create/Edit Role Form */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6">{editingRole ? "Edit Role" : "Create Custom Role"}</h2>
          <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Role Name</label>
              <input required value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Cashier" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Hierarchy Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="0">Master Admin (Level 0)</option>
                <option value="1">Admin (Level 1)</option>
                <option value="2">Staff / Cashier (Level 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Granted Permissions</label>
              <div className="h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-slate-50">
                {AVAILABLE_PERMS.map(perm => (
                  <label key={perm} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedPerms.includes(perm)} onChange={() => handleTogglePerm(perm)} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm capitalize">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-lg transition ${editingRole ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
              {loading ? "Saving..." : (editingRole ? "Update Role" : "+ Create Role")}
            </button>
            {editingRole && (
                <button type="button" onClick={() => {setEditingRole(null); setRoleName(""); setSelectedPerms([]); setLevel("2");}} disabled={loading} className="w-full bg-slate-400 text-white font-bold py-3 rounded-lg hover:bg-slate-500 transition mt-2">
                    Cancel Edit
                </button>
            )}
          </form>
        </div>

        {/* Right Col: Roles Table */}
        <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Permissions</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th> {/* New Column */}
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{role.name}</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Lvl {role.level}</span></td>
                  <td className="p-4 flex flex-wrap gap-2">
                    {role.permissions?.map((p: string) => (
                      <span key={p} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">
                        {p.replace(/_/g, ' ')} {/* make permissions readable */}
                      </span>
                    ))}
                  </td>
                  <td className="p-4 flex gap-2">
                      {/* Edit button */}
                      <button onClick={() => handleEditRoleClick(role)} className="hover:text-blue-600 text-slate-400"><Edit size={18} /></button>
                      {/* Delete button (only if not core admin roles) */}
                      {role.level !== 0 && role.level !== 1 && (
                        <button onClick={() => handleDeleteRole(role.id, role.name, role.level)} className="hover:text-red-600 text-slate-400"><Trash2 size={18} /></button>
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