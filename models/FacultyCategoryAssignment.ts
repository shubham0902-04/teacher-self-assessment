import mongoose from "mongoose";

const FacultyCategoryAssignmentSchema = new mongoose.Schema({

  facultyId: {
    type: String,
    required: true
  },

  assignedCategories: [
    {
      type: String
    }
  ],

  academicYear: {
    type: String,
    required: true
  }

});

export default mongoose.models.FacultyCategoryAssignment ||
mongoose.model("FacultyCategoryAssignment", FacultyCategoryAssignmentSchema);