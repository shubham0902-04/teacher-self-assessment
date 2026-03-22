import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import ParameterField from "@/models/ParameterField";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const parameterId = searchParams.get("parameterId");

  let query = {};

  if (parameterId) {
    query = { parameterId };
  }

  const data = await ParameterField.find(query).populate("parameterId");

  return NextResponse.json({
    success: true,
    data,
  });
}
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const field = await ParameterField.create(body);

  return NextResponse.json({
    success: true,
    data: field,
  });
}
