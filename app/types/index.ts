// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for Teacher Self-Assessment System
// Import from "@/app/types" anywhere in the project
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth / User ───────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "Faculty" | "HOD" | "Principal" | "Chairman";

export type User = {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  isActive: boolean;
  schoolId?: School | string;
  departmentId?: Department | string;
  createdAt?: string;
  updatedAt?: string;
};

// ── Institution ───────────────────────────────────────────────────────────────

export type School = {
  _id: string;
  schoolName: string;
  schoolCode: string;
  isActive?: boolean;
};

export type Department = {
  _id: string;
  departmentName: string;
  departmentCode: string;
  schoolId?: string | School;
  isActive?: boolean;
};

// ── Evaluation Schema ─────────────────────────────────────────────────────────

export type EvaluationCategory = {
  _id: string;
  categoryName: string;
  categoryCode: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
};

export type EvaluationParameter = {
  _id: string;
  parameterName: string;
  parameterCode: string;
  description?: string;
  maxMarks: number;
  allowMultipleEntries: boolean;
  evidenceRequired: boolean;
  displayOrder?: number;
  isActive: boolean;
  categoryId: string | EvaluationCategory;
};

export type ParameterField = {
  _id: string;
  fieldName: string;
  fieldType: "number" | "text" | "date";
  maxMarks: number;
  displayOrder?: number;
  parameterId: string | EvaluationParameter;
};

// ── Form / Entry types (used inside evaluation form) ─────────────────────────

export type FieldValue = {
  fieldId: string;
  fieldName: string;
  value: number;
  marks: {
    faculty: number;
    hod: number;
    principal: number;
  };
};

export type UploadedFile = {
  fileName: string;
  fileUrl: string;
  publicId: string;
  resourceType: string;
};

export type Entry = {
  entryId: string;
  fields: FieldValue[];
  evidenceFiles: UploadedFile[];
};

export type ParameterData = {
  parameterId: string;
  parameterName: string;
  entries: Entry[];
};

export type CategoryData = {
  categoryId: string;
  categoryName: string;
  parameters: ParameterData[];
};

// ── Evaluation status ─────────────────────────────────────────────────────────

export type EvaluationStatus =
  | "NOT_STARTED"
  | "DRAFT"
  | "SUBMITTED_TO_HOD"
  | "RETURNED_BY_HOD"
  | "SUBMITTED_TO_PRINCIPAL"
  | "RETURNED_BY_PRINCIPAL"
  | "FINALIZED";

// ── TeacherEvaluation (stored in DB) ─────────────────────────────────────────

export type TeacherEvaluation = {
  _id: string;
  facultyId: string | User;
  schoolId: string | School;
  departmentId: string | Department;
  academicYear: string;
  semester?: "ODD" | "EVEN";
  calendarYear: number;
  status: EvaluationStatus;
  categoriesData: CategoryData[];
  facultyRemarks?: string;
  hodRemarks?: string;
  principalRemarks?: string;
  submittedToHODAt?: string;
  reviewedByHODAt?: string;
  submittedToPrincipalAt?: string;
  reviewedByPrincipalAt?: string;
  finalizedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ── Faculty dashboard data ────────────────────────────────────────────────────

export type FacultyDashboardData = {
  user: User & {
    departmentId?: { departmentName: string; departmentCode: string };
    schoolId?: { schoolName: string; schoolCode: string };
  };
  academicYear: string;
  assignedCategories: Pick<
    EvaluationCategory,
    "_id" | "categoryName" | "categoryCode"
  >[];
  evaluationStatus: EvaluationStatus;
  lastUpdated: string | null;
  submittedAt: string | null;
};

// ── Admin dashboard stats ─────────────────────────────────────────────────────

export type AdminStats = {
  totalUsers: number;
  totalFaculty: number;
  totalCategories: number;
  activeCategories: number;
  totalParameters: number;
  totalFields: number;
  totalSchools: number;
  totalDepartments: number;
  totalAssignments: number;
};

// ── Director / Analytics ──────────────────────────────────────────────────────

export type EvaluationStats = {
  total: number;
  byStatus: Record<EvaluationStatus, number>;
  byDepartment: { departmentName: string; count: number; finalized: number }[];
  recentSubmissions: {
    _id: string;
    facultyName: string;
    departmentName: string;
    status: EvaluationStatus;
    submittedAt: string;
  }[];
  academicYear: string;
};
