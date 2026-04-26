"use client";

import { useEffect, useState, useCallback } from "react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
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
  Hash,
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

function safeNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
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

// FIX: calcParamMarks now correctly sums field values and caps at maxMarks
function calcParamMarks(entries: Entry[], paramMaxMarks: number): number {
  const max = safeNum(paramMaxMarks);
  const total = (entries || []).reduce((sum, entry) => {
    const entryTotal = (entry.fields || []).reduce(
      (s, f) => s + safeNum(f.value),
      0,
    );
    return sum + entryTotal;
  }, 0);
  // Only cap if maxMarks is actually set (> 0)
  return max > 0 ? Math.min(total, max) : total;
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
  const { academicYear, loaded } = useAcademicYear();

  const isReadOnly =
    evalStatus === "SUBMITTED_TO_HOD" ||
    evalStatus === "SUBMITTED_TO_PRINCIPAL" ||
    evalStatus === "FINALIZED";

  // ── Load form data ──────────────────────────────────────────────────────────

  useEffect(() => {
    // Wait for localStorage preference to be read before fetching
    if (!loaded) return;
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

        // FIX: Sanitize all numeric fields coming from API
        // Mongoose returns numbers but sometimes they come as strings or null
        const cats: Category[] = (formJson.data || []).map((cat: Category) => ({
          ...cat,
          categoryName: cat.categoryName || "",
          categoryCode: cat.categoryCode || "",
          parameters: (cat.parameters || []).map((param) => ({
            ...param,
            parameterName: param.parameterName || "",
            parameterCode: param.parameterCode || "",
            // FIX: maxMarks can be nested or missing — always coerce
            maxMarks: safeNum(param.maxMarks),
            allowMultipleEntries: param.allowMultipleEntries ?? true,
            evidenceRequired: param.evidenceRequired ?? false,
            fields: (param.fields || []).map((f) => ({
              ...f,
              fieldName: f.fieldName || "",
              // FIX: field maxMarks also must be a number
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
          setEvalStatus(existing.status || "DRAFT");

          // FIX: Restore saved data — match by ID not by index
          // This prevents misalignment when category/param order changes
          const restored: CategoryData[] = cats.map((cat) => {
            const savedCat = (existing.categoriesData || []).find(
              (c: { categoryId: string }) =>
                c.categoryId?.toString() === cat._id?.toString(),
            );

            return {
              categoryId: cat._id,
              categoryName: cat.categoryName,
              parameters: cat.parameters.map((param) => {
                const savedParam = (savedCat?.parameters || []).find(
                  (p: { parameterId: string }) =>
                    p.parameterId?.toString() === param._id?.toString(),
                );

                if (savedParam && (savedParam.entries || []).length > 0) {
                  return {
                    parameterId: param._id,
                    parameterName: param.parameterName,
                    entries: savedParam.entries.map(
                      (e: {
                        _id?: string;
                        fields: FieldValue[];
                        evidenceFiles: UploadedFile[];
                      }) => ({
                        entryId:
                          e._id?.toString() ||
                          Math.random().toString(36).slice(2),
                        // FIX: Restore fields by matching fieldId, not by index
                        // This handles case where new fields were added after submission
                        fields: param.fields.map((fieldDef) => {
                          const savedField = (e.fields || []).find(
                            (sf) =>
                              sf.fieldId?.toString() ===
                              fieldDef._id?.toString(),
                          );
                          return {
                            fieldId: fieldDef._id,
                            fieldName: fieldDef.fieldName,
                            // FIX: Always safeNum to prevent NaN in inputs
                            value: safeNum(savedField?.value ?? 0),
                            marks: savedField?.marks || {
                              faculty: 0,
                              hod: 0,
                              principal: 0,
                            },
                          };
                        }),
                        evidenceFiles: e.evidenceFiles || [],
                      }),
                    ),
                  };
                }

                // No saved data for this param → fresh entry
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
        console.error("Load error:", err);
        toast.error("Failed to load evaluation form");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [academicYear, loaded]);

  // ── Update field value ──────────────────────────────────────────────────────
  // FIX: Use functional update with immer-style clone for correctness
  // Also: store raw string while typing, convert on blur? No — keep as number
  // but use "" as empty display. Solution: use string state for inputs.
  // Simplest fix: just ensure safeNum always returns valid number.

  const updateFieldValue = useCallback(
    (
      catIdx: number,
      paramIdx: number,
      entryIdx: number,
      fieldIdx: number,
      val: string,
    ) => {
      // FIX: Allow empty string while typing (show 0, not NaN)
      const numVal = val === "" ? 0 : safeNum(val);
      setFormData((prev) => {
        const next = structuredClone(prev);
        if (
          next[catIdx]?.parameters[paramIdx]?.entries[entryIdx]?.fields[
            fieldIdx
          ]
        ) {
          next[catIdx].parameters[paramIdx].entries[entryIdx].fields[
            fieldIdx
          ].value = numVal;
        }
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
        if (next[catIdx]?.parameters[paramIdx]?.entries.length > 1) {
          next[catIdx].parameters[paramIdx].entries.splice(entryIdx, 1);
        }
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
        toast.error(data.message || "Save failed");
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
        toast.error(data.message || "Submit failed");
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
  // FIX: Compute from categories (source of truth for maxMarks)
  // and formData (source of truth for entered values)

  const grandTotal = formData.reduce((catSum, catData, catIdx) => {
    const cat = categories[catIdx];
    if (!cat) return catSum;
    return (
      catSum +
      (catData.parameters || []).reduce((paramSum, paramData, paramIdx) => {
        const param = cat.parameters[paramIdx];
        if (!param) return paramSum;
        return (
          paramSum + calcParamMarks(paramData.entries, safeNum(param.maxMarks))
        );
      }, 0)
    );
  }, 0);

  const grandMax = categories.reduce((sum, cat) => {
    return (
      sum + (cat.parameters || []).reduce((s, p) => s + safeNum(p.maxMarks), 0)
    );
  }, 0);

  // ── Category colors ─────────────────────────────────────────────────────────

  const catColors = [
    { border: "border-slate-200/60", badge: "bg-slate-50 text-slate-500 border border-slate-200", bar: "#00a859" },
    { border: "border-slate-200/60", badge: "bg-slate-50 text-slate-500 border border-slate-200", bar: "#00a859" },
    { border: "border-slate-200/60", badge: "bg-slate-50 text-slate-500 border border-slate-200", bar: "#00a859" },
    { border: "border-slate-200/60", badge: "bg-slate-50 text-slate-500 border border-slate-200", bar: "#00a859" },
  ];

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm font-medium">Loading evaluation form...</p>
        </div>
      </main>
    );
  }

  if (categories.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc]">
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
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 overflow-y-auto">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none mb-1">
              Self Assessment Form
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">
              Academic Year: {academicYear}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Score pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/60 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
              <span className="text-[13px] font-bold text-slate-700">
                {grandTotal}
                <span className="text-slate-400 font-medium">/{grandMax}</span>
              </span>
            </div>

            {isReadOnly ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a859]/10 text-[#00a859] text-[11px] font-bold uppercase tracking-wider border border-[#00a859]/20 shadow-sm">
                <CheckCircle2 size={13} />
                Submitted
              </span>
            ) : (
              <>
                <button
                  onClick={saveDraft}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/60 text-[12px] font-bold text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={submitToHOD}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a859] text-white text-[12px] font-bold shadow-sm shadow-[#00a859]/20 hover:bg-[#008f4c] transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {submitting ? "Submitting..." : "Submit to HOD"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Read-only notice */}
        {isReadOnly && (
          <div className="mx-5 sm:mx-8 mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 shadow-sm">
            <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-blue-800">
              This evaluation has been submitted and is currently under review. You cannot make changes at this time.
            </p>
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">
          {categories.map((cat, catIdx) => {
            const cc = catColors[catIdx % catColors.length];
            const isCollapsed = collapsedCategories.has(cat._id);
            const catFormData = formData[catIdx];

            // FIX: Compute category totals safely
            const catTotal = (catFormData?.parameters || []).reduce(
              (sum, paramData, paramIdx) => {
                const param = cat.parameters[paramIdx];
                if (!param || !paramData) return sum;
                return (
                  sum +
                  calcParamMarks(paramData.entries, safeNum(param.maxMarks))
                );
              },
              0,
            );

            const catMax = (cat.parameters || []).reduce(
              (s, p) => s + safeNum(p.maxMarks),
              0,
            );

            const pct = catMax > 0 ? Math.round((catTotal / catMax) * 100) : 0;

            return (
              <div
                key={cat._id}
                className={`rounded-2xl border ${cc.border} bg-white shadow-sm overflow-hidden transition-all duration-200`}
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
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${cc.badge}`}
                    >
                      {cat.categoryCode || "CAT"}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 text-[14px] leading-tight mb-0.5">
                        {cat.categoryName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
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
                  <div className="border-t border-slate-100 divide-y divide-slate-50 bg-slate-50/30">
                    {(cat.parameters || []).map((param, paramIdx) => {
                      const paramData = catFormData?.parameters[paramIdx];
                      if (!paramData) return null;

                      const paramMaxMarks = safeNum(param.maxMarks);
                      const paramTotal = calcParamMarks(
                        paramData.entries,
                        paramMaxMarks,
                      );

                      return (
                        <div key={param._id} className="p-5">
                          {/* Parameter header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Hash size={13} className="text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[13px] font-bold text-slate-700 leading-tight">
                                  {param.parameterName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                    {param.parameterCode}
                                  </span>
                                  {/* FIX: Show "—" if maxMarks is 0 (not configured) */}
                                  <span className="text-[11px] text-gray-400">
                                    Max:{" "}
                                    <span
                                      className={
                                        paramMaxMarks > 0
                                          ? "font-semibold text-amber-600"
                                          : "text-gray-400"
                                      }
                                    >
                                      {paramMaxMarks > 0
                                        ? paramMaxMarks
                                        : "not set"}
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
                                  /{paramMaxMarks > 0 ? paramMaxMarks : "∞"}
                                </span>
                              </p>
                              {paramMaxMarks > 0 &&
                                paramTotal >= paramMaxMarks && (
                                  <span className="text-[10px] text-[#00a651] font-medium">
                                    Max reached
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Entries */}
                          <div className="space-y-4">
                            {(paramData.entries || []).map(
                              (entry, entryIdx) => (
                                <div
                                  key={entry.entryId}
                                  className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 relative"
                                >
                                  {(paramData.entries || []).length > 1 &&
                                    !isReadOnly && (
                                      <button
                                        onClick={() =>
                                          removeEntry(
                                            catIdx,
                                            paramIdx,
                                            entryIdx,
                                          )
                                        }
                                        className="absolute top-3 right-3 text-slate-400 hover:text-[#e31e24] transition bg-slate-50 hover:bg-[#e31e24]/10 p-1.5 rounded-lg"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}

                                  {(paramData.entries || []).length > 1 && (
                                    <p className="text-[11px] font-medium text-gray-400 mb-3">
                                      Entry {entryIdx + 1}
                                    </p>
                                  )}

                                  {/* Fields grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {(entry.fields || []).map(
                                      (field, fieldIdx) => {
                                        const fieldDef =
                                          param.fields?.[fieldIdx];
                                        const fieldMax = safeNum(
                                          fieldDef?.maxMarks,
                                        );

                                        return (
                                          <div
                                            key={
                                              field.fieldId ||
                                              `field-${fieldIdx}`
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
                                            {/* 
                                            FIX: The core input bug.
                                            - `value={field.value}` is correct for controlled input
                                            - But when value is 0, user can't type because "0" → safeNum("0") = 0 → no re-render change
                                            - Fix: use String(field.value) and allow "" during editing
                                            - Use onBlur to normalize back to 0
                                          */}
                                            <input
                                              type="number"
                                              min={0}
                                              max={
                                                fieldMax > 0
                                                  ? fieldMax
                                                  : undefined
                                              }
                                              value={
                                                field.value === 0
                                                  ? ""
                                                  : field.value
                                              }
                                              placeholder="0"
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
                                              onBlur={(e) => {
                                                // Normalize empty/invalid to 0 on blur
                                                if (
                                                  e.target.value === "" ||
                                                  isNaN(Number(e.target.value))
                                                ) {
                                                  updateFieldValue(
                                                    catIdx,
                                                    paramIdx,
                                                    entryIdx,
                                                    fieldIdx,
                                                    "0",
                                                  );
                                                }
                                              }}
                                              className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-[13px] font-bold text-slate-700 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                                            />
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>

                                  {/* Evidence upload */}
                                  {(param.evidenceRequired ||
                                    (entry.evidenceFiles || []).length > 0) &&
                                    !isReadOnly && (
                                      <EvidenceUpload
                                        files={entry.evidenceFiles || []}
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
                                    (entry.evidenceFiles || []).length > 0 && (
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
                              ),
                            )}
                          </div>

                                  {/* Add entry */}
                                  {param.allowMultipleEntries && !isReadOnly && (
                                    <button
                                      onClick={() => addEntry(catIdx, paramIdx)}
                                      className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#00a859] hover:text-[#008f4c] bg-[#00a859]/10 px-3 py-1.5 rounded-md hover:bg-[#00a859]/20 transition"
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
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-slate-800">Grand Total</p>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                  Sum of all categories (capped at max marks per parameter)
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-800">
                  {grandTotal}
                  <span className="text-xl text-slate-400 font-medium">
                    /{grandMax}
                  </span>
                </p>
                <div className="w-40 h-2 rounded-full bg-slate-100 overflow-hidden mt-2 border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${
                        grandMax > 0
                          ? Math.round((grandTotal / grandMax) * 100)
                          : 0
                      }%`,
                      background: "linear-gradient(90deg, #008f4c, #00a859)",
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200/60 text-[13px] font-bold text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00a859] text-white text-[13px] font-bold shadow-sm shadow-[#00a859]/20 hover:bg-[#008f4c] transition-all duration-200 disabled:opacity-50"
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
    );
  }
