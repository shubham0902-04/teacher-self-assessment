import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    activityDate: {
      type: Date,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    marks: {
      faculty: {
        type: Number,
        default: 0,
      },
      hod: {
        type: Number,
        default: 0,
      },
      principal: {
        type: Number,
        default: 0,
      },
    },

    evidenceFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EvidenceFile",
      },
    ],
  },
  { _id: true },
);

const ParameterDataSchema = new mongoose.Schema(
  {
    parameterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationParameter",
      required: true,
    },

    parameterName: {
      type: String,
      required: true,
      trim: true,
    },

    entries: [EntrySchema],
  },
  { _id: true },
);

const CategoryDataSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationCategory",
      required: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    parameters: [ParameterDataSchema],
  },
  { _id: true },
);

const TeacherEvaluationSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      enum: ["ODD", "EVEN"],
    },

    calendarYear: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED_TO_HOD",
        "RETURNED_BY_HOD",
        "SUBMITTED_TO_PRINCIPAL",
        "RETURNED_BY_PRINCIPAL",
        "FINALIZED",
      ],
      default: "DRAFT",
    },

    categoriesData: [CategoryDataSchema],

    facultyRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    hodRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    principalRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    submittedToHODAt: {
      type: Date,
    },

    reviewedByHODAt: {
      type: Date,
    },

    submittedToPrincipalAt: {
      type: Date,
    },

    reviewedByPrincipalAt: {
      type: Date,
    },

    finalizedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.TeacherEvaluation ||
  mongoose.model("TeacherEvaluation", TeacherEvaluationSchema);
