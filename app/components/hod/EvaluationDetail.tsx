"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HODSidebar from "@/app/components/hod/HODSidebar";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
  Send,
  Clock,
  FileText,
  ExternalLink,
  ClipboardCheck,
  BookOpen,
  Hash,
  BadgeCheck,
  Building2,
  LayoutTemplate
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FieldValue = {
  fieldId: string;
  fieldName: string;
  value: number | string;
  marks: { faculty: number; hod: number; principal: number };
};

type Entry = {
  _id: string;
  fields: FieldValue[];
  evidenceFiles: ({ fileName: string; fileUrl: string } | string)[];
};

type ParameterData = {
  _id: string;
  parameterId: string;
  parameterName: string;
  entries: Entry[];
};

type CategoryData = {
  _id: string;
  categoryId: string;
  categoryName: string;
  parameters: ParameterData[];
};

type Evaluation = {
  _id: string;
  facultyId: { _id: string; name: string; email: string; employeeId?: string };
  departmentId: { departmentName: string; departmentCode: string };
  schoolId: { schoolName: string; schoolCode: string };
  academicYear: string;
  status: string;
  categoriesData: CategoryData[];
  facultyRemarks?: string;
  hodRemarks?: string;
  submittedToHODAt?: string;
  updatedAt: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function safeNum(v: unknown) {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

function cloneCategories(cats: CategoryData[]): CategoryData[] {
  return JSON.parse(JSON.stringify(cats));
}

function initHodMarks(cats: CategoryData[]): CategoryData[] {
  return cloneCategories(cats).map((cat) => ({
    ...cat,
    parameters: cat.parameters.map((param) => ({
      ...param,
      entries: param.entries.map((entry) => ({
        ...entry,
        fields: entry.fields.map((field) => ({
          ...field,
          marks: {
            ...field.marks,
            hod: safeNum(field.marks.hod) !== 0 ? safeNum(field.marks.hod) : safeNum(field.value),
          },
        })),
      })),
    })),
  }));
}

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  SUBMITTED_TO_HOD:       { label: "Pending Review",         color: "#00a859", bg: "bg-[#00a859]/10" },
  RETURNED_BY_HOD:        { label: "Returned to Faculty",    color: "#f59e0b", bg: "bg-amber-50" },
  SUBMITTED_TO_PRINCIPAL: { label: "Forwarded to Principal", color: "#6366f1", bg: "bg-indigo-50" },
  FINALIZED:              { label: "Finalized",              color: "#00a859", bg: "bg-[#00a859]/10" },
  DRAFT:                  { label: "Draft",                  color: "#94a3b8", bg: "bg-slate-50" },
};

// ─── Category accordion ─────────────────────────────────────────────────────────

function CategoryBlock({
  cat,
  catIdx,
  canEdit,
  onHodMarkChange,
}: {
  cat: CategoryData;
  catIdx: number;
  canEdit: boolean;
  onHodMarkChange: (catIdx: number, paramIdx: number, entryIdx: number, fieldIdx: number, value: number) => void;
}) {
  const [open, setOpen] = useState(true);

  const totalFacultyScore = cat.parameters.reduce(
    (sum, param) => sum + param.entries.reduce((eSum, entry) => eSum + entry.fields.reduce((fSum, field) => fSum + safeNum(field.value), 0), 0), 0
  );
  const totalHodMarks = cat.parameters.reduce(
    (sum, param) => sum + param.entries.reduce((eSum, entry) => eSum + entry.fields.reduce((fSum, field) => fSum + safeNum(field.marks.hod), 0), 0), 0
  );

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden mb-4 transition-all">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center shrink-0 border border-[#00a859]/20 shadow-sm">
            <LayoutTemplate size={14} className="text-[#00a859]" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-[14px] leading-tight mb-0.5">{cat.categoryName}</p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Faculty: <strong className="text-slate-700">{totalFacultyScore}</strong>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                HOD: <strong className={totalHodMarks > 0 ? "text-[#00a859]" : "text-slate-400"}>{totalHodMarks}</strong>
              </span>
            </div>
          </div>
        </div>
        <span className="text-slate-400 shrink-0 ml-2 bg-slate-50 p-1 rounded-md">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50 bg-slate-50/30">
          {cat.parameters.map((param, paramIdx) => (
            <div key={param._id || paramIdx} className="px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash size={13} className="text-slate-400 shrink-0" />
                <p className="text-[13px] font-bold text-slate-700">{param.parameterName}</p>
              </div>

              {param.entries.map((entry, entryIdx) => (
                <div key={entry._id || entryIdx} className="mb-4 last:mb-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entry {entryIdx + 1}</p>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-[1fr_100px_100px] gap-x-4 mb-3 px-2 border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Field</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-right">Faculty Score</span>
                      <span className="text-[10px] font-bold text-[#00a859] uppercase tracking-wider text-right">HOD Marks</span>
                    </div>

                    <div className="space-y-1">
                      {entry.fields.map((field, fieldIdx) => (
                        <div key={field.fieldId || fieldIdx} className="grid grid-cols-[1fr_100px_100px] gap-x-4 items-center py-2 px-2 rounded-lg hover:bg-slate-50 transition">
                          <span className="text-[13px] text-slate-700 font-medium">{field.fieldName}</span>

                          <div className="flex justify-end">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold min-w-[40px] text-center shadow-sm">
                              {safeNum(field.value) !== 0 ? safeNum(field.value) : 0}
                            </span>
                          </div>

                          <div className="flex justify-end">
                            {canEdit ? (
                              <input
                                type="number" min={0} step={1}
                                value={safeNum(field.marks.hod)}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                                  onHodMarkChange(catIdx, paramIdx, entryIdx, fieldIdx, isNaN(val) ? 0 : val);
                                }}
                                placeholder="0"
                                className="w-16 text-center rounded border border-[#00a859]/30 bg-[#00a859]/5 px-2 py-1 text-[12px] font-bold text-[#00a859] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition shadow-inner"
                              />
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#00a859]/10 text-[#00a859] border border-[#00a859]/20 text-[11px] font-bold min-w-[40px] text-center shadow-sm">
                                {safeNum(field.marks.hod)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {entry.evidenceFiles && entry.evidenceFiles.length > 0 && (
                    <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-slate-50 pt-3 bg-slate-50/50">
                      <span className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Evidence Documents</span>
                      {entry.evidenceFiles.map((file, fIdx) => {
                        const fileObj = typeof file === "object" && file !== null && "fileUrl" in file ? (file as { fileName: string; fileUrl: string }) : null;
                        return fileObj ? (
                          <a key={fIdx} href={fileObj.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-blue-600 font-semibold hover:border-blue-300 hover:bg-blue-50 transition shadow-sm">
                            <FileText size={12} /> {fileObj.fileName} <ExternalLink size={10} />
                          </a>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EvaluationDetail({ id, backUrl }: { id: string, backUrl: string }) {
  const router = useRouter();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [localCats, setLocalCats] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hodRemarks, setHodRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<"approve" | "return" | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/evaluations/${id}/hod-review`);
        const json = await res.json();
        if (json.success) {
          setEvaluation(json.data);
          setHodRemarks(json.data.hodRemarks || "");
          setLocalCats(initHodMarks(json.data.categoriesData || []));
        } else {
          toast.error(json.message || "Failed to load evaluation");
          router.push(backUrl);
        }
      } catch {
        toast.error("Network error — please try again.");
        router.push(backUrl);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, backUrl]);

  const handleHodMarkChange = useCallback((catIdx: number, paramIdx: number, entryIdx: number, fieldIdx: number, value: number) => {
    setLocalCats((prev) => {
      const next = cloneCategories(prev);
      next[catIdx].parameters[paramIdx].entries[entryIdx].fields[fieldIdx].marks.hod = value;
      return next;
    });
  }, []);

  async function submitReview(selectedAction: "approve" | "return") {
    if (selectedAction === "return" && !hodRemarks.trim()) {
      toast.error("Please provide remarks when returning an evaluation.");
      return;
    }

    setActiveAction(selectedAction);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/evaluations/${id}/hod-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedAction,
          hodRemarks: hodRemarks.trim(),
          categoriesData: localCats,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Review failed.");
        return;
      }

      toast.success(selectedAction === "approve" ? "Evaluation forwarded successfully." : "Evaluation returned successfully.");
      router.push(backUrl);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
      setActiveAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <HODSidebar />
        <main className="flex-1 p-6 space-y-4 max-w-[1200px] mx-auto w-full">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </main>
      </div>
    );
  }

  if (!evaluation) return null;

  const meta = STATUS_META[evaluation.status] || STATUS_META["DRAFT"];
  const canReview = evaluation.status === "SUBMITTED_TO_HOD";
  const isAlreadyReviewed = ["SUBMITTED_TO_PRINCIPAL", "RETURNED_BY_HOD", "FINALIZED"].includes(evaluation.status);

  const totalHodMarks = localCats.reduce((sum, cat) => sum + cat.parameters.reduce((ps, param) => ps + param.entries.reduce((es, entry) => es + entry.fields.reduce((fs, field) => fs + safeNum(field.marks.hod), 0), 0), 0), 0);
  const totalFacultyScore = localCats.reduce((sum, cat) => sum + cat.parameters.reduce((ps, param) => ps + param.entries.reduce((es, entry) => es + entry.fields.reduce((fs, field) => fs + safeNum(field.value), 0), 0), 0), 0);

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc]">

        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-3.5 flex items-center sticky top-0 z-20">
          <button onClick={() => router.push(backUrl)} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition -ml-3">
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="px-5 sm:px-8 py-6 max-w-[1000px] mx-auto space-y-6">

          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-[#00a859]/20">
                    {evaluation.facultyId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800 leading-tight mb-1">{evaluation.facultyId.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-500 mb-2">
                      <span className="flex items-center gap-1.5"><User size={13} /> {evaluation.facultyId.email}</span>
                      {evaluation.facultyId.employeeId && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><BadgeCheck size={13} /> {evaluation.facultyId.employeeId}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Building2 size={12} />
                      {evaluation.departmentId?.departmentName} • {evaluation.academicYear}
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-sm ${meta.bg}`} style={{ color: meta.color, borderColor: `${meta.color}30` }}>
                  <ClipboardCheck size={14} />
                  {meta.label}
                </div>
              </div>
            </div>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">
              <div className="p-4 text-center sm:text-left sm:px-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1.5"><Clock size={12} /> Submitted On</p>
                <p className="text-[14px] font-bold text-slate-700">{evaluation.submittedToHODAt ? new Date(evaluation.submittedToHODAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
              </div>
              <div className="p-4 text-center sm:text-left sm:px-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty Total Score</p>
                <p className="text-xl font-bold text-slate-700">{totalFacultyScore}</p>
              </div>
              <div className="p-4 text-center sm:text-left sm:px-8">
                <p className="text-[10px] font-bold text-[#00a859] uppercase tracking-wider mb-1">HOD Assessed Marks</p>
                <p className="text-xl font-bold text-[#00a859]">{totalHodMarks}</p>
              </div>
            </div>
          </div>

          {/* Faculty Remarks */}
          {evaluation.facultyRemarks && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={13} /> Faculty Remarks
              </p>
              <p className="text-[13px] text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{evaluation.facultyRemarks}</p>
            </div>
          )}

          {/* Evaluation Content */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-slate-800 mt-8 mb-4 px-1">Detailed Evaluation Parameters</h2>
            {localCats.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center text-slate-400 text-[13px] font-medium shadow-sm">
                No evaluation data has been submitted yet.
              </div>
            ) : (
              localCats.map((cat, catIdx) => (
                <CategoryBlock key={cat._id || catIdx} cat={cat} catIdx={catIdx} canEdit={canReview} onHodMarkChange={handleHodMarkChange} />
              ))
            )}
          </div>

          {/* HOD Review Panel */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden mt-8">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                <ClipboardCheck size={16} className="text-[#00a859]" />
                {isAlreadyReviewed ? "Review Summary" : "HOD Review & Decision"}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Remarks & Feedback
                  {canReview && <span className="text-slate-400 font-medium ml-1.5 text-[11px]">(Required when returning to faculty)</span>}
                </label>
                <textarea
                  value={hodRemarks}
                  onChange={(e) => setHodRemarks(e.target.value)}
                  disabled={!canReview}
                  rows={4}
                  placeholder={canReview ? "Write your assessment remarks here..." : "No remarks provided."}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 text-[13px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition shadow-sm placeholder:text-slate-400 resize-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              {isAlreadyReviewed && (
                <div className={`flex items-center gap-3 p-4 rounded-xl mb-2 border ${meta.bg}`} style={{ borderColor: `${meta.color}20` }}>
                  <span style={{ color: meta.color }}>
                    {evaluation.status === "SUBMITTED_TO_PRINCIPAL" ? <Send size={16} /> : evaluation.status === "RETURNED_BY_HOD" ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                  </span>
                  <p className="text-[13px] font-bold" style={{ color: meta.color }}>
                    {evaluation.status === "SUBMITTED_TO_PRINCIPAL" ? "You have forwarded this evaluation to the Principal." : evaluation.status === "RETURNED_BY_HOD" ? "You have returned this evaluation to the faculty." : "This evaluation has been finalized."}
                  </p>
                </div>
              )}

              {canReview && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => submitReview("return")} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold text-[13px] hover:bg-amber-100 hover:border-amber-300 transition shadow-sm disabled:opacity-50"
                  >
                    {submitting && activeAction === "return" ? <span className="w-4 h-4 border-2 border-amber-300 border-t-amber-700 rounded-full animate-spin" /> : <RotateCcw size={15} />}
                    Return to Faculty
                  </button>
                  <button
                    onClick={() => submitReview("approve")} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00a859] text-white font-bold text-[13px] hover:bg-[#008f4c] transition shadow-sm shadow-[#00a859]/20 disabled:opacity-50"
                  >
                    {submitting && activeAction === "approve" ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                    Forward to Principal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
