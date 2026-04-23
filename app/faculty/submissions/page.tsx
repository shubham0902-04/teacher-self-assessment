"use client";

import { useEffect, useState } from "react";
import FacultySidebar from "@/app/components/faculty/FacultySidebar";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Send,
  RotateCcw,
  FileCheck,
  CircleDashed,
  Search,
  Calendar
} from "lucide-react";

type Submission = {
  _id: string;
  academicYear: string;
  status: string;
  submittedToHODAt?: string;
  updatedAt: string;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  NOT_STARTED:            { label: "Not Started",            color: "text-slate-500", bg: "bg-slate-100",        icon: <CircleDashed size={14} /> },
  DRAFT:                  { label: "Draft",                  color: "text-amber-600", bg: "bg-amber-50",         icon: <FileText size={14} /> },
  SUBMITTED_TO_HOD:       { label: "Pending HOD Review",     color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <Send size={14} /> },
  RETURNED_BY_HOD:        { label: "Returned by HOD",        color: "text-amber-600", bg: "bg-amber-50",         icon: <RotateCcw size={14} /> },
  SUBMITTED_TO_PRINCIPAL: { label: "Pending Principal",      color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <FileCheck size={14} /> },
  RETURNED_BY_PRINCIPAL:  { label: "Returned by Principal",  color: "text-[#e31e24]", bg: "bg-[#e31e24]/10",     icon: <RotateCcw size={14} /> },
  FINALIZED:              { label: "Finalized",              color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <CheckCircle2 size={14} /> },
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch("/api/faculty/submissions");
        const json = await res.json();
        if (json.success) {
          setSubmissions(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(s => s.academicYear.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <FacultySidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">My Submissions</h1>
              <p className="text-[13px] text-slate-500 font-medium">History of your self-assessment evaluations</p>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
                        <span className="text-[13px] font-medium">Loading submissions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <FileText size={20} className="text-slate-300" />
                        </div>
                        <span className="text-[13px] font-medium">No submissions found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => {
                    const meta = STATUS_META[sub.status] || STATUS_META["NOT_STARTED"];
                    return (
                      <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#00a859] group-hover:bg-[#00a859]/10 transition-colors">
                              <Calendar size={14} />
                            </div>
                            <span className="text-[13px] font-bold text-slate-700">{sub.academicYear}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${meta.bg}`} style={{ color: meta.color, borderColor: `${meta.color.replace('text-', '')}30` }}>
                            {meta.icon}
                            {meta.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                          {sub.submittedToHODAt ? new Date(sub.submittedToHODAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <Clock size={12} className="text-slate-400" />
                            {new Date(sub.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
