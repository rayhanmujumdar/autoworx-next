import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  searchParams: { params: { email: string } },
) {
  const email = searchParams.params.email;
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      role: true,
      employeeType: true,
    },
  });

  if (!user) {
    return NextResponse.json({
      message: "User not found",
      status: 404,
    });
  }

  return NextResponse.json({
    status: 200,
    data: user,
  });
}
