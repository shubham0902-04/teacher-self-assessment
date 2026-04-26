import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

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

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (role !== "Admin" && role !== "Chairman" && role !== "Director") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear") || getCurrentAcademicYear();

    const evaluations = await TeacherEvaluation.find({ academicYear })
      .populate("facultyId", "name email")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode")
      .lean();

    const total = evaluations.length;

    // Status breakdown
    const statusList = ["DRAFT", "SUBMITTED_TO_HOD", "RETURNED_BY_HOD", "SUBMITTED_TO_PRINCIPAL", "RETURNED_BY_PRINCIPAL", "FINALIZED"];
    const byStatus: Record<string, number> = {};
    statusList.forEach(s => byStatus[s] = 0);
    evaluations.forEach(ev => {
      const s = ev.status || "DRAFT";
      byStatus[s] = (byStatus[s] || 0) + 1;
    });

    // Stats calculations
    const schoolMap: Record<string, { schoolName: string; count: number; finalized: number; totalScore: number }> = {};
    const deptMap: Record<string, { departmentName: string; schoolName: string; count: number; finalized: number; avgScore: number }> = {};
    const performers: { evaluationId: string; name: string; dept: string; school: string; score: number }[] = [];

    let overallTotalScore = 0;
    let finalizedCount = 0;

    evaluations.forEach((ev: any) => {
      const school = ev.schoolId;
      const dept = ev.departmentId;
      if (!school || !dept) return;

      // Calculate Total Score for this evaluation
      let evalScore = 0;
      ev.categoriesData?.forEach((cat: any) => {
        cat.parameters?.forEach((param: any) => {
          param.entries?.forEach((entry: any) => {
            entry.fields?.forEach((field: any) => {
              evalScore += field.marks?.principal || field.marks?.hod || field.marks?.faculty || 0;
            });
          });
        });
      });

      // School Stats
      const sId = school._id.toString();
      if (!schoolMap[sId]) schoolMap[sId] = { schoolName: school.schoolName, count: 0, finalized: 0, totalScore: 0 };
      schoolMap[sId].count++;
      if (ev.status === "FINALIZED") {
        schoolMap[sId].finalized++;
        schoolMap[sId].totalScore += evalScore;
      }

      // Dept Stats
      const dId = dept._id.toString();
      if (!deptMap[dId]) deptMap[dId] = { departmentName: dept.departmentName, schoolName: school.schoolName, count: 0, finalized: 0, avgScore: 0 };
      deptMap[dId].count++;
      if (ev.status === "FINALIZED") deptMap[dId].finalized++;

      // Top Performers list
      if (ev.status === "FINALIZED") {
        performers.push({
          evaluationId: ev._id.toString(),
          name: ev.facultyId?.name || "Unknown",
          dept: dept.departmentName,
          school: school.schoolName,
          score: evalScore
        });
        overallTotalScore += evalScore;
        finalizedCount++;
      }
    });

    const bySchool = Object.values(schoolMap).sort((a, b) => b.count - a.count);
    const byDepartment = Object.values(deptMap).sort((a, b) => b.count - a.count);
    const topPerformers = performers.sort((a, b) => b.score - a.score).slice(0, 10);
    const avgScore = finalizedCount > 0 ? (overallTotalScore / finalizedCount).toFixed(1) : 0;

    // Recent submissions
    const recentSubmissions = evaluations
      .filter((e: any) => e.status !== "DRAFT")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((e: any) => ({
        _id: e._id.toString(),
        facultyName: e.facultyId?.name || "Unknown",
        departmentName: e.departmentId?.departmentName || "Unknown",
        status: e.status,
        submittedAt: e.updatedAt,
      }));

    return NextResponse.json({
      success: true,
      data: {
        academicYear,
        total,
        finalized: finalizedCount,
        avgScore,
        byStatus,
        bySchool,
        byDepartment,
        topPerformers,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("GET /api/evaluations/stats error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 });
  }
}
