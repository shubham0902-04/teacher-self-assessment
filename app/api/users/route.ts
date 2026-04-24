import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, role, employeeId, schoolId, departmentId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      employeeId: employeeId?.trim() || undefined,
      schoolId: schoolId || undefined,
      departmentId: departmentId || undefined,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { success: false, message: "User creation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .select("-password")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode")
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}