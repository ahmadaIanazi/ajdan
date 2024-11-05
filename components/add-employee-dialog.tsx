"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddEmployeeForm } from "@/components/add-employee-form";
import type { Employee } from "@/types/employee";

interface AddEmployeeDialogProps {
  onEmployeeAdded?: (employee: Employee) => void;
  onSuccess?: () => void;
}

export function AddEmployeeDialog({ onEmployeeAdded, onSuccess }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (employee: Employee) => {
    onEmployeeAdded?.(employee);
    onSuccess?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='whitespace-nowrap'>
          <PlusCircle className='h-4 w-4 mr-2' />
          <span className='hidden sm:inline'>Add Employee</span>
          <span className='sm:hidden'>Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Fill in the employee details below. All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <AddEmployeeForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
