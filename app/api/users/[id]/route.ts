import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("DELETE user error:", error);

    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}