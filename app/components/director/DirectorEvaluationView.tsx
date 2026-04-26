"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DirectorSidebar from "@/app/components/director/DirectorSidebar";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  ClipboardCheck,
  BadgeCheck,
  Building2,
  LayoutTemplate,
  Hash,
  Award
} from "lucide-react";

type FieldValue = {
  fieldId: string;
  fieldName: string;
  value: number;
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
};

function safeNum(v: any) { const n = Number(v); return isNaN(n) ? 0 : n; }

function CategoryBlock({ cat }: { cat: CategoryData }) {
  const [open, setOpen] = useState(true);
  
  const totalFaculty = cat.parameters.reduce((s, p) => s + p.entries.reduce((es, e) => es + e.fields.reduce((fs, f) => fs + safeNum(f.value), 0), 0), 0);
  const totalHod = cat.parameters.reduce((s, p) => s + p.entries.reduce((es, e) => es + e.fields.reduce((fs, f) => fs + safeNum(f.marks.hod), 0), 0), 0);
  const totalPrincipal = cat.parameters.reduce((s, p) => s + p.entries.reduce((es, e) => es + e.fields.reduce((fs, f) => fs + safeNum(f.marks.principal), 0), 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100"><LayoutTemplate size={14} className="text-[#00a859]" /></div>
          <div>
            <p className="font-bold text-slate-800 text-[14px]">{cat.categoryName}</p>
            <div className="flex items-center gap-4 mt-0.5">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty: <span className="text-slate-700">{totalFaculty}</span></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HOD: <span className="text-blue-600">{totalHod}</span></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final: <span className="text-[#00a859]">{totalPrincipal}</span></span>
            </div>
          </div>
        </div>
        <span className="text-slate-400">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {open && (
        <div className="border-t divide-y divide-slate-100 bg-slate-50/20">
          {cat.parameters.map((param) => (
            <div key={param._id} className="p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-4 flex items-center gap-2"><Hash size={13} className="text-slate-300" /> {param.parameterName}</p>
              {param.entries.map((entry, eIdx) => (
                <div key={entry._id} className="mb-4 last:mb-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2 bg-slate-50 border-b flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry {eIdx + 1}</p>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <div className="min-w-[450px]">
                      <div className="grid grid-cols-[1fr_80px_80px_90px] gap-4 mb-2 px-2 border-b border-slate-50 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Field</span>
                        <span className="text-center">Self</span>
                        <span className="text-center">HOD</span>
                        <span className="text-center text-[#00a859]">Approved</span>
                      </div>
                      <div className="space-y-1">
                        {entry.fields.map((field, fIdx) => (
                          <div key={fIdx} className="grid grid-cols-[1fr_80px_80px_90px] gap-4 items-center py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-[12px] text-slate-700 font-bold">{field.fieldName}</span>
                            <span className="text-center text-[11px] font-black text-slate-500 bg-slate-100 py-1 rounded">{safeNum(field.value)}</span>
                            <span className="text-center text-[11px] font-black text-blue-600 bg-blue-50 py-1 rounded border border-blue-100">{safeNum(field.marks?.hod)}</span>
                            <span className="text-center text-[11px] font-black text-[#00a859] bg-emerald-50 py-1 rounded border border-emerald-100">{safeNum(field.marks?.principal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {entry.evidenceFiles && entry.evidenceFiles.length > 0 && (
                    <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-slate-50 pt-3 bg-slate-50/50">
                      <span className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Evidence Documents</span>
                      {entry.evidenceFiles.map((file: any, fIdx: number) => (
                        <a key={fIdx} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-emerald-600 font-bold hover:border-emerald-300 hover:bg-emerald-50 transition shadow-sm">
                          <FileText size={12} /> {file.fileName} <ExternalLink size={10} />
                        </a>
                      ))}
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

export default function DirectorEvaluationView({ id, backUrl }: { id: string, backUrl: string }) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/evaluations/${id}`);
        const json = await res.json();
        if (json.success) setEvaluation(json.data);
        else { toast.error(json.message); router.push(backUrl); }
      } catch { toast.error("Error loading"); router.push(backUrl); }
      finally { setLoading(false); }
    }
    load();
  }, [id, backUrl, router]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Retrieving Assessment Records...</p>
    </div>
  );
  if (!evaluation) return null;

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
      <div className="bg-white/80 backdrop-blur px-8 py-3 border-b sticky top-0 z-20 flex items-center">
          <button onClick={() => router.push(backUrl)} className="flex items-center gap-2 text-[12px] font-black text-slate-500 hover:text-slate-800 transition uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Rankings
          </button>
        </div>

        <div className="max-w-[1000px] mx-auto p-8 space-y-6">
          {/* Faculty Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 flex items-start justify-between bg-slate-900 text-white relative">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="flex gap-6 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-emerald-500/20">
                  {evaluation.facultyId?.name?.charAt(0) || "F"}
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{evaluation.facultyId?.name || "Faculty Member"}</h1>
                  <p className="text-[14px] text-emerald-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">
                    <BadgeCheck size={16} /> {evaluation.facultyId?.employeeId || "ID-PENDING"}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white/60"><Building2 size={14} /> {evaluation.departmentId?.departmentName || "General Dept"}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white/60"><Award size={14} /> {evaluation.schoolId?.schoolName || "Institutional Unit"}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] relative z-10">
                {evaluation.status}
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x border-t divide-slate-100">
              <div className="p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Year</p>
                <p className="text-[16px] font-black text-slate-700">{evaluation.academicYear}</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Status</p>
                <p className="text-[16px] font-black text-emerald-600">Verified</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Verification</p>
                <p className="text-[16px] font-black text-slate-700">Digital Copy</p>
              </div>
            </div>
          </div>

          {/* Assessment Content */}
          <div className="space-y-4">
            {evaluation.categoriesData.map((cat, idx) => (
              <CategoryBlock key={idx} cat={cat} />
            ))}
          </div>

          {/* Remarks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 text-[12px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-blue-500" /> HOD Remarks
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                "{evaluation.hodRemarks || "No remarks provided by HOD."}"
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-black text-slate-800 text-[12px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-[#00a859]" /> Principal Remarks
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                "{evaluation.principalRemarks || "No remarks provided by Principal."}"
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }
