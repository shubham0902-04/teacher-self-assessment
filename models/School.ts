import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    schoolCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.School || mongoose.model("School", SchoolSchema);
