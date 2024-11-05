"use client";

import { useState } from "react";
import { useRoleStore } from "@/store/use-role-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee } from "@/types/employee";
import { PlusCircle, Search } from "lucide-react";
import { AddEmployeeDialog } from "@/components/add-employee-dialog";

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "date-asc", label: "Date (Oldest)" },
  { value: "date-desc", label: "Date (Newest)" },
];

export function EmployeeList() {
  const { role } = useRoleStore();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [employees, setEmployees] = useState<Employee[]>([]); // This will later be replaced with a proper data fetching solution

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 flex-1'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <Input placeholder='Search employees...' value={search} onChange={(e) => setSearch(e.target.value)} className='max-w-sm' />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {role === "admin" && <AddEmployeeDialog />}
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No employees found</CardTitle>
            <CardDescription>{role === "admin" ? "Start by adding a new employee." : "Check back later for updates."}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
        <CardDescription>{employee.designation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p className='text-sm'>Age: {employee.age}</p>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Qualifications:</p>
            <ul className='text-sm list-disc list-inside'>
              {employee.qualifications.map((qual) => (
                <li key={qual.id}>
                  {qual.designation} - {qual.institution} ({new Date(qual.yearOfCompletion).getFullYear()})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
