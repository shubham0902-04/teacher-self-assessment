import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  const faculties = await User.find({ role: "Faculty" });

  return NextResponse.json({
    success: true,
    data: faculties,
  });
}
