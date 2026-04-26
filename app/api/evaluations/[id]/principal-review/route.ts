import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "Principal") {
      return NextResponse.json({ success: false, message: "Forbidden — only Principal can perform this action" }, { status: 403 });
    }

    const principalId = payload.id as string;
    const principal = await User.findById(principalId).select("schoolId");

    const { id } = await context.params;
    const body = await req.json();
    const { action, principalRemarks, categoriesData } = body as {
      action: "approve" | "return";
      principalRemarks?: string;
      categoriesData?: any[];
    };

    if (!action || !["approve", "return"].includes(action)) {
      return NextResponse.json({ success: false, message: 'action must be "approve" or "return"' }, { status: 400 });
    }

    const evaluation = await TeacherEvaluation.findOne({
      _id: id,
      schoolId: principal?.schoolId,
    });

    if (!evaluation) {
      return NextResponse.json({ success: false, message: "Evaluation not found in your school" }, { status: 404 });
    }

    if (evaluation.status !== "SUBMITTED_TO_PRINCIPAL") {
      return NextResponse.json({ success: false, message: `Cannot review an evaluation with status "${evaluation.status}"` }, { status: 400 });
    }

    const newStatus = action === "approve" ? "FINALIZED" : "RETURNED_BY_PRINCIPAL";

    const updatePayload: Record<string, any> = {
      status: newStatus,
      principalRemarks: principalRemarks?.trim() || "",
      reviewedByPrincipalAt: new Date(),
    };

    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      updatePayload.categoriesData = categoriesData;
    }

    if (action === "approve") {
      updatePayload.finalizedAt = new Date();
    }

    const updated = await TeacherEvaluation.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/evaluations/[id]/principal-review error:", error);
    return NextResponse.json({ success: false, message: "Principal review failed" }, { status: 500 });
  }
}

export async function GET(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "Principal") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const principalId = payload.id as string;
    const principal = await User.findById(principalId).select("schoolId");

    const { id } = await context.params;

    const evaluation = await TeacherEvaluation.findOne({
      _id: id,
      schoolId: principal?.schoolId,
    })
      .populate("facultyId", "name email employeeId")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    if (!evaluation) {
      return NextResponse.json({ success: false, message: "Evaluation not found in your school" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("GET /api/evaluations/[id]/principal-review error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch evaluation" }, { status: 500 });
  }
}
