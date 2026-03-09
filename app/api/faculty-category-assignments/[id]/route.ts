import { NextResponse } from "next/server";
import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";
import { connectDB } from "@/lib/db/connect";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const updated = await FacultyCategoryAssignment.findByIdAndUpdate(
      id,
      body,
      { returnDocument: "after" },
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT assignment error:", error);

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

    await FacultyCategoryAssignment.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Assignment deleted",
    });
  } catch (error) {
    console.error("DELETE assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}
