import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import EvaluationCategory from "@/models/EvaluationCategory";

export async function GET() {
  try {
    await connectDB();

    const categories = await EvaluationCategory.find().sort({
      displayOrder: 1,
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const category = await EvaluationCategory.create(body);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Category creation failed" },
      { status: 500 },
    );
  }
}
