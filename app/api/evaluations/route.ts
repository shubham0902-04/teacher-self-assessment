import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  try {
    await connectDB();

    // facultyId cookie se verify karo
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
    const facultyId = payload.id as string;

    const body = await req.json();

    // facultyId body se override — always use cookie
    const data = await TeacherEvaluation.create({
      ...body,
      facultyId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/evaluations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create evaluation" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // ── Auth check ────────────────────────────────────────────────────────────
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
    const role = payload.role as string;
    const userId = payload.id as string;

    // ── Academic year from query string ───────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear");

    // ── Role-based filter ─────────────────────────────────────────────────────
    // Admin / Chairman → all evaluations
    // HOD              → only evaluations from their department
    // Principal        → only evaluations from their school
    // Faculty / others → 403 Forbidden
    let filter: Record<string, unknown> = {};

    if (role === "Admin" || role === "Chairman" || role === "Director") {
      // No additional filter — see everything
    } else if (role === "HOD") {
      const User = (await import("@/models/User")).default;
      const hod = await User.findById(userId).select("departmentId");
      if (!hod?.departmentId) {
        return NextResponse.json(
          { success: false, message: "HOD department not configured" },
          { status: 400 },
        );
      }
      filter = { departmentId: hod.departmentId };
    } else if (role === "Principal") {
      const User = (await import("@/models/User")).default;
      const principal = await User.findById(userId).select("schoolId");
      if (!principal?.schoolId) {
        return NextResponse.json(
          { success: false, message: "Principal school not configured" },
          { status: 400 },
        );
      }
      filter = { schoolId: principal.schoolId };
    } else {
      return NextResponse.json(
        { success: false, message: "Forbidden — insufficient permissions" },
        { status: 403 },
      );
    }

    // ── Apply academic year filter ─────────────────────────────────────────────
    if (academicYear) {
      filter = { ...filter, academicYear };
    }

    const data = await TeacherEvaluation.find(filter)
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/evaluations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch evaluations" },
      { status: 500 },
    );
  }
}
