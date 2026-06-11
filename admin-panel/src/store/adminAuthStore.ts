import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AdminAuthStore {
  user: User | null;
  roleCode: number | null; // 0 = Master, 1 = Admin, 2 = Staff
  setAdminData: (user: User | null, roleCode: number | null) => void;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  user: null,
  roleCode: null,
  setAdminData: (user, roleCode) => set({ user, roleCode }),
}));