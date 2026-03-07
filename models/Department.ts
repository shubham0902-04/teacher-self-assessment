import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    departmentName: String,
    departmentCode: String,

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    hodId: {
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

export default mongoose.models.Department ||
  mongoose.model("Department", DepartmentSchema);
