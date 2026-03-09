import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";
import EvaluationParameter from "@/models/EvaluationParameter";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const facultyId = searchParams.get("facultyId");
    const academicYear = searchParams.get("academicYear");

    const assignment = await FacultyCategoryAssignment.findOne({
      facultyId,
      academicYear,
    }).populate("assignedCategories");

    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: "No categories assigned",
      });
    }

    const categoryIds = assignment.assignedCategories.map(
      (c: { _id: string }) => c._id,
    );

    const parameters = await EvaluationParameter.find({
      categoryId: { $in: categoryIds },
      isActive: true,
    }).populate("categoryId");

    return NextResponse.json({
      success: true,
      categories: assignment.assignedCategories,
      parameters,
    });
  } catch (error) {
    console.error("Form data error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load form data" },
      { status: 500 },
    );
  }
}
