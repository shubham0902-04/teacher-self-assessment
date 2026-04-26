import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();

    // Auth check
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

    const { id } = await context.params;
    const body = await req.json();

    // Only allow faculty to update their own evaluation
    const existing = await TeacherEvaluation.findOne({ _id: id, facultyId });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Evaluation not found or unauthorized" },
        { status: 404 },
      );
    }

    // Status transition guard — once submitted, faculty cannot go back to draft
    const allowedTransitions: Record<string, string[]> = {
      NOT_STARTED: ["DRAFT", "SUBMITTED_TO_HOD"],
      DRAFT: ["DRAFT", "SUBMITTED_TO_HOD"],
      RETURNED_BY_HOD: ["DRAFT", "SUBMITTED_TO_HOD"],
      RETURNED_BY_PRINCIPAL: ["DRAFT", "SUBMITTED_TO_HOD"],
    };

    if (
      body.status &&
      existing.status &&
      !allowedTransitions[existing.status]?.includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot change status from ${existing.status} to ${body.status}`,
        },
        { status: 400 },
      );
    }

    const updated = await TeacherEvaluation.findByIdAndUpdate(
      id,
      { ...body, facultyId }, // facultyId cannot be changed
      { new: true },
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/evaluations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const evaluation = await TeacherEvaluation.findById(id)
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName")
      .populate("schoolId", "schoolName");

    if (!evaluation) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("GET /api/evaluations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch" },
      { status: 500 },
    );
  }
}
