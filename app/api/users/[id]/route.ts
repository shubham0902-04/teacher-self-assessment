import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const { name, email, employeeId, role, schoolId, departmentId, password } =
      body;

    // Build update object
    const updateData: Record<string, unknown> = {
      name: name?.trim(),
      email: email?.toLowerCase().trim(),
      employeeId: employeeId?.trim() || undefined,
      role,
      schoolId: schoolId || undefined,
      departmentId: departmentId || undefined,
    };

    // Only update password if provided
    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    // Check duplicate email (exclude current user)
    if (email) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Email already in use by another user" },
          { status: 409 },
        );
      }
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT user error:", error);
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
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 },
    );
  }
}
