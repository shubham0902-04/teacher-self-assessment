"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PrincipalSidebar from "@/app/components/principal/PrincipalSidebar";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Send,
  FileText,
  ExternalLink,
  ClipboardCheck,
  BadgeCheck,
  Building2,
  LayoutTemplate,
  Hash
} from "lucide-react";

type FieldValue = {
  fieldId: string;
  fieldName: string;
  value: number | string;
  marks: { faculty: number; hod: number; principal: number };
};
type Entry = { _id: string; fields: FieldValue[]; evidenceFiles: any[] };
type ParameterData = { _id: string; parameterId: string; parameterName: string; entries: Entry[] };
type CategoryData = { _id: string; categoryId: string; categoryName: string; parameters: ParameterData[] };
type Evaluation = {
  _id: string;
  facultyId: { name: string; email: string; employeeId?: string };
  departmentId: { departmentName: string };
  schoolId: { schoolName: string };
  academicYear: string;
  status: string;
  categoriesData: CategoryData[];
  facultyRemarks?: string;
  hodRemarks?: string;
  principalRemarks?: string;
  submittedToPrincipalAt?: string;
};

function safeNum(v: any) { const n = Number(v); return isNaN(n) ? 0 : n; }
function cloneCategories(cats: CategoryData[]): CategoryData[] { return JSON.parse(JSON.stringify(cats)); }

function initPrincipalMarks(cats: CategoryData[]): CategoryData[] {
  return cloneCategories(cats).map(cat => ({
    ...cat,
    parameters: cat.parameters.map(param => ({
      ...param,
      entries: param.entries.map(entry => ({
        ...entry,
        fields: entry.fields.map(field => ({
          ...field,
          marks: {
            ...field.marks,
            principal: safeNum(field.marks.principal) !== 0 ? safeNum(field.marks.principal) : safeNum(field.marks.hod) || safeNum(field.value),
          }
        }))
      }))
    }))
  }));
}

const STATUS_META: Record<string, any> = {
  SUBMITTED_TO_PRINCIPAL: { label: "Pending Principal Review", color: "#00a859", bg: "bg-emerald-50" },
  RETURNED_BY_PRINCIPAL:  { label: "Returned to HOD",          color: "#f59e0b", bg: "bg-amber-50" },
  FINALIZED:              { label: "Finalized",               color: "#10b981", bg: "bg-emerald-100" },
};

