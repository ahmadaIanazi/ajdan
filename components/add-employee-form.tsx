"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, PlusCircle, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { useEmployeeStore } from "@/store/use-employee-store";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validations/employee";
import { useToast } from "@/hooks/use-toast";

export function AddEmployeeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      age: 0,
      designation: "",
      qualifications: [
        {
          institution: "",
          yearOfCompletion: new Date(),
          designation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "qualifications",
    control: form.control,
  });

  async function onSubmit(data: EmployeeFormValues) {
    try {
      setIsSubmitting(true);

      // Add a small delay to prevent spam submissions
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEmployee = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addEmployee(newEmployee);

      toast({
        title: "Success",
        description: "Employee added successfully",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='age'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type='number' placeholder='25' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='designation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input placeholder='Software Engineer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>Qualifications</h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                append({
                  institution: "",
                  yearOfCompletion: new Date(),
                  designation: "",
                })
              }
            >
              <PlusCircle className='w-4 h-4 mr-2' />
              Add Qualification
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className='space-y-4 p-4 border rounded-lg'>
              <FormField
                control={form.control}
                name={`qualifications.${index}.institution`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder='University Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`qualifications.${index}.yearOfCompletion`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Completion</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant='outline' className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`qualifications.${index}.designation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree/Certification</FormLabel>
                    <FormControl>
                      <Input placeholder='Bachelor of Science' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.length > 1 && (
                <Button type='button' variant='destructive' size='sm' onClick={() => remove(index)}>
                  <TrashIcon className='w-4 h-4 mr-2' />
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          Add Employee
        </Button>
      </form>
    </Form>
  );
}
