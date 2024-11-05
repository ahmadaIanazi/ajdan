import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types/employee";

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "visitor",
      setRole: (role) => set({ role }),
    }),
    {
      name: "role-storage",
    }
  )
);
