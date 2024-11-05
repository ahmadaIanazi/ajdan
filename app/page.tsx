import { EmployeeList } from "@/components/employee-list";
import { RoleSelector } from "@/components/role-selector";

export default function HomePage() {
  return (
    <div className='container mx-auto py-6 space-y-8'>
      <header className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Employee Directory</h1>
        <RoleSelector />
      </header>
      <main>
        <EmployeeList />
      </main>
    </div>
  );
}
