import { z } from "zod";

export const qualificationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(2, "Institution name is required"),
  yearOfCompletion: z.date({
    required_error: "Year of completion is required",
  }),
  designation: z.string().min(2, "Designation is required"),
});

export const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(18, "Employee must be at least 18 years old").max(100, "Invalid age"),
  designation: z.string().min(2, "Designation is required"),
  qualifications: z.array(qualificationSchema).min(1, "At least one qualification is required"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
