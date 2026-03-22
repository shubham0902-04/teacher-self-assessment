import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import ParameterField from "@/models/ParameterField";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ UPDATE FIELD
export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const updated = await ParameterField.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update field error:", error);

    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}

// ✅ DELETE FIELD
export async function DELETE(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    await ParameterField.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Field deleted",
    });
  } catch (error) {
    console.error("Delete field error:", error);

    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}
