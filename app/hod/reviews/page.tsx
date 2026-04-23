"use client";

import { useEffect, useState } from "react";
import HODSidebar from "@/app/components/hod/HODSidebar";
import Link from "next/link";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import {
  Clock,
  Search,
  X,
  Users,
  ChevronRight,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

type Faculty = { _id: string; name: string; email: string; employeeId?: string };
type Department = { _id: string; departmentName: string };

type Evaluation = {
  _id: string;
  facultyId: Faculty;
  departmentId: Department;
  academicYear: string;
  status: string;
  submittedToHODAt?: string;
};

export default function HODPendingReviewsPage() {
  const { academicYear, loaded } = useAcademicYear();
  const [allEvals, setAllEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) {
          const all = json.data as Evaluation[];
          setAllEvals(all.filter((e) => e.status === "SUBMITTED_TO_HOD"));
          const dept = all[0]?.departmentId?.departmentName;
          if (dept) localStorage.setItem("hodDepartmentName", dept);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [academicYear, loaded]);

  const filtered = allEvals.filter((e) =>
    e.facultyId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.facultyId?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <HODSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
              <ClipboardList size={16} className="text-[#00a859]" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none mb-1">Pending Reviews</h1>
              <p className="text-[12px] text-slate-500 font-medium">Faculty evaluations awaiting review</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 shadow-sm px-3.5 py-2 rounded-xl text-[12px] font-semibold text-slate-700">
            <div className="w-6 h-6 rounded-md bg-[#e31e24]/10 flex items-center justify-center">
              <CalendarDays size={13} className="text-[#e31e24]" />
            </div>
            <span className="leading-none">{academicYear}</span>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 max-w-[1200px] mx-auto">

          {/* Banner */}
          {!loading && (
            <div className={`rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between shadow-sm ${allEvals.length > 0 ? "bg-[#00a859]/5 border border-[#00a859]/20" : "bg-white border border-slate-200/60"}`}>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className={allEvals.length > 0 ? "text-[#00a859]" : "text-slate-400"} />
                <p className={`text-[13px] font-semibold ${allEvals.length > 0 ? "text-slate-800" : "text-slate-500"}`}>
                  {allEvals.length > 0
                    ? <><span className="text-[#00a859]">{allEvals.length} evaluation{allEvals.length !== 1 ? "s" : ""}</span> pending your review</>
                    : "No pending reviews — you're all caught up!"}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-slate-800">Faculty Queue</span>
                {!loading && allEvals.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] text-[10px] font-bold">
                    {allEvals.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 focus-within:border-[#00a859]/50 focus-within:bg-white transition-all shadow-sm">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search faculty..."
                  className="flex-1 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Users size={20} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-500 mb-1">
                    {allEvals.length === 0 ? "No pending reviews" : "No results match your search"}
                  </p>
                  {allEvals.length === 0 && (
                    <Link href="/hod/completed" className="text-[11px] text-[#00a859] font-semibold hover:underline">
                      View completed reviews →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="w-8" />
                    <span>Faculty</span>
                    <span>Email</span>
                    <span>Submitted On</span>
                    <span />
                  </div>

                  <div className="divide-y divide-slate-50">
                    {filtered.map((ev) => (
                      <div key={ev._id} className="grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a859]/20 to-[#00a859]/5 border border-[#00a859]/20 flex items-center justify-center text-[12px] font-bold text-[#00a859] shrink-0 shadow-sm">
                          {ev.facultyId?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 truncate">{ev.facultyId?.name}</p>
                          {ev.facultyId?.employeeId && <p className="text-[11px] text-slate-500 font-mono">{ev.facultyId.employeeId}</p>}
                        </div>
                        <p className="text-[12px] text-slate-500 truncate">{ev.facultyId?.email}</p>
                        <p className="text-[12px] text-slate-500 whitespace-nowrap font-medium">
                          {ev.submittedToHODAt ? new Date(ev.submittedToHODAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                        <Link href={`/hod/reviews/${ev._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a859] text-white text-[11px] font-bold hover:bg-[#008f4c] transition-colors shadow-sm shadow-[#00a859]/20 whitespace-nowrap">
                          Review <ChevronRight size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 border-t border-slate-100 text-[11px] font-medium text-slate-400 bg-slate-50/30">
                    Showing {filtered.length} of {allEvals.length} pending
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
