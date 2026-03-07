import mongoose from "mongoose";

const EvaluationParameterSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationCategory",
      required: true,
    },
    parameterName: {
      type: String,
      required: true,
      trim: true,
    },
    parameterCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    maxMarks: {
      type: Number,
      default: 0,
    },
    allowMultipleEntries: {
      type: Boolean,
      default: true,
    },
    evidenceRequired: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.models.EvaluationParameter ||
  mongoose.model("EvaluationParameter", EvaluationParameterSchema);
