import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    employeeId: String,

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Chairman", "Principal", "HOD", "Faculty"],
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    createdBy: {
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
