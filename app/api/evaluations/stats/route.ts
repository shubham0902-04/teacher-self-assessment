import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/** Computes the current academic year dynamically */
function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // ── Auth — only Admin and Chairman can access stats ───────────────────────
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

    if (role !== "Admin" && role !== "Chairman") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    // ── Query params ──────────────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const academicYear =
      searchParams.get("academicYear") || getCurrentAcademicYear();

    // ── Fetch all evaluations for the academic year ───────────────────────────
    const evaluations = await TeacherEvaluation.find({ academicYear })
      .populate("facultyId", "name email")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode")
      .lean();

    const total = evaluations.length;

    // ── Status breakdown ──────────────────────────────────────────────────────
    const statusList = [
      "DRAFT",
      "SUBMITTED_TO_HOD",
      "RETURNED_BY_HOD",
      "SUBMITTED_TO_PRINCIPAL",
      "RETURNED_BY_PRINCIPAL",
      "FINALIZED",
    ];
    const byStatus: Record<string, number> = {};
    for (const s of statusList) byStatus[s] = 0;
    for (const ev of evaluations) {
      const s = ev.status || "DRAFT";
      byStatus[s] = (byStatus[s] || 0) + 1;
    }

    // ── By department breakdown ───────────────────────────────────────────────
    const deptMap: Record<
      string,
      { departmentName: string; count: number; finalized: number }
    > = {};
    for (const ev of evaluations) {
      const dept = ev.departmentId as {
        _id: string;
        departmentName: string;
      } | null;
      if (!dept) continue;
      const key = dept._id?.toString() ?? "unknown";
      if (!deptMap[key]) {
        deptMap[key] = { departmentName: dept.departmentName, count: 0, finalized: 0 };
      }
      deptMap[key].count += 1;
      if (ev.status === "FINALIZED") deptMap[key].finalized += 1;
    }
    const byDepartment = Object.values(deptMap).sort(
      (a, b) => b.count - a.count,
    );

    // ── Recent submissions (last 10 submitted to HOD or beyond) ──────────────
    const recentSubmissions = evaluations
      .filter((e) => e.status !== "DRAFT")
      .sort((a, b) => {
        const da = new Date(a.submittedToHODAt ?? a.updatedAt ?? 0).getTime();
        const db = new Date(b.submittedToHODAt ?? b.updatedAt ?? 0).getTime();
        return db - da;
      })
      .slice(0, 10)
      .map((e) => {
        const faculty = e.facultyId as { name?: string } | null;
        const dept = e.departmentId as { departmentName?: string } | null;
        return {
          _id: e._id?.toString(),
          facultyName: faculty?.name ?? "Unknown",
          departmentName: dept?.departmentName ?? "Unknown",
          status: e.status,
          submittedAt: e.submittedToHODAt ?? e.updatedAt,
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        academicYear,
        total,
        byStatus,
        byDepartment,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("GET /api/evaluations/stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
