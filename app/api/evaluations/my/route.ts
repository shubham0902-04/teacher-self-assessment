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
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const facultyId = payload.id as string;

    const { searchParams } = new URL(req.url);
    const academicYear =
      searchParams.get("academicYear") || getCurrentAcademicYear();

    const evaluation = await TeacherEvaluation.findOne({
      facultyId,
      academicYear,
    });

    if (!evaluation) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("GET /api/evaluations/my error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch evaluation" },
      { status: 500 },
    );
  }
}
