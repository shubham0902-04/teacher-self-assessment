"use client";

import { useEffect, useState } from "react";
import HODSidebar from "@/app/components/hod/HODSidebar";
import Link from "next/link";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import {
  CheckCircle2,
  RotateCcw,
  Send,
  Search,
  X,
  Users,
  ChevronRight,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";

type Faculty = { _id: string; name: string; email: string; employeeId?: string };
type Evaluation = {
  _id: string;
  facultyId: Faculty;
  academicYear: string;
  status: string;
  hodRemarks?: string;
  reviewedByHODAt?: string;
};

const COMPLETED_STATUSES = ["SUBMITTED_TO_PRINCIPAL", "RETURNED_BY_HOD", "FINALIZED"];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SUBMITTED_TO_PRINCIPAL: { label: "Forwarded", color: "#6366f1", bg: "#eef2ff", icon: <Send size={11} /> },
  RETURNED_BY_HOD:        { label: "Returned",  color: "#f59e0b", bg: "#fffbeb", icon: <RotateCcw size={11} /> },
  FINALIZED:              { label: "Finalized", color: "#00a859", bg: "#00a85915", icon: <CheckCircle2 size={11} /> },
};

export default function HODCompletedPage() {
  const { academicYear, yearOptions, setYear, loaded } = useAcademicYear();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success)
          setEvaluations((json.data as Evaluation[]).filter((e) => COMPLETED_STATUSES.includes(e.status)));
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [academicYear, loaded]);

  const forwarded = evaluations.filter((e) => e.status === "SUBMITTED_TO_PRINCIPAL").length;
  const returned  = evaluations.filter((e) => e.status === "RETURNED_BY_HOD").length;
  const finalized = evaluations.filter((e) => e.status === "FINALIZED").length;

  const filtered = evaluations.filter((e) => {
    const matchSearch =
      e.facultyId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.facultyId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <HODSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-[#00a859]" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none mb-1">Completed Reviews</h1>
              <p className="text-[12px] text-slate-500 font-medium">All processed evaluations</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowYearPicker((p) => !p)}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 shadow-sm px-3.5 py-2 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <CalendarDays size={13} className="text-[#00a859]" />
              <span>{academicYear}</span>
              <SlidersHorizontal size={12} className="text-slate-400 ml-1" />
            </button>
            {showYearPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 min-w-[120px]">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setShowYearPicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold transition ${
                      y === academicYear ? "bg-[#00a859]/10 text-[#00a859]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 max-w-[1200px] mx-auto space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Forwarded", value: forwarded, icon: Send,         color: "#6366f1", bg: "#eef2ff" },
              { label: "Returned",  value: returned,  icon: RotateCcw,    color: "#f59e0b", bg: "#fffbeb" },
              { label: "Finalized", value: finalized, icon: CheckCircle2, color: "#00a859", bg: "#00a85915" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{loading ? "—" : value}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-slate-800">Reviewed Evaluations</span>
                {!loading && (
                  <span className="px-2 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] text-[10px] font-bold">
                    {evaluations.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-48 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 focus-within:border-[#00a859]/50 focus-within:bg-white transition-all shadow-sm">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-400 hover:text-slate-600" /></button>}
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-[12px] font-medium border border-slate-200/60 bg-slate-50 rounded-xl px-3 py-2.5 text-slate-700 outline-none hover:border-slate-300 transition shadow-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED_TO_PRINCIPAL">Forwarded</option>
                  <option value="RETURNED_BY_HOD">Returned</option>
                  <option value="FINALIZED">Finalized</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-50 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Users size={20} className="text-slate-300" />
                </div>
                <p className="text-[13px] font-bold text-slate-500">
                  {evaluations.length === 0 ? `No completed reviews in ${academicYear}` : "No results match your filters"}
                </p>
                {evaluations.length === 0 && (
                  <Link href="/hod/reviews" className="text-[11px] text-[#00a859] font-semibold hover:underline">
                    Go to Pending Reviews →
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="w-8" />
                    <span>Faculty</span>
                    <span>Reviewed On</span>
                    <span>Status</span>
                    <span />
                  </div>
                  <div className="divide-y divide-slate-50">
                    {filtered.map((ev) => {
                      const meta = STATUS_META[ev.status] || STATUS_META["SUBMITTED_TO_PRINCIPAL"];
                      return (
                        <div key={ev._id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-600 shrink-0 shadow-sm">
                            {ev.facultyId?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 truncate">{ev.facultyId?.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{ev.facultyId?.email}</p>
                          </div>
                          <p className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
                            {ev.reviewedByHODAt
                              ? new Date(ev.reviewedByHODAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                              : "—"}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border"
                            style={{ background: meta.bg, color: meta.color, borderColor: `${meta.color}20` }}>
                            {meta.icon}
                            {meta.label}
                          </span>
                          <Link href={`/hod/completed/${ev._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 hover:text-slate-900 transition whitespace-nowrap shadow-sm">
                            View <ChevronRight size={12} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 text-[11px] font-medium text-slate-400 bg-slate-50/30">
                    Showing {filtered.length} of {evaluations.length} reviews
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
