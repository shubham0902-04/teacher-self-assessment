import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";

import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";
import EvaluationParameter from "@/models/EvaluationParameter";
import ParameterField from "@/models/ParameterField";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");
    const academicYear = searchParams.get("academicYear");

    if (!facultyId || !academicYear) {
      return NextResponse.json(
        { success: false, message: "Missing facultyId or academicYear" },
        { status: 400 },
      );
    }

    // ── 1. Get assignment with populated categories ──────────────────────────
    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

    const assignment = await FacultyCategoryAssignment.findOne({
      facultyId: facultyObjectId,
      academicYear,
    }).populate("assignedCategories"); // populates full category docs

    if (!assignment || !assignment.assignedCategories?.length) {
      return NextResponse.json({
        success: false,
        message: "No categories assigned to this faculty",
      });
    }

    // ── 2. Convert categories to plain objects ───────────────────────────────
    // FIX: Use .toObject() on each category doc so all fields are accessible
    // Without this, spread (...cat) misses Mongoose virtuals/getters
    const categories = assignment.assignedCategories.map((cat: any) =>
      cat.toObject ? cat.toObject() : cat,
    );

    const categoryIds = categories.map((c: any) => c._id);

    // ── 3. Fetch parameters with .lean() ─────────────────────────────────────
    // FIX: .lean() returns plain JS objects — all fields including maxMarks,
    // allowMultipleEntries, evidenceRequired are directly accessible
    const parameters = await EvaluationParameter.find({
      categoryId: { $in: categoryIds },
      isActive: true,
    })
      .sort({ displayOrder: 1 })
      .lean(); // ← KEY FIX: without lean(), spreading gives empty object

    // ── 4. Fetch fields with .lean() ─────────────────────────────────────────
    const parameterIds = parameters.map((p) => p._id);

    const fields = await ParameterField.find({
      parameterId: { $in: parameterIds },
    })
      .sort({ displayOrder: 1 })
      .lean(); // ← KEY FIX: same issue for fields

    // ── 5. Build structured response ─────────────────────────────────────────
    // categories → parameters → fields (nested)
    const structuredData = categories.map((category: any) => {
      // Parameters belonging to this category
      const categoryParameters = parameters.filter(
        (p) => p.categoryId?.toString() === category._id?.toString(),
      );

      const parametersWithFields = categoryParameters.map((param) => {
        // Fields belonging to this parameter
        const paramFields = fields
          .filter((f) => f.parameterId?.toString() === param._id?.toString())
          .map((f) => ({
            _id: f._id,
            fieldName: f.fieldName || "",
            // FIX: Explicitly pull maxMarks — was getting lost in spread
            maxMarks: Number(f.maxMarks) || 0,
            fieldType: f.fieldType || "number",
            displayOrder: f.displayOrder || 1,
          }));

        return {
          // FIX: Explicitly map all parameter fields instead of using spread
          // This guarantees maxMarks and other fields are always present
          _id: param._id,
          parameterName: param.parameterName || "",
          parameterCode: param.parameterCode || "",
          description: param.description || "",
          // KEY FIX: maxMarks was being lost — now explicitly mapped
          maxMarks: Number(param.maxMarks) || 0,
          allowMultipleEntries: param.allowMultipleEntries ?? true,
          evidenceRequired: param.evidenceRequired ?? false,
          displayOrder: param.displayOrder || 1,
          isActive: param.isActive ?? true,
          categoryId: param.categoryId,
          fields: paramFields,
        };
      });

      return {
        // FIX: Explicitly map category fields too
        _id: category._id,
        categoryName: category.categoryName || "",
        categoryCode: category.categoryCode || "",
        description: category.description || "",
        displayOrder: category.displayOrder || 1,
        isActive: category.isActive ?? true,
        parameters: parametersWithFields,
      };
    });

    return NextResponse.json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    console.error("Form data API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load form data" },
      { status: 500 },
    );
  }
}
