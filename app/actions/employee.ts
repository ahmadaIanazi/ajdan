"use server";

import { z } from "zod";
import { createEmployee, deleteEmployee } from "@/lib/db";
import { employeeSchema } from "@/lib/validations/employee";
import { revalidatePath } from "next/cache";

export async function addEmployee(values: z.infer<typeof employeeSchema>) {
  try {
    const validatedFields = employeeSchema.parse(values);

    const { qualifications, ...employeeData } = validatedFields;

    const newEmployee = await createEmployee({
      employee: employeeData,
      qualifications: qualifications.map((q) => ({
        institution: q.institution,
        yearOfCompletion: q.yearOfCompletion,
        designation: q.designation,
      })),
    });

    revalidatePath("/");
    return { success: true, error: null, data: newEmployee };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message, data: null };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
      data: null,
    };
  }
}

export async function removeEmployee(id: string) {
  try {
    await deleteEmployee(id);
    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return {
      success: false,
      error: "Failed to delete employee. Please try again.",
    };
  }
}
