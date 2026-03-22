import mongoose from "mongoose";

const FacultyCategoryAssignmentSchema = new mongoose.Schema({
  
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  assignedCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationCategory",
    },
  ],

  academicYear: {
    type: String,
    required: true,
  },
});

export default mongoose.models.FacultyCategoryAssignment ||
  mongoose.model("FacultyCategoryAssignment", FacultyCategoryAssignmentSchema);
