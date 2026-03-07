import mongoose from "mongoose";

const EvidenceFileSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacherEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherEvaluation",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationCategory",
    },

    parameterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationParameter",
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      default: "file",
    },

    fileSize: {
      type: Number,
    },

    storageProvider: {
      type: String,
      default: "cloud",
    },
  },
  { timestamps: true },
);

export default mongoose.models.EvidenceFile ||
  mongoose.model("EvidenceFile", EvidenceFileSchema);
