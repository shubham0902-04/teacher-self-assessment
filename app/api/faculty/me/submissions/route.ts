import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
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

    // Fetch all evaluations for this faculty, sorted by year
    const submissions = await TeacherEvaluation.find({ facultyId })
      .select("academicYear status submittedToHODAt updatedAt")
      .sort({ academicYear: -1 });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error("GET /api/faculty/me/submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
