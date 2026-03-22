import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";

import FacultyCategoryAssignment from "@/models/FacultyCategoryAssignment";
import EvaluationParameter from "@/models/EvaluationParameter";
import ParameterField from "@/models/ParameterField";

// ✅ TYPES
type CategoryType = {
  _id: mongoose.Types.ObjectId;
  categoryName: string;
};

type ParameterType = {
  _id: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  parameterName: string;
};

type FieldType = {
  _id: mongoose.Types.ObjectId;
  parameterId: mongoose.Types.ObjectId;
  fieldName: string;
};

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const facultyId = searchParams.get("facultyId");
    const academicYear = searchParams.get("academicYear");

    if (!facultyId || !academicYear) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 },
      );
    }

    // ✅ Convert to ObjectId
    const facultyObjectId = new mongoose.Types.ObjectId(facultyId);

    // ✅ Get assignment
    const assignment = await FacultyCategoryAssignment.findOne({
      facultyId: facultyObjectId,
      academicYear,
    }).populate("assignedCategories");

    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: "No categories assigned",
      });
    }

    const categories = assignment.assignedCategories as CategoryType[];

    const categoryIds = categories.map((c) => c._id);

    // ✅ Get parameters
    const parameters = (await EvaluationParameter.find({
      categoryId: { $in: categoryIds },
      isActive: true,
    })) as ParameterType[];

    // ✅ Get fields
    const fields = (await ParameterField.find({
      parameterId: { $in: parameters.map((p) => p._id) },
    })) as FieldType[];

    // 🔥 STRUCTURE DATA
    const structuredData = categories.map((category) => {
      const categoryParameters = parameters.filter(
        (p) => p.categoryId.toString() === category._id.toString(),
      );

      const parametersWithFields = categoryParameters.map((param) => {
        const paramFields = fields.filter(
          (f) => f.parameterId.toString() === param._id.toString(),
        );

        return {
          ...param,
          fields: paramFields,
        };
      });

      return {
        ...category,
        parameters: parametersWithFields,
      };
    });

    return NextResponse.json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    console.error("Form data error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load form data" },
      { status: 500 },
    );
  }
}
