import { EmployeeList } from "@/components/employee-list";
import Logo from "@/components/logo";
import { RoleSelector } from "@/components/role-selector";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 sm:py-6 space-y-4 sm:space-y-8">
      <header className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Logo />
          <h1 className="text-2xl sm:text-3xl font-bold">Employee Directory</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
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
