"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Send,
  FileText,
  CalendarDays,
  ArrowRight,
  BarChart3,
  Activity,
  Sparkles
} from "lucide-react";

type Evaluation = {
  _id: string;
  facultyId: { _id: string; name: string; email: string };
  departmentId: { _id: string; departmentName: string };
  academicYear: string;
  status: string;
  submittedToHODAt?: string;
};

const PIPELINE_STEPS = [
  { label: "Faculty Submits",      icon: FileText      },
  { label: "Submitted to HOD",     icon: Clock         },
  { label: "HOD Reviews",          icon: ClipboardCheck },
  { label: "Forwarded / Returned", icon: Send          },
  { label: "Finalized",            icon: CheckCircle2  },
];

const STATS = [
  { key: "pending",   label: "Pending Review",        icon: Clock,        color: "#3b82f6", bg: "#eff6ff", href: "/hod/reviews"    },
  { key: "forwarded", label: "Forwarded to Principal", icon: Send,         color: "#6366f1", bg: "#eef2ff", href: "/hod/completed"  },
  { key: "returned",  label: "Returned to Faculty",    icon: RotateCcw,    color: "#f59e0b", bg: "#fffbeb", href: "/hod/completed"  },
  { key: "finalized", label: "Finalized",              icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5", href: "/hod/completed"  },
] as const;

export default function HODDashboard() {
  const { academicYear, loaded } = useAcademicYear();
  const [allEvals, setAllEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hodName, setHodName] = useState("");

  const hour = new Date().getHours();
  const timeLabel = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setHodName(JSON.parse(u).name || "");
    } catch {}
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/evaluations?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) {
          const all = json.data as Evaluation[];
          setAllEvals(all);
          const dept = all[0]?.departmentId?.departmentName;
          if (dept) localStorage.setItem("hodDepartmentName", dept);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [academicYear, loaded]);

  const counts = {
    pending:   allEvals.filter(e => e.status === "SUBMITTED_TO_HOD").length,
    forwarded: allEvals.filter(e => e.status === "SUBMITTED_TO_PRINCIPAL").length,
    returned:  allEvals.filter(e => e.status === "RETURNED_BY_HOD").length,
    finalized: allEvals.filter(e => e.status === "FINALIZED").length,
  };
  const total    = allEvals.length;
  const reviewed = counts.forwarded + counts.returned + counts.finalized;
  const pct      = total === 0 ? 0 : Math.round((reviewed / total) * 100);

  const activeStep =
    counts.finalized === total && total > 0 ? 4 :
    counts.forwarded > 0 || counts.returned > 0 ? 3 :
    counts.pending > 0 ? 2 : 1;

  return (
    <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
              {timeLabel}, {hodName ? hodName.split(" ")[0] : "HOD"} <Sparkles size={12} className="inline text-amber-400 mb-0.5" />
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 shadow-sm px-3.5 py-2 rounded-xl text-[12px] font-semibold text-slate-700">
            <div className="w-6 h-6 rounded-md bg-[#e31e24]/10 flex items-center justify-center">
              <CalendarDays size={13} className="text-[#e31e24]" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">Academic Year</p>
              <p className="leading-none">{academicYear}</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 space-y-6 max-w-[1200px] mx-auto">

          {/* Banner */}
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-slate-900/10">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00a859]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#e31e24]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-4 backdrop-blur-sm">
                  <Activity size={12} className="text-[#00a859]" />
                  <span className="text-white/90 text-[10px] font-semibold tracking-wider uppercase">Progress Overview</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                  {pct === 100 ? "All reviews completed." : "Track faculty assessments."}
                </h2>
                <p className="text-slate-300 text-[13px] font-medium">
                  Reviewed <span className="text-white font-bold">{reviewed} out of {total}</span> evaluations this year.
                </p>
              </div>
              
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center w-full sm:w-auto min-w-[140px]">
                <div className="relative flex items-center justify-center w-20 h-20 mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-white/10" strokeWidth="8" fill="none" />
                    <circle cx="40" cy="40" r="34" className="stroke-[#00a859] transition-all duration-1000 ease-out" strokeWidth="8" fill="none" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * pct) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-xl font-bold">{pct}%</span>
                  </div>
                </div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Completion</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ key, label, icon: Icon, color, bg, href }) => (
              <Link key={key} href={href}>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: bg }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800 leading-none mb-1 tracking-tight">
                      {loading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : counts[key]}
                    </p>
                    <p className="text-[12px] font-semibold text-slate-500">{label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
                  <BarChart3 size={16} className="text-[#00a859]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-slate-800 leading-tight">Evaluation Pipeline</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Status of all assessments</p>
                </div>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hidden sm:block">
                <span className="text-[13px] font-bold text-slate-800">{total}</span>
                <span className="text-[11px] text-slate-500 font-medium ml-1.5">Total</span>
              </div>
            </div>

            {/* Mobile: Vertical */}
            <div className="flex sm:hidden flex-col gap-4 relative">
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-100 rounded-full z-0"></div>
              {PIPELINE_STEPS.map((step, idx) => {
                const done    = idx < activeStep;
                const current = idx === activeStep;
                const Icon    = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 relative z-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all"
                      style={{
                        background:  done ? "#00a859" : current ? "#fff" : "#f8fafc",
                        borderColor: done ? "#00a859" : current ? "#00a859" : "#e2e8f0",
                      }}
                    >
                      <Icon size={16} style={{ color: done ? "#fff" : current ? "#00a859" : "#94a3b8" }} />
                      {current && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e31e24] border-2 border-white animate-pulse" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: done || current ? "#1e293b" : "#64748b" }}>{step.label}</p>
                      {done && <p className="text-[10px] text-[#00a859] font-semibold uppercase">Completed</p>}
                      {current && <p className="text-[10px] text-[#e31e24] font-semibold uppercase">In Progress</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Horizontal */}
            <div className="hidden sm:flex items-center justify-between relative px-2">
              <div className="absolute left-8 right-8 top-5 h-0.5 bg-slate-100 rounded-full z-0"></div>
              <div 
                className="absolute left-8 top-5 h-0.5 bg-[#00a859] rounded-full z-0 transition-all duration-1000 ease-out" 
                style={{ width: `${Math.max(0, (activeStep / (PIPELINE_STEPS.length - 1)) * 100 - 10)}%` }}
              ></div>
              
              {PIPELINE_STEPS.map((step, idx) => {
                const done    = idx < activeStep;
                const current = idx === activeStep;
                const Icon    = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 relative z-10 w-28">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-[3px] bg-white transition-all duration-300"
                      style={{
                        background:  done ? "#00a859" : current ? "#fff" : "#f8fafc",
                        borderColor: done ? "#00a859" : current ? "#00a859" : "#e2e8f0",
                      }}
                    >
                      <Icon size={16} style={{ color: done ? "#fff" : current ? "#00a859" : "#94a3b8" }} />
                      {current && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#e31e24] border-2 border-white animate-pulse" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold leading-tight" style={{ color: done || current ? "#1e293b" : "#64748b" }}>
                        {step.label}
                      </p>
                      <div className="h-4 mt-0.5">
                        {done && <span className="text-[9px] font-bold uppercase text-[#00a859]">Done</span>}
                        {current && <span className="text-[9px] font-bold uppercase text-[#e31e24]">Active</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    );
  }
