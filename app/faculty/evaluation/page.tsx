"use client";

import { useEffect, useState, useCallback } from "react";
import FacultySidebar from "@/app/components/faculty/FacultySidebar";
import {
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type Field = {
  _id: string;
  fieldName: string;
  maxMarks: number;
};

type Parameter = {
  _id: string;
  parameterName: string;
  parameterCode: string;
  maxMarks: number;
  allowMultipleEntries: boolean;
  evidenceRequired: boolean;
  fields: Field[];
};

type Category = {
  _id: string;
  categoryName: string;
  categoryCode: string;
  parameters: Parameter[];
};

type FieldValue = {
  fieldId: string;
  fieldName: string;
  value: number;
  marks: { faculty: number; hod: number; principal: number };
};

type Entry = {
  entryId: string;
  fields: FieldValue[];
  evidenceFiles: UploadedFile[];
};

type ParameterData = {
  parameterId: string;
  parameterName: string;
  entries: Entry[];
};

type CategoryData = {
  categoryId: string;
  categoryName: string;
  parameters: ParameterData[];
};

type UploadedFile = {
  fileName: string;
  fileUrl: string;
  publicId: string;
  resourceType: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// NaN fix: always return safe number
function safeNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function makeEntry(param: Parameter): Entry {
  return {
    entryId: Math.random().toString(36).slice(2),
    fields: (param.fields || []).map((f) => ({
      fieldId: f._id,
      fieldName: f.fieldName,
      value: 0,
      marks: { faculty: 0, hod: 0, principal: 0 },
    })),
    evidenceFiles: [],
  };
}

function buildInitialData(categories: Category[]): CategoryData[] {
  return categories.map((cat) => ({
    categoryId: cat._id,
    categoryName: cat.categoryName,
    parameters: (cat.parameters || []).map((param) => ({
      parameterId: param._id,
      parameterName: param.parameterName,
      entries: [makeEntry(param)],
    })),
  }));
}

// NaN fix: use safeNum everywhere
function calcParamMarks(entries: Entry[], paramMaxMarks: number): number {
  const total = entries.reduce((sum, entry) => {
    const entryTotal = (entry.fields || []).reduce(
      (s, f) => s + safeNum(f.value),
      0,
    );
    return sum + entryTotal;
  }, 0);
  return Math.min(total, safeNum(paramMaxMarks));
}

// ─── Evidence Upload Component ────────────────────────────────────────────────

function EvidenceUpload({
  files,
  onUpload,
  onRemove,
  uploading,
}: {
  files: UploadedFile[];
  onUpload: (file: File) => void;
  onRemove: (idx: number) => void;
  uploading: boolean;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500 mb-2">Evidence Files</p>
      {files.length > 0 && (
        <div className="space-y-1 mb-2">
          {files.map((f, i) => (
            <div
              key={`${f.publicId || f.fileName}-${i}`}
              className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2"
            >
              <FileText size={13} className="text-[#00a651] shrink-0" />
              <span className="text-xs text-green-700 flex-1 truncate">
                {f.fileName}
              </span>
              <button
                onClick={() => onRemove(i)}
                className="text-gray-400 hover:text-red-500 transition shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <label
        className={`flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-3 py-2 transition ${
          uploading
            ? "opacity-50 cursor-not-allowed border-gray-200"
            : "border-gray-200 hover:border-[#ca1f23] hover:bg-red-50/30"
        }`}
      >
        {uploading ? (
          <Loader2 size={14} className="text-gray-400 animate-spin" />
        ) : (
          <Upload size={14} className="text-gray-400" />
        )}
        <span className="text-xs text-gray-400">
          {uploading ? "Uploading..." : "Upload evidence"}
        </span>
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EvaluationFormPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CategoryData[]>([]);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [evalStatus, setEvalStatus] = useState<string>("NOT_STARTED");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [facultyInfo, setFacultyInfo] = useState<{
    schoolId?: string;
    departmentId?: string;
  } | null>(null);
  const [academicYear] = useState("2025-26");

  const isReadOnly =
    evalStatus === "SUBMITTED_TO_HOD" ||
    evalStatus === "SUBMITTED_TO_PRINCIPAL" ||
    evalStatus === "FINALIZED";

  // ── Load form data ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Faculty info
        const meRes = await fetch("/api/faculty/me");
        const meData = await meRes.json();
        if (!meData.success) {
          toast.error("Failed to load your profile");
          return;
        }

        const user = meData.data.user;
        setFacultyInfo({
          schoolId:
            typeof user.schoolId === "object"
              ? user.schoolId._id
              : user.schoolId,
          departmentId:
            typeof user.departmentId === "object"
              ? user.departmentId._id
              : user.departmentId,
        });

        // Form structure
        const facultyId = user._id;
        const formRes = await fetch(
          `/api/faculty-evaluation/form-data?facultyId=${facultyId}&academicYear=${academicYear}`,
        );
        const formJson = await formRes.json();

        if (!formJson.success) {
          toast.error(formJson.message || "No evaluation data found");
          setLoading(false);
          return;
        }

        // NaN fix: ensure all maxMarks are numbers
        const cats: Category[] = (formJson.data || []).map((cat: Category) => ({
          ...cat,
          parameters: (cat.parameters || []).map((param) => ({
            ...param,
            maxMarks: safeNum(param.maxMarks),
            fields: (param.fields || []).map((f) => ({
              ...f,
              maxMarks: safeNum(f.maxMarks),
            })),
          })),
        }));

        setCategories(cats);

        // Check existing evaluation
        const evalRes = await fetch(
          `/api/evaluations/my?academicYear=${academicYear}`,
        );
        const evalJson = await evalRes.json();

        if (evalJson.success && evalJson.data) {
          const existing = evalJson.data;
          setEvaluationId(existing._id);
          setEvalStatus(existing.status);

          // Restore saved data
          const restored: CategoryData[] = cats.map((cat) => {
            const savedCat = existing.categoriesData?.find(
              (c: { categoryId: string }) => c.categoryId === cat._id,
            );
            return {
              categoryId: cat._id,
              categoryName: cat.categoryName,
              parameters: cat.parameters.map((param) => {
                const savedParam = savedCat?.parameters?.find(
                  (p: { parameterId: string }) => p.parameterId === param._id,
                );
                if (savedParam && savedParam.entries?.length > 0) {
                  return {
                    parameterId: param._id,
                    parameterName: param.parameterName,
                    entries: savedParam.entries.map(
                      (e: {
                        _id?: string;
                        fields: FieldValue[];
                        evidenceFiles: UploadedFile[];
                      }) => ({
                        entryId: e._id || Math.random().toString(36).slice(2),
                        fields: (e.fields || []).map((f) => ({
                          ...f,
                          value: safeNum(f.value), // NaN fix
                        })),
                        evidenceFiles: e.evidenceFiles || [],
                      }),
                    ),
                  };
                }
                return {
                  parameterId: param._id,
                  parameterName: param.parameterName,
                  entries: [makeEntry(param)],
                };
              }),
            };
          });
          setFormData(restored);
        } else {
          setFormData(buildInitialData(cats));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load evaluation form");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [academicYear]);

  // ── Update field value ──────────────────────────────────────────────────────

  const updateFieldValue = useCallback(
    (
      catIdx: number,
      paramIdx: number,
      entryIdx: number,
      fieldIdx: number,
      val: string,
    ) => {
      setFormData((prev) => {
        const next = structuredClone(prev);
        next[catIdx].parameters[paramIdx].entries[entryIdx].fields[
          fieldIdx
        ].value = safeNum(val); // NaN fix
        return next;
      });
    },
    [],
  );

  // ── Add / Remove entry ──────────────────────────────────────────────────────

  const addEntry = useCallback(
    (catIdx: number, paramIdx: number) => {
      const param = categories[catIdx]?.parameters[paramIdx];
      if (!param) return;
      setFormData((prev) => {
        const next = structuredClone(prev);
        next[catIdx].parameters[paramIdx].entries.push(makeEntry(param));
        return next;
      });
    },
    [categories],
  );

  const removeEntry = useCallback(
    (catIdx: number, paramIdx: number, entryIdx: number) => {
      setFormData((prev) => {
        const next = structuredClone(prev);
        next[catIdx].parameters[paramIdx].entries.splice(entryIdx, 1);
        return next;
      });
    },
    [],
  );

  // ── File upload ─────────────────────────────────────────────────────────────

  async function uploadFile(
    catIdx: number,
    paramIdx: number,
    entryIdx: number,
    file: File,
  ) {
    const key = `${catIdx}-${paramIdx}-${entryIdx}`;
    setUploadingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) {
        toast.error("Upload failed");
        return;
      }
      setFormData((prev) => {
        const next = structuredClone(prev);
        next[catIdx].parameters[paramIdx].entries[entryIdx].evidenceFiles.push({
          fileName: data.data.originalName,
          fileUrl: data.data.fileUrl,
          publicId: data.data.publicId,
          resourceType: data.data.resourceType,
        });
        return next;
      });
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }

  function removeFile(
    catIdx: number,
    paramIdx: number,
    entryIdx: number,
    fileIdx: number,
  ) {
    setFormData((prev) => {
      const next = structuredClone(prev);
      next[catIdx].parameters[paramIdx].entries[entryIdx].evidenceFiles.splice(
        fileIdx,
        1,
      );
      return next;
    });
  }

  // ── Build payload ───────────────────────────────────────────────────────────

  function buildPayload(status: string) {
    return {
      schoolId: facultyInfo?.schoolId,
      departmentId: facultyInfo?.departmentId,
      academicYear,
      calendarYear: new Date().getFullYear(),
      status,
      categoriesData: formData.map((cat) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        parameters: cat.parameters.map((param) => ({
          parameterId: param.parameterId,
          parameterName: param.parameterName,
          entries: param.entries.map((entry) => ({
            fields: entry.fields,
            evidenceFiles: entry.evidenceFiles,
          })),
        })),
      })),
    };
  }

  // ── Save draft ──────────────────────────────────────────────────────────────

  async function saveDraft() {
    try {
      setSaving(true);
      const payload = buildPayload("DRAFT");
      const url = evaluationId
        ? `/api/evaluations/${evaluationId}`
        : "/api/evaluations";
      const method = evaluationId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error("Save failed");
        return;
      }
      if (!evaluationId) setEvaluationId(data.data._id);
      setEvalStatus("DRAFT");
      toast.success("Draft saved successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Submit to HOD ───────────────────────────────────────────────────────────

  async function submitToHOD() {
    try {
      setSubmitting(true);
      const payload = buildPayload("SUBMITTED_TO_HOD");
      const url = evaluationId
        ? `/api/evaluations/${evaluationId}`
        : "/api/evaluations";
      const method = evaluationId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submittedToHODAt: new Date() }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error("Submit failed");
        return;
      }
      if (!evaluationId) setEvaluationId(data.data._id);
      setEvalStatus("SUBMITTED_TO_HOD");
      toast.success("Evaluation submitted to HOD!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Grand totals ────────────────────────────────────────────────────────────

  const grandTotal = formData.reduce((catSum, cat, catIdx) => {
    return (
      catSum +
      (cat.parameters || []).reduce((paramSum, param, paramIdx) => {
        const catParam = categories[catIdx]?.parameters[paramIdx];
        if (!catParam) return paramSum;
        return (
          paramSum + calcParamMarks(param.entries, safeNum(catParam.maxMarks))
        );
      }, 0)
    );
  }, 0);

  const grandMax = categories.reduce((sum, cat) => {
    return (
      sum + (cat.parameters || []).reduce((s, p) => s + safeNum(p.maxMarks), 0)
    );
  }, 0);

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8f8f8]">
        <FacultySidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading evaluation form...</p>
          </div>
        </main>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#f8f8f8]">
        <FacultySidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#111] mb-2">
              No Categories Assigned
            </h3>
            <p className="text-sm text-gray-400">
              Please contact your administrator to assign evaluation categories.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Category colors ─────────────────────────────────────────────────────────

  const catColors = [
    {
      border: "border-[#ca1f23]",
      badge: "bg-red-50 text-[#ca1f23]",
      bar: "#ca1f23",
    },
    {
      border: "border-blue-500",
      badge: "bg-blue-50 text-blue-600",
      bar: "#3b82f6",
    },
    {
      border: "border-[#00a651]",
      badge: "bg-green-50 text-[#00a651]",
      bar: "#00a651",
    },
    {
      border: "border-purple-500",
      badge: "bg-purple-50 text-purple-600",
      bar: "#8b5cf6",
    },
  ];

  // ── Main UI ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <FacultySidebar />

      <main className="flex-1 overflow-y-auto">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111]">
              Self Assessment Form
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Academic Year: {academicYear}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Score pill */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-400">Total Score</span>
              <span className="text-sm font-bold text-[#111]">
                {grandTotal}
                <span className="text-gray-400 font-normal">/{grandMax}</span>
              </span>
            </div>

            {isReadOnly ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium">
                <CheckCircle2 size={13} />
                Submitted
              </span>
            ) : (
              <>
                <button
                  onClick={saveDraft}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={submitToHOD}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ca1f23] text-white text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {submitting ? "Submitting..." : "Submit to HOD"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Read-only notice */}
        {isReadOnly && (
          <div className="mx-6 mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              This evaluation has been submitted and is currently under review.
              You cannot make changes at this time.
            </p>
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="p-6 space-y-5">
          {categories.map((cat, catIdx) => {
            const cc = catColors[catIdx % catColors.length];
            const isCollapsed = collapsedCategories.has(cat._id);

            const catTotal = (formData[catIdx]?.parameters || []).reduce(
              (sum, param, paramIdx) => {
                const catParam = cat.parameters[paramIdx];
                if (!catParam) return sum;
                return (
                  sum +
                  calcParamMarks(param.entries, safeNum(catParam.maxMarks))
                );
              },
              0,
            );
            const catMax = (cat.parameters || []).reduce(
              (s, p) => s + safeNum(p.maxMarks),
              0,
            );
            const pct = catMax > 0 ? Math.round((catTotal / catMax) * 100) : 0;

            // KEY FIX: fragment wrapper nahi chahiye, directly return karo
            return (
              <div
                key={cat._id}
                className={`rounded-2xl border-2 ${cc.border} bg-white shadow-sm overflow-hidden`}
              >
                {/* Category header */}
                <button
                  onClick={() =>
                    setCollapsedCategories((prev) => {
                      const next = new Set(prev);
                      if (next.has(cat._id)) next.delete(cat._id);
                      else next.add(cat._id);
                      return next;
                    })
                  }
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${cc.badge}`}
                    >
                      {cat.categoryCode}
                    </span>
                    <div>
                      <p className="font-semibold text-[#111] text-[15px]">
                        {cat.categoryName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(cat.parameters || []).length} parameter
                        {(cat.parameters || []).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-[#111]">
                        {catTotal}/{catMax}
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: cc.bar }}
                        />
                      </div>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronUp size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Parameters */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {(cat.parameters || []).map((param, paramIdx) => {
                      const paramData = formData[catIdx]?.parameters[paramIdx];
                      if (!paramData) return null;

                      const paramMaxMarks = safeNum(param.maxMarks);
                      const paramTotal = calcParamMarks(
                        paramData.entries,
                        paramMaxMarks,
                      );

                      // KEY FIX: key on outermost returned element
                      return (
                        <div key={param._id} className="p-5">
                          {/* Parameter header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-[#111]">
                                  {param.parameterName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {param.parameterCode}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    Max:{" "}
                                    <span className="font-semibold text-amber-600">
                                      {paramMaxMarks}
                                    </span>
                                  </span>
                                  {param.evidenceRequired && (
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                      Evidence required
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#111]">
                                {paramTotal}
                                <span className="text-gray-400 font-normal text-xs">
                                  /{paramMaxMarks}
                                </span>
                              </p>
                              {paramTotal >= paramMaxMarks &&
                                paramMaxMarks > 0 && (
                                  <span className="text-[10px] text-[#00a651] font-medium">
                                    Max reached
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Entries */}
                          <div className="space-y-4">
                            {paramData.entries.map((entry, entryIdx) => (
                              <div
                                key={entry.entryId}
                                className="bg-gray-50 rounded-xl p-4 relative"
                              >
                                {paramData.entries.length > 1 &&
                                  !isReadOnly && (
                                    <button
                                      onClick={() =>
                                        removeEntry(catIdx, paramIdx, entryIdx)
                                      }
                                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}

                                {paramData.entries.length > 1 && (
                                  <p className="text-[11px] font-medium text-gray-400 mb-3">
                                    Entry {entryIdx + 1}
                                  </p>
                                )}

                                {/* Fields grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {(entry.fields || []).map(
                                    (field, fieldIdx) => {
                                      const fieldDef = param.fields?.[fieldIdx];
                                      const fieldMax = safeNum(
                                        fieldDef?.maxMarks,
                                      );
                                      return (
                                        <div
                                          key={
                                            field.fieldId || `field-${fieldIdx}`
                                          }
                                        >
                                          <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                            {field.fieldName}
                                            {fieldMax > 0 && (
                                              <span className="text-gray-400 font-normal ml-1">
                                                (max {fieldMax})
                                              </span>
                                            )}
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            max={fieldMax || undefined}
                                            value={field.value}
                                            disabled={isReadOnly}
                                            onChange={(e) =>
                                              updateFieldValue(
                                                catIdx,
                                                paramIdx,
                                                entryIdx,
                                                fieldIdx,
                                                e.target.value,
                                              )
                                            }
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#111] outline-none focus:border-[#ca1f23] disabled:opacity-60 disabled:cursor-not-allowed"
                                          />
                                        </div>
                                      );
                                    },
                                  )}
                                </div>

                                {/* Evidence upload */}
                                {(param.evidenceRequired ||
                                  entry.evidenceFiles.length > 0) &&
                                  !isReadOnly && (
                                    <EvidenceUpload
                                      files={entry.evidenceFiles}
                                      uploading={
                                        !!uploadingMap[
                                          `${catIdx}-${paramIdx}-${entryIdx}`
                                        ]
                                      }
                                      onUpload={(file) =>
                                        uploadFile(
                                          catIdx,
                                          paramIdx,
                                          entryIdx,
                                          file,
                                        )
                                      }
                                      onRemove={(fi) =>
                                        removeFile(
                                          catIdx,
                                          paramIdx,
                                          entryIdx,
                                          fi,
                                        )
                                      }
                                    />
                                  )}

                                {/* Read-only evidence */}
                                {isReadOnly &&
                                  entry.evidenceFiles.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      {entry.evidenceFiles.map((f, fi) => (
                                        <a
                                          key={`${f.publicId || f.fileName}-${fi}`}
                                          href={f.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-2 text-xs text-[#00a651] hover:underline"
                                        >
                                          <FileText size={12} />
                                          {f.fileName}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>

                          {/* Add entry */}
                          {param.allowMultipleEntries && !isReadOnly && (
                            <button
                              onClick={() => addEntry(catIdx, paramIdx)}
                              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#ca1f23] hover:text-red-700 transition"
                            >
                              <Plus size={13} />
                              Add another entry
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* GRAND TOTAL */}
          <div className="rounded-2xl border-2 border-[#00a651] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111]">Grand Total</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sum of all categories (capped at max marks per parameter)
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#111]">
                  {grandTotal}
                  <span className="text-xl text-gray-400 font-normal">
                    /{grandMax}
                  </span>
                </p>
                <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${
                        grandMax > 0
                          ? Math.round((grandTotal / grandMax) * 100)
                          : 0
                      }%`,
                      background: "linear-gradient(90deg, #ca1f23, #00a651)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-2 pb-6">
              <button
                onClick={saveDraft}
                disabled={saving || submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={submitToHOD}
                disabled={saving || submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ca1f23] text-white text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {submitting ? "Submitting..." : "Submit to HOD"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
