import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    let filter: Record<string, any> = { role: "Faculty" };

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        if (payload.role === "HOD") {
          const hodUser = await User.findById(payload.id).select("departmentId");
          if (hodUser && hodUser.departmentId) {
            filter.departmentId = hodUser.departmentId;
          }
        }
      } catch (err) {
        console.error("JWT verification failed in faculties API", err);
      }
    }

    const faculties = await User.find(filter)
      .select("-password")
      .populate("departmentId", "departmentName departmentCode")
      .populate("schoolId", "schoolName schoolCode")
      .lean();

    return NextResponse.json({ success: true, data: faculties });
  } catch (error) {
    console.error("GET faculties error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculties" },
      { status: 500 },
    );
  }
}
