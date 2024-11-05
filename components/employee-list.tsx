"use client";

import { useEffect, useState, useMemo } from "react";
import { AddEmployeeDialog } from "@/components/add-employee-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmployees } from "@/lib/db";
import { useRoleStore } from "@/store/use-role-store";
import type { Employee } from "@/types/employee";
import { Loader2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeCard } from "@/components/employee-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc";

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "date-asc", label: "Date (Oldest)" },
  { value: "date-desc", label: "Date (Newest)" },
] as const;

export function EmployeeList() {
  const { role } = useRoleStore();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  async function loadEmployees() {
    try {
      setError(null);
      console.log("Loading employees...");
      const data = await getEmployees();
      console.log("Loaded employees:", data);
      setEmployees(data);
    } catch (err) {
      console.error("Error loading employees:", err);
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadEmployees();
  }, []);

  // Function to handle optimistic updates
  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
  };

  const handleEmployeeDeleted = (deletedId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== deletedId));
  };

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchLower) ||
          employee.designation.toLowerCase().includes(searchLower) ||
          employee.qualifications.some((q) => q.institution.toLowerCase().includes(searchLower) || q.designation.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [employees, debouncedSearch, sortBy]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between'>
        <div className='w-full sm:w-auto flex items-center gap-2'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <Input placeholder='Search by name, designation, or qualifications...' value={search} onChange={(e) => setSearch(e.target.value)} className='w-full sm:w-[300px]' />
          {debouncedSearch && <span className='hidden sm:inline text-sm text-muted-foreground'>Found {filteredAndSortedEmployees.length} results</span>}
        </div>
        <div className='flex items-center gap-2 sm:gap-4'>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className='w-[140px] sm:w-[180px]'>
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
          {(role === "admin" || role === "employee") && <AddEmployeeDialog onEmployeeAdded={handleEmployeeAdded} onSuccess={loadEmployees} />}
        </div>
      </div>

      {debouncedSearch && <p className='sm:hidden text-sm text-muted-foreground text-center'>Found {filteredAndSortedEmployees.length} results</p>}

      {filteredAndSortedEmployees.length === 0 ? (
        <Card className='mt-4'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-xl'>{debouncedSearch ? "No matching employees found" : "No employees found"}</CardTitle>
            <CardDescription className='text-sm'>
              {debouncedSearch
                ? "Try adjusting your search terms"
                : role === "admin"
                ? "Start by adding a new employee."
                : role === "employee"
                ? "Add your record!"
                : "Check back later for updates."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredAndSortedEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onDelete={handleEmployeeDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-4 w-[200px]' />
              <Skeleton className='h-3 w-[150px]' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Skeleton className='h-3 w-[100px]' />
                <div className='space-y-1'>
                  <Skeleton className='h-3 w-[150px]' />
                  <Skeleton className='h-3 w-[180px]' />
                  <Skeleton className='h-3 w-[160px]' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-destructive'>Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
