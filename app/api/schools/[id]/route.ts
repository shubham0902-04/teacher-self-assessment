import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import School from "@/models/School";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await School.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT school error:", error);
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
    await School.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "School deleted" });
  } catch (error) {
    console.error("DELETE school error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}
