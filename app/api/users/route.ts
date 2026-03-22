import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";
import bcrypt from "bcryptjs";

// ✅ CREATE USER
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { name, email, password, role } = body;

    // 🔴 VALIDATION
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔴 CHECK DUPLICATE EMAIL
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("User creation error:", error);

    return NextResponse.json(
      { success: false, message: "User creation failed" },
      { status: 500 },
    );
  }
}

// ✅ GET USERS (IMPORTANT)
export async function GET() {
  try {
    await connectDB();

    const users = await User.find().select("-password");

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
