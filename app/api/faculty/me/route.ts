import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Department from "@/models/Department";
import School from "@/models/School";
import EvaluationCategory from "@/models/EvaluationCategory";

void Department;
void School;
void EvaluationCategory;

const ACADEMIC_YEAR = "2025-26";

export async function GET() {
  try {
    await connectDB();

    // JWT se userId nikalo
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    // Faculty user fetch karo with department + school
    const user = await User.findById(userId)
      .select("-password")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Assigned categories fetch karo
    const assignment = await FacultyCategoryAssignment.findOne({
      facultyId: userId,
      academicYear: ACADEMIC_YEAR,
    }).populate("assignedCategories", "categoryName categoryCode");

    // Existing evaluation status check karo
    const evaluation = await TeacherEvaluation.findOne({
      facultyId: userId,
      academicYear: ACADEMIC_YEAR,
    }).select("status submittedToHODAt updatedAt");

    return NextResponse.json({
      success: true,
      data: {
        user,
        academicYear: ACADEMIC_YEAR,
        assignedCategories: assignment?.assignedCategories || [],
        evaluationStatus: evaluation?.status || "NOT_STARTED",
        lastUpdated: evaluation?.updatedAt || null,
        submittedAt: evaluation?.submittedToHODAt || null,
      },
    });
  } catch (error) {
    console.error("GET /api/faculty/me error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty data" },
      { status: 500 },
    );
  }
}
