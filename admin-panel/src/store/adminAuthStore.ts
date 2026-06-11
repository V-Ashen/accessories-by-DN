import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AdminAuthStore {
  user: User | null;
  roleCode: number | null; // 0 = Master, 1 = Admin, 2 = Staff, 99 = Customer
  permissions: string[] | null; // e.g., ["view_dashboard", "manage_orders"]
  setAdminData: (user: User | null, roleCode: number | null, permissions: string[] | null) => void;
  // New: Method to check if user has a specific permission
  hasPermission: (permission: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthStore>((set, get) => ({
  user: null,
  roleCode: null,
  permissions: null,
  setAdminData: (user, roleCode, permissions) => set({ user, roleCode, permissions }),
  hasPermission: (permission) => {
    const state = get();
    return !!state.permissions && state.permissions.includes(permission);
  },
}));