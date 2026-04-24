import mongoose from "mongoose";

// Import all models to ensure they are registered in Mongoose
import "@/models/User";
import "@/models/School";
import "@/models/Department";
import "@/models/EvaluationCategory";
import "@/models/EvaluationParameter";
import "@/models/ParameterField";
import "@/models/FacultyCategoryAssignment";
import "@/models/TeacherEvaluation";
import "@/models/EvidenceFile";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI in .env.local");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;

  return cached.conn;
}
