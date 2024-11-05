import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee } from "@/types/employee";

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: [],
      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, employee],
        })),
      updateEmployee: (id, updatedEmployee) =>
        set((state) => ({
          employees: state.employees.map((emp) => (emp.id === id ? { ...emp, ...updatedEmployee } : emp)),
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        })),
    }),
    {
      name: "employee-storage",
    }
  )
);
