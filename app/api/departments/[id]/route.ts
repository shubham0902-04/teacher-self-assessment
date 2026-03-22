import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Department from "@/models/Department";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await Department.findByIdAndUpdate(id, body, {
      new: true,
    }).populate("schoolId", "schoolName schoolCode");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT department error:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    await Department.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (error) {
    console.error("DELETE department error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}
