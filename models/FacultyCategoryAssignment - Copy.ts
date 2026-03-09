// import mongoose from "mongoose";

// const FacultyCategoryAssignmentSchema = new mongoose.Schema(
//   {
//     facultyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     academicYear: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     assignedCategories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "EvaluationCategory",
//         required: true,
//       },
//     ],

//     assignedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     assignedAt: {
//       type: Date,
//       default: Date.now,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.models.FacultyCategoryAssignment ||
//   mongoose.model("FacultyCategoryAssignment", FacultyCategoryAssignmentSchema);
