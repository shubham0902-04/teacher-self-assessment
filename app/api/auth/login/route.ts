import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has been deactivated. Please contact the administrator.",
        },
        { status: 403 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment variables.");
      return NextResponse.json(
        {
          success: false,
          message: "Internal server error. Please try again later.",
        },
        { status: 500 },
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: "1d" },
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      schoolId: user.schoolId,
      departmentId: user.departmentId,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });

    // Session cookie — no maxAge means cookie is deleted when browser tab is closed
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}
