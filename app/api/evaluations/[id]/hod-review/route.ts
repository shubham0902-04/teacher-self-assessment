import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH /api/evaluations/[id]/hod-review ───────────────────────────────────
// Allowed actions:
//   action: "approve"  → status becomes SUBMITTED_TO_PRINCIPAL
//   action: "return"   → status becomes RETURNED_BY_HOD
// Body: { action: "approve" | "return", hodRemarks: string }

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await connectDB();

    // ── Auth — only HOD ────────────────────────────────────────────────────────
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

    if (payload.role !== "HOD") {
      return NextResponse.json(
        { success: false, message: "Forbidden — only HOD can perform this action" },
        { status: 403 },
      );
    }

    const hodId = payload.id as string;

    // ── Fetch HOD's department ─────────────────────────────────────────────────
    const hod = await User.findById(hodId).select("departmentId");
    if (!hod?.departmentId) {
      return NextResponse.json(
        { success: false, message: "HOD department not configured" },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const { action, hodRemarks, categoriesData } = body as {
      action: "approve" | "return";
      hodRemarks?: string;
      categoriesData?: unknown[];
    };

    if (!action || !["approve", "return"].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'action must be "approve" or "return"' },
        { status: 400 },
      );
    }

    // ── Find the evaluation — must belong to HOD's department ─────────────────
    const evaluation = await TeacherEvaluation.findOne({
      _id: id,
      departmentId: hod.departmentId,
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, message: "Evaluation not found or not in your department" },
        { status: 404 },
      );
    }

    // ── Must be in SUBMITTED_TO_HOD status ────────────────────────────────────
    if (evaluation.status !== "SUBMITTED_TO_HOD") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot review an evaluation with status "${evaluation.status}". It must be SUBMITTED_TO_HOD.`,
        },
        { status: 400 },
      );
    }

    // ── Apply transition ───────────────────────────────────────────────────────
    const newStatus =
      action === "approve" ? "SUBMITTED_TO_PRINCIPAL" : "RETURNED_BY_HOD";

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      hodRemarks: hodRemarks?.trim() || "",
      reviewedByHODAt: new Date(),
    };

    // Save HOD marks if provided
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      updatePayload.categoriesData = categoriesData;
    }

    if (action === "approve") {
      updatePayload.submittedToPrincipalAt = new Date();
    }

    const updated = await TeacherEvaluation.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true },
    )
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/evaluations/[id]/hod-review error:", error);
    return NextResponse.json(
      { success: false, message: "HOD review failed" },
      { status: 500 },
    );
  }
}

// ── GET /api/evaluations/[id]/hod-review ─────────────────────────────────────
// Returns full evaluation (HOD-scoped). Used by the review detail page.

export async function GET(req: Request, context: RouteContext) {
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

    if (payload.role !== "HOD") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const hodId = payload.id as string;
    const hod = await User.findById(hodId).select("departmentId");

    const { id } = await context.params;

    const evaluation = await TeacherEvaluation.findOne({
      _id: id,
      departmentId: hod?.departmentId,
    })
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    if (!evaluation) {
      return NextResponse.json(
        { success: false, message: "Evaluation not found or not in your department" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("GET /api/evaluations/[id]/hod-review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch evaluation" },
      { status: 500 },
    );
  }
}
