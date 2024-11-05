import { EmployeeList } from "@/components/employee-list";
import Logo from "@/components/logo";
import { RoleSelector } from "@/components/role-selector";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className='container mx-auto py-6 space-y-8'>
      <header className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <Logo />
          <h1 className='text-3xl font-bold'>Employee Directory</h1>
        </div>
        <div className='flex items-center gap-4'>
          <ThemeToggle />
          <RoleSelector />
        </div>
      </header>
      <main>
        <EmployeeList />
      </main>
    </div>
  );
}
