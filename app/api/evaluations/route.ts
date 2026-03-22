import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import TeacherEvaluation from "@/models/TeacherEvaluation";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const data = await TeacherEvaluation.create(body);

  return NextResponse.json({
    success: true,
    data,
  });
}
