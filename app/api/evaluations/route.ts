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

export async function GET() {
  try {
    await connectDB();
    const data = await TeacherEvaluation.find().populate(
      "facultyId",
      "name email",
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/evaluations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch evaluations" },
      { status: 500 },
    );
  }
}
