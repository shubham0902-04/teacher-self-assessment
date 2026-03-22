import mongoose from "mongoose";

const ParameterFieldSchema = new mongoose.Schema({
  parameterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EvaluationParameter",
    required: true,
  },

  fieldName: {
    type: String,
    required: true,
  },

  maxMarks: {
    type: Number,
    default: 0,
  },

  remarks: {
    type: String,
  },

  fieldType: {
    type: String,
    default: "number",
  },

  displayOrder: {
    type: Number,
    default: 1,
  },
});

export default mongoose.models.ParameterField ||
  mongoose.model("ParameterField", ParameterFieldSchema);
