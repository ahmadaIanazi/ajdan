export interface Employee {
  id: string;
  name: string;
  age: number;
  designation: string;
  qualifications: Qualification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Qualification {
  id: string;
  institution: string;
  yearOfCompletion: Date;
  designation: string;
}

export type UserRole = "admin" | "employee" | "visitor";
