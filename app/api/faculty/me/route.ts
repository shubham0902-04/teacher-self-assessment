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

/** Computes the current academic year dynamically (e.g. "2025-26").
 *  Rule: if current month >= June (6) → new academic year begins. */
function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // Read optional academicYear query param; fall back to dynamic current year
    const { searchParams } = new URL(req.url);
    const academicYear =
      searchParams.get("academicYear") || getCurrentAcademicYear();

    // Verify JWT from cookie
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

    // Fetch user, category assignment, and evaluation in parallel
    const [user, assignment, evaluation] = await Promise.all([
      User.findById(userId)
        .select("-password")
        .populate("departmentId", "departmentName departmentCode")
        .populate("schoolId", "schoolName schoolCode")
        .lean(),
      FacultyCategoryAssignment.findOne({
        facultyId: userId,
        academicYear,
      }).populate("assignedCategories", "categoryName categoryCode").lean(),
      TeacherEvaluation.findOne({
        facultyId: userId,
        academicYear,
      }).select("status submittedToHODAt updatedAt").lean(),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        academicYear,
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

