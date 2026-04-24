import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Department from "@/models/Department";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    const query = schoolId ? { schoolId, isActive: true } : { isActive: true };
    const departments = await Department.find(query)
      .populate("schoolId", "schoolName schoolCode")
      .sort({ departmentName: 1 })
      .lean();

    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    console.error("GET departments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { departmentName, departmentCode, schoolId } = body;

    if (!departmentName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 },
      );
    }
    if (!departmentCode?.trim()) {
      return NextResponse.json(
        { success: false, message: "Department code is required" },
        { status: 400 },
      );
    }
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "School is required" },
        { status: 400 },
      );
    }

    const existing = await Department.findOne({
      departmentCode: departmentCode.trim().toUpperCase(),
      schoolId,
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Department code already exists in this school",
        },
        { status: 409 },
      );
    }

    const department = await Department.create({
      departmentName: departmentName.trim(),
      departmentCode: departmentCode.trim().toUpperCase(),
      schoolId,
      isActive: body.isActive ?? true,
    });

    const populated = await Department.findById(department._id).populate(
      "schoolId",
      "schoolName schoolCode",
    );

    return NextResponse.json({ success: true, data: populated });
  } catch (error) {
    console.error("POST department error:", error);
    return NextResponse.json(
      { success: false, message: "Department creation failed" },
      { status: 500 },
    );
  }
}
