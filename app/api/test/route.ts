import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";

export async function GET() {
  await connectDB();

  return NextResponse.json({
    success: true,
    message: "MongoDB connected successfully",
  });
}