function CategoryBlock({ cat, catIdx, canEdit, onMarkChange }: any) {
  const [open, setOpen] = useState(true);
  const totalFaculty = cat.parameters.reduce((s: number, p: any) => s + p.entries.reduce((es: number, e: any) => es + e.fields.reduce((fs: number, f: any) => fs + safeNum(f.value), 0), 0), 0);
  const totalHod = cat.parameters.reduce((s: number, p: any) => s + p.entries.reduce((es: number, e: any) => es + e.fields.reduce((fs: number, f: any) => fs + safeNum(f.marks.hod), 0), 0), 0);
  const totalPrincipal = cat.parameters.reduce((s: number, p: any) => s + p.entries.reduce((es: number, e: any) => es + e.fields.reduce((fs: number, f: any) => fs + safeNum(f.marks.principal), 0), 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm"><LayoutTemplate size={14} className="text-[#00a859]" /></div>
          <div>
            <p className="font-bold text-slate-800 text-[14px]">{cat.categoryName}</p>
            <div className="flex items-center gap-4 mt-0.5">
               <span className="text-[10px] font-bold text-slate-400">Faculty: <span className="text-slate-600">{totalFaculty}</span></span>
               <span className="text-[10px] font-bold text-slate-400">HOD: <span className="text-blue-600">{totalHod}</span></span>
               <span className="text-[10px] font-bold text-[#00a859]">Principal: <span>{totalPrincipal}</span></span>
            </div>
          </div>
        </div>
        <span className="text-slate-400">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {open && (
        <div className="border-t divide-y divide-slate-50 bg-slate-50/20">
          {cat.parameters.map((param: any, pIdx: number) => (
            <div key={param._id} className="p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2"><Hash size={13} className="text-slate-300" /> {param.parameterName}</p>
              {param.entries.map((entry: any, eIdx: number) => (
                <div key={entry._id} className="mb-4 last:mb-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2 bg-slate-50 border-b flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Entry {eIdx + 1}</p>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <div className="min-w-[450px]">
                      <div className="grid grid-cols-[1fr_80px_80px_90px] gap-4 mb-2 px-2 border-b pb-2 text-[10px] font-bold text-slate-400 uppercase">
                        <span>Field</span>
                        <span className="text-center">Faculty</span>
                        <span className="text-center">HOD</span>
                        <span className="text-center text-[#00a859]">Principal</span>
                      </div>
                      <div className="space-y-1">
                        {entry.fields.map((field: any, fIdx: number) => (
                          <div key={fIdx} className="grid grid-cols-[1fr_80px_80px_90px] gap-4 items-center py-2 px-2 rounded-lg hover:bg-slate-50">
                            <span className="text-[12px] text-slate-700 font-medium">{field.fieldName}</span>
                            <span className="text-center text-[11px] font-bold text-slate-500 bg-slate-100 py-1 rounded">{safeNum(field.value)}</span>
                            <span className="text-center text-[11px] font-bold text-blue-600 bg-blue-50 py-1 rounded border border-blue-100">{safeNum(field.marks?.hod)}</span>
                            {canEdit ? (
                              <input type="number" value={safeNum(field.marks?.principal)} onChange={e => onMarkChange(catIdx, pIdx, eIdx, fIdx, Number(e.target.value))} className="w-full text-center rounded border border-emerald-200 bg-emerald-50 py-1 text-[12px] font-bold text-[#00a859] outline-none focus:border-[#00a859]" />
                            ) : (
                              <span className="text-center text-[11px] font-bold text-[#00a859] bg-emerald-50 py-1 rounded border border-emerald-100">{safeNum(field.marks?.principal)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {entry.evidenceFiles && entry.evidenceFiles.length > 0 && (
                    <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-slate-50 pt-3 bg-slate-50/50">
                      <span className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Evidence Documents</span>
                      {entry.evidenceFiles.map((file: any, fIdx: number) => {
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

export default function PrincipalEvaluationDetail({ id, backUrl }: { id: string, backUrl: string }) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [localCats, setLocalCats] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/evaluations/${id}/principal-review`);
        const json = await res.json();
        if (json.success) {
          setEvaluation(json.data);
          setRemarks(json.data.principalRemarks || "");
          setLocalCats(initPrincipalMarks(json.data.categoriesData || []));
        } else {
          toast.error(json.message);
          router.push(backUrl);
        }
      } catch { toast.error("Error loading"); router.push(backUrl); }
      finally { setLoading(false); }
    }
    load();
  }, [id, backUrl, router]);

  const handleMarkChange = useCallback((cIdx: number, pIdx: number, eIdx: number, fIdx: number, val: number) => {
    setLocalCats(prev => {
      const next = cloneCategories(prev);
      next[cIdx].parameters[pIdx].entries[eIdx].fields[fIdx].marks.principal = val;
      return next;
    });
  }, []);

  async function submit(action: "approve" | "return") {
    if (action === "return" && !remarks.trim()) return toast.error("Remarks required for return");
    try {
      setSubmitting(true);
      const res = await fetch(`/api/evaluations/${id}/principal-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, principalRemarks: remarks, categoriesData: localCats }),
      });
      if ((await res.json()).success) {
        toast.success(action === "approve" ? "Evaluation Finalized" : "Returned to HOD");
        router.push(backUrl);
      }
    } catch { toast.error("Error submitting"); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="flex-1 p-8 text-center">
      <p className="text-slate-400 font-bold animate-pulse">Loading Assessment Details...</p>
    </div>
  );
  if (!evaluation) return null;

  const meta = STATUS_META[evaluation.status] || { label: evaluation.status, color: "#64748b", bg: "bg-slate-50" };
  const canReview = evaluation.status === "SUBMITTED_TO_PRINCIPAL";

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
      <div className="bg-white/80 backdrop-blur px-8 py-3 border-b sticky top-0 z-20 flex items-center">
          <button onClick={() => router.push(backUrl)} className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition"><ArrowLeft size={14} /> Back</button>
        </div>

        <div className="max-w-[1000px] mx-auto p-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 flex items-start justify-between">
              <div className="flex gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#00a859] flex items-center justify-center text-2xl font-bold text-white shadow-lg">{evaluation.facultyId.name.charAt(0)}</div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{evaluation.facultyId.name}</h1>
                  <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2 mt-1"><BadgeCheck size={14} /> {evaluation.facultyId.employeeId} • <Building2 size={14} /> {evaluation.departmentId.departmentName}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${meta.bg}`} style={{ color: meta.color, borderColor: `${meta.color}20` }}>{meta.label}</div>
            </div>
            <div className="grid grid-cols-3 divide-x border-t bg-slate-50/50">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Submitted On</p>
                <p className="text-[14px] font-bold text-slate-700">{evaluation.submittedToPrincipalAt ? new Date(evaluation.submittedToPrincipalAt).toLocaleDateString() : "—"}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">HOD Score</p>
                <p className="text-xl font-bold text-blue-600">{localCats.reduce((s, c) => s + c.parameters.reduce((ps, p) => ps + p.entries.reduce((es, e) => es + e.fields.reduce((fs, f) => fs + safeNum(f.marks.hod), 0), 0), 0), 0)}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-[#00a859] uppercase mb-1">Your Assessment</p>
                <p className="text-xl font-bold text-[#00a859]">{localCats.reduce((s, c) => s + c.parameters.reduce((ps, p) => ps + p.entries.reduce((es, e) => es + e.fields.reduce((fs, f) => fs + safeNum(f.marks.principal), 0), 0), 0), 0)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {localCats.map((cat, idx) => <CategoryBlock key={idx} cat={cat} catIdx={idx} canEdit={canReview} onMarkChange={handleMarkChange} />)}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-slate-800 text-[15px] mb-4 flex items-center gap-2"><ClipboardCheck size={16} className="text-[#00a859]" /> Principal Review</h3>
            <div className="mb-6">
              <label className="block text-[12px] font-bold text-slate-700 mb-2">Remarks & Feedback</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} disabled={!canReview} rows={4} className="w-full rounded-xl border border-slate-200 p-4 text-[13px] outline-none focus:border-[#00a859] transition resize-none disabled:bg-slate-50" placeholder="Assessment summary..." />
            </div>
            {canReview && (
              <div className="flex gap-4">
                <button onClick={() => submit("return")} disabled={submitting} className="flex-1 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold text-[13px] hover:bg-amber-100 flex items-center justify-center gap-2 transition disabled:opacity-50"><RotateCcw size={16} /> Return to HOD</button>
                <button onClick={() => submit("approve")} disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#00a859] text-white font-bold text-[13px] hover:bg-[#008f4c] flex items-center justify-center gap-2 transition shadow-lg shadow-[#00a859]/20 disabled:opacity-50"><Send size={16} /> Finalize Evaluation</button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
