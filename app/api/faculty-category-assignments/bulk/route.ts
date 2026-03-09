import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    for (const item of body) {
      const { facultyId, assignedCategories, academicYear } = item;

      await FacultyCategoryAssignment.findOneAndUpdate(
        { facultyId, academicYear },
        {
          facultyId,
          academicYear,
          assignedCategories,
        },
        {
          upsert: true,
          new: true,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bulk assignments saved",
    });
  } catch (error) {
    console.error("Bulk assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Bulk save failed" },
      { status: 500 },
    );
  }
}
