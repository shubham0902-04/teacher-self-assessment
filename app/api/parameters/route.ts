import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import EvaluationParameter from "@/models/EvaluationParameter";

export async function GET() {
  try {
    await connectDB();

    const parameters = await EvaluationParameter.find()
      .populate("categoryId", "categoryName categoryCode")
      .sort({ displayOrder: 1 });

    return NextResponse.json({
      success: true,
      data: parameters,
    });
  } catch (error) {
    console.error("GET parameters error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch parameters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const parameter = await EvaluationParameter.create(body);

    return NextResponse.json({
      success: true,
      data: parameter,
    });
  } catch (error) {
    console.error("POST parameter error:", error);
    return NextResponse.json(
      { success: false, message: "Parameter creation failed" },
      { status: 500 }
    );
  }
}