"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { removeEmployee } from "@/app/actions/employee";
import { useRoleStore } from "@/store/use-role-store";
import type { Employee } from "@/types/employee";

interface EmployeeCardProps {
  employee: Employee;
  onDelete?: (id: string) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Generate a consistent color based on the name
function getAvatarColor(name: string) {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-green-100 text-green-700',
    'bg-blue-100 text-blue-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ]
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function EmployeeCard({ employee, onDelete }: EmployeeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { role } = useRoleStore();

  const initials = getInitials(employee.name);
  const avatarColor = getAvatarColor(employee.name);

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const result = await removeEmployee(employee.id);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      onDelete?.(employee.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Avatar className={`h-10 w-10 ${avatarColor}`}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{employee.name}</CardTitle>
                <CardDescription>{employee.designation}</CardDescription>
              </div>
            </div>
            {role === "admin" && (
              <Button variant='ghost' size='icon' className='text-destructive hover:text-destructive/90' onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
                <Trash2 className='h-4 w-4' />
              </Button>
            )}
          </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete {employee.name}'s record and all associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
