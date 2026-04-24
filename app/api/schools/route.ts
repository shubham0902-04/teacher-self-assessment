import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import School from "@/models/School";

export async function GET() {
  try {
    await connectDB();
    const schools = await School.find().sort({ schoolName: 1 }).lean();
    return NextResponse.json({ success: true, data: schools });
  } catch (error) {
    console.error("GET schools error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { schoolName, schoolCode } = body;

    if (!schoolName?.trim()) {
      return NextResponse.json(
        { success: false, message: "School name is required" },
        { status: 400 }
      );
    }
    if (!schoolCode?.trim()) {
      return NextResponse.json(
        { success: false, message: "School code is required" },
        { status: 400 }
      );
    }

    const existing = await School.findOne({
      schoolCode: schoolCode.trim().toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "School code already exists" },
        { status: 409 }
      );
    }

    const school = await School.create({
      schoolName: schoolName.trim(),
      schoolCode: schoolCode.trim().toUpperCase(),
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, data: school });
  } catch (error) {
    console.error("POST school error:", error);
    return NextResponse.json(
      { success: false, message: "School creation failed" },
      { status: 500 }
    );
  }
}