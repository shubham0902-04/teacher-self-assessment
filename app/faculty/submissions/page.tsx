"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2, Clock, AlertCircle, Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";

type Submission = {
  _id: string;
  academicYear: string;
  status: string;
  submittedAt: string | null;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  NOT_STARTED: { label: "Not Started", color: "text-slate-500", bg: "bg-slate-100", icon: Clock },
  DRAFT: { label: "Draft", color: "text-amber-600", bg: "bg-amber-50", icon: FileText },
  SUBMITTED_TO_HOD: { label: "Pending HOD", color: "text-[#00a859]", bg: "bg-[#00a859]/10", icon: CheckCircle2 },
  RETURNED_BY_HOD: { label: "Returned", color: "text-amber-600", bg: "bg-amber-50", icon: AlertCircle },
  FINALIZED: { label: "Finalized", color: "text-[#00a859]", bg: "bg-[#00a859]/10", icon: CheckCircle2 },
};

export default function FacultySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { academicYear, loaded } = useAcademicYear();

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      try {
        const res = await fetch(`/api/faculty/me/submissions`);
        const json = await res.json();
        if (json.success) setSubmissions(json.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [loaded]);

  const filtered = submissions.filter(s => s.academicYear.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">My Submissions</h1>
            <p className="text-[13px] text-slate-500 font-medium">History of your self-assessment evaluations</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by year..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="bg-transparent outline-none text-[13px] font-medium text-slate-700 w-32" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" /> Loading History...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-[14px]">No submission records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Submitted On</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => {
                  const meta = STATUS_META[s.status] || STATUS_META.NOT_STARTED;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition group">
                      <td className="px-8 py-5 text-[15px] font-bold text-slate-700">{s.academicYear}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${meta.bg} ${meta.color} text-[11px] font-bold border border-current/10`}>
                          <meta.icon size={12} /> {meta.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[13px] text-slate-500 font-medium">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "Not Submitted"}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link href={`/faculty/evaluation?academicYear=${s.academicYear}`} className="inline-flex items-center gap-1.5 text-[#00a859] hover:text-[#008f4c] font-bold text-[13px] transition">
                          View Details <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
