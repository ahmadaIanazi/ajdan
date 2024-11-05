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
        <Button>
          <PlusCircle className='w-4 h-4 mr-2' />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Fill in the employee details below. All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <AddEmployeeForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
