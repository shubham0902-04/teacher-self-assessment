import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const faculties = await User.find({ role: "Faculty" })
      .select("-password")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode");

    return NextResponse.json({ success: true, data: faculties });
  } catch (error) {
    console.error("GET faculties error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculties" },
      { status: 500 },
    );
  }
}
