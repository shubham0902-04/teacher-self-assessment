import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const requesterRole = payload.role as string;
    const requesterId = payload.id as string;

    const body = await req.json();
    let { name, email, password, role, employeeId, schoolId, departmentId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // Role-based restrictions
    if (requesterRole === "Principal") {
      if (!["HOD", "Faculty"].includes(role)) {
        return NextResponse.json(
          { success: false, message: "Principal can only create HOD or Faculty" },
          { status: 403 }
        );
      }
      const principal = await User.findById(requesterId).select("schoolId");
      schoolId = principal?.schoolId;
    } else if (requesterRole === "HOD") {
      if (role !== "Faculty") {
        return NextResponse.json(
          { success: false, message: "HOD can only create Faculty members" },
          { status: 403 }
        );
      }
      const hod = await User.findById(requesterId).select("schoolId departmentId");
      schoolId = hod?.schoolId;
      departmentId = hod?.departmentId;
    } else if (requesterRole === "Admin" || requesterRole === "Chairman" || requesterRole === "Director") {
      // Admin can do anything
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
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

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;
    const userId = payload.id as string;

    let filter: Record<string, any> = { _id: { $ne: userId } };

    if (role === "Admin" || role === "Chairman" || role === "Director") {
      // No filter
    } else if (role === "Principal") {
      const principal = await User.findById(userId).select("schoolId");
      if (principal?.schoolId) {
        filter.schoolId = principal.schoolId;
      }
    } else if (role === "HOD") {
      const hod = await User.findById(userId).select("departmentId");
      if (hod?.departmentId) {
        filter.departmentId = hod.departmentId;
      }
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const users = await User.find(filter)
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