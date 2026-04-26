import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// ── GET — fetch current admin's profile ──────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/settings/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// ── PATCH — update admin name / email ────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() && !email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nothing to update." },
        { status: 400 },
      );
    }

    // Check email uniqueness (exclude self)
    if (email?.trim()) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: payload.id },
      });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "This email is already used by another account.",
          },
          { status: 409 },
        );
      }
    }

    const updateData: Record<string, string> = {};
    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.toLowerCase().trim();
    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await User.findByIdAndUpdate(payload.id, updateData, {
      new: true,
    }).select("-password");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/settings/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 },
    );
  }
}
