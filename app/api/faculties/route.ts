import { NextResponse } from "next/server";

export async function GET() {
  try {
    const faculties = [
      {
        _id: "fac1",
        name: "Dr. Aman Sharma",
        email: "aman@college.edu",
        employeeId: "EMP001",
        department: "Computer Science",
      },
      {
        _id: "fac2",
        name: "Prof. Neha Verma",
        email: "neha@college.edu",
        employeeId: "EMP002",
        department: "Mathematics",
      },
      {
        _id: "fac3",
        name: "Dr. Raj Mehta",
        email: "raj@college.edu",
        employeeId: "EMP003",
        department: "Physics",
      },
      {
        _id: "fac4",
        name: "Prof. Simran Kaur",
        email: "simran@college.edu",
        employeeId: "EMP004",
        department: "Computer Science",
      },
    ];

    return NextResponse.json({
      success: true,
      data: faculties,
    });
  } catch (error) {
    console.error("Faculty fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch faculties" },
      { status: 500 },
    );
  }
}
