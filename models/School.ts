import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    schoolName: String,
    schoolCode: String,

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
