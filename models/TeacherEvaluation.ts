import mongoose from "mongoose";

// 🔥 FIELD VALUE (IMPORTANT)
const FieldValueSchema = new mongoose.Schema(
  {
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParameterField",
      required: true,
    },

    fieldName: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed, // number / text / date
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

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

// 🔥 ENTRY (1 row of form)
const EntrySchema = new mongoose.Schema(
  {
    fields: [FieldValueSchema], // 🔥 KEY CHANGE

    evidenceFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EvidenceFile",
      },
    ],
  },
  { _id: true },
);

// 🔥 PARAMETER
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

// 🔥 CATEGORY
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

// 🔥 MAIN SCHEMA
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

    submittedToHODAt: Date,
    reviewedByHODAt: Date,
    submittedToPrincipalAt: Date,
    reviewedByPrincipalAt: Date,
    finalizedAt: Date,
  },
  { timestamps: true },
);

// 🔥 INDEXES (IMPORTANT)
TeacherEvaluationSchema.index(
  { facultyId: 1, academicYear: 1 },
  { unique: true },
);

// 🔥 EXPORT
export default mongoose.models.TeacherEvaluation ||
  mongoose.model("TeacherEvaluation", TeacherEvaluationSchema);
