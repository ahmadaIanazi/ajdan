import { db } from "./config";
import { unstable_noStore as noStore } from "next/cache";
import type { Employee, Qualification } from "@/types/employee";

async function ensureTablesExist() {
  try {
    // Check if tables exist
    const { rows: existingTables } = await db.sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('employees', 'qualifications');
    `;

    const tables = existingTables.map((row) => row.table_name);
    console.log("Existing tables:", tables);

    if (!tables.includes("employees")) {
      console.log("Creating employees table...");
      await db.sql`
        CREATE TABLE IF NOT EXISTS employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          age INTEGER NOT NULL,
          designation VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await db.sql`
        CREATE INDEX IF NOT EXISTS idx_employee_name ON employees(name);
      `;
    }

    if (!tables.includes("qualifications")) {
      console.log("Creating qualifications table...");
      await db.sql`
        CREATE TABLE IF NOT EXISTS qualifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          institution VARCHAR(255) NOT NULL,
          year_of_completion DATE NOT NULL,
          designation VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
    }

    return true;
  } catch (error) {
    console.error("Database Setup Error:", error);
    throw new Error(`Failed to ensure tables exist: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getEmployees() {
  noStore();
  try {
    console.log("Ensuring tables exist...");
    await ensureTablesExist();

    console.log("Fetching employees...");
    const { rows: employees } = await db.sql`
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', q.id,
              'institution', q.institution,
              'yearOfCompletion', q.year_of_completion,
              'designation', q.designation
            )
          ) FILTER (WHERE q.id IS NOT NULL),
          '[]'::json
        ) as qualifications
      FROM employees e
      LEFT JOIN qualifications q ON e.id = q.employee_id
      GROUP BY e.id
      ORDER BY e.created_at DESC;
    `;

    console.log("Fetched employees:", employees);
    return employees as (Employee & { qualifications: Qualification[] })[];
  } catch (error) {
    console.error("Database Error:", error);
    if (error instanceof Error) {
      if (error.message.includes('relation "employees" does not exist')) {
        console.log("Tables do not exist yet, returning empty array");
        return [];
      }
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
    throw new Error("Failed to fetch employees: Unknown error");
  }
}

export async function createEmployee({ employee, qualifications }: { employee: Omit<Employee, "id" | "createdAt" | "updatedAt">; qualifications: Omit<Qualification, "id">[] }) {
  noStore();
  try {
    await ensureTablesExist();

    // Start a transaction
    const client = await db.connect();

    try {
      await client.sql`BEGIN`;

      // Insert employee
      const {
        rows: [newEmployee],
      } = await client.sql`
        INSERT INTO employees (name, age, designation)
        VALUES (${employee.name}, ${employee.age}, ${employee.designation})
        RETURNING *
      `;

      // Insert qualifications
      if (qualifications.length > 0) {
        for (const qual of qualifications) {
          await client.sql`
            INSERT INTO qualifications (
              employee_id, 
              institution, 
              year_of_completion, 
              designation
            ) VALUES (
              ${newEmployee.id},
              ${qual.institution},
              ${qual.yearOfCompletion},
              ${qual.designation}
            )
          `;
        }
      }

      await client.sql`COMMIT`;
      return newEmployee;
    } catch (error) {
      await client.sql`ROLLBACK`;
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create employee");
  }
}

export async function getEmployeeById(id: string) {
  noStore();
  try {
    const { rows } = await db.sql`
      SELECT 
        e.*,
        json_agg(
          json_build_object(
            'id', q.id,
            'institution', q.institution,
            'yearOfCompletion', q.year_of_completion,
            'designation', q.designation
          )
        ) as qualifications
      FROM employees e
      LEFT JOIN qualifications q ON e.id = q.employee_id
      WHERE e.id = ${id}::uuid
      GROUP BY e.id
    `;

    if (rows.length === 0) return null;

    return rows[0] as Employee & { qualifications: Qualification[] };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch employee");
  }
}

export async function deleteEmployee(id: string) {
  noStore();
  try {
    const client = await db.connect();

    try {
      await client.sql`BEGIN`;

      // Delete qualifications first (cascade will handle this, but being explicit)
      await client.sql`
        DELETE FROM qualifications WHERE employee_id = ${id}::uuid
      `;

      // Delete employee
      const { rowCount } = await client.sql`
        DELETE FROM employees WHERE id = ${id}::uuid
      `;

      await client.sql`COMMIT`;

      if (rowCount === 0) {
        throw new Error("Employee not found");
      }

      return true;
    } catch (error) {
      await client.sql`ROLLBACK`;
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete employee");
  }
}
