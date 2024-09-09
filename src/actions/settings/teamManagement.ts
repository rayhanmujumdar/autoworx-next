
"use server";

import { db } from "@/lib/db"; 
import { getCompanyId } from "@/lib/companyId";
import { Role,EmployeeType } from "@prisma/client"; 

export const teamManagementUser = async (): Promise<{
  id: number;
  firstName: string;
  lastName: string | null;
  role: Role;
  image: string;
  employeeType: EmployeeType;
}[]> => {
  try {
   
    const companyId = await getCompanyId();

    // Fetch users from the database with the companyId filter
    const returnedUsers = await db.user.findMany({
      where: { companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        image: true,
        employeeType: true,
      },
    });

    return returnedUsers;
  } catch (error: any) {
    console.log("Error selecting data from user", error);
    throw error;
  }
};
