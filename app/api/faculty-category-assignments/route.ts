import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";

export async function GET() {
  try {
    await connectDB();

    const data = await FacultyCategoryAssignment.find().lean();

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("GET assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const assignment = await FacultyCategoryAssignment.create(body);

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("POST assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Assignment creation failed" },
      { status: 500 },
    );
  }
}
