"use client";

import { useRoleStore } from "@/store/use-role-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/types/employee";

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "employee", label: "Employee" },
  { value: "visitor", label: "Visitor" },
];

export function RoleSelector() {
  const { role, setRole } = useRoleStore();

  return (
    <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select role' />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
