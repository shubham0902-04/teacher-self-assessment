import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ success: false, message: "Invalid password" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY");

  return NextResponse.json({
    success: true,
    token,
    user,
  });
}
