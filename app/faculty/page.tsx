"use client";

import { useEffect, useState } from "react";
import FacultySidebar from "@/app/components/faculty/FacultySidebar";
import Link from "next/link";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Send,
  RotateCcw,
  FileCheck,
  Award,
  CircleDashed,
  Building2,
} from "lucide-react";

type FacultyData = {
  user: {
    name: string;
    email: string;
    employeeId?: string;
    departmentId?: { departmentName: string; departmentCode: string };
    schoolId?: { schoolName: string; schoolCode: string };
  };
  academicYear: string;
  assignedCategories: {
    _id: string;
    categoryName: string;
    categoryCode: string;
  }[];
  evaluationStatus: string;
  lastUpdated: string | null;
  submittedAt: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; description: string }> = {
  NOT_STARTED:            { label: "Not Started",            color: "text-slate-500", bg: "bg-slate-100",        icon: <CircleDashed size={16} />, description: "You haven't started your evaluation yet." },
  DRAFT:                  { label: "Draft",                  color: "text-amber-600", bg: "bg-amber-50",         icon: <ClipboardList size={16} />, description: "Your evaluation is saved as draft." },
  SUBMITTED_TO_HOD:       { label: "Pending HOD Review",     color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <Send size={16} />,          description: "Awaiting review from your HOD." },
  RETURNED_BY_HOD:        { label: "Returned by HOD",        color: "text-amber-600", bg: "bg-amber-50",         icon: <RotateCcw size={16} />,     description: "HOD has returned your evaluation." },
  SUBMITTED_TO_PRINCIPAL: { label: "Pending Principal",      color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <FileCheck size={16} />,     description: "Awaiting final approval from Principal." },
  RETURNED_BY_PRINCIPAL:  { label: "Returned by Principal",  color: "text-[#e31e24]", bg: "bg-[#e31e24]/10",     icon: <RotateCcw size={16} />,     description: "Principal has returned your evaluation." },
  FINALIZED:              { label: "Finalized",              color: "text-[#00a859]", bg: "bg-[#00a859]/10",     icon: <CheckCircle2 size={16} />,  description: "Your evaluation has been finalized." },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let n = 0;
    const steps = 30;
    const inc = value / steps;
    const timer = setInterval(() => {
      n += inc;
      if (n >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(Math.floor(n));
    }, 600 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function FacultyDashboard() {
  const [data, setData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const { academicYear, loaded } = useAcademicYear();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!loaded) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/faculty/me?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          if (json.data.user.departmentId?.departmentName) {
            localStorage.setItem("departmentName", json.data.user.departmentId.departmentName);
          }
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [academicYear, loaded]);

  const statusInfo = data ? STATUS_CONFIG[data.evaluationStatus] || STATUS_CONFIG["NOT_STARTED"] : STATUS_CONFIG["NOT_STARTED"];

  const canEdit = !data?.evaluationStatus || ["NOT_STARTED", "DRAFT", "RETURNED_BY_HOD", "RETURNED_BY_PRINCIPAL"].includes(data.evaluationStatus);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <FacultySidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Hero Banner */}
        <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-slate-900 shadow-lg shadow-slate-900/10">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute right-40 bottom-0 w-40 h-40 bg-[#e31e24]/10 rounded-full blur-3xl -mb-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-slate-400 font-medium text-[13px] mb-1">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                {loading ? "Loading..." : `${data?.user.name}`}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#00a859]" /> Academic Year {academicYear}</span>
                {data?.user.departmentId && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1.5"><Building2 size={14} className="text-[#e31e24]" /> {data.user.departmentId.departmentName}</span>
                  </>
                )}
              </div>
            </div>

            {!loading && data && (
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.bg.replace('bg-', 'bg-white/')} border border-white/20`}>
                  <span className={statusInfo.color}>{statusInfo.icon}</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Status</p>
                  <p className={`text-[15px] font-bold leading-tight ${statusInfo.color === 'text-slate-500' ? 'text-white' : statusInfo.color}`}>
                    {statusInfo.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00a859]/10 flex items-center justify-center border border-[#00a859]/20">
                <BookOpen size={18} className="text-[#00a859]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 leading-none mb-1">
              {loading ? "—" : <AnimatedNumber value={data?.assignedCategories.length || 0} />}
            </p>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Categories</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusInfo.bg} border`} style={{ borderColor: `${statusInfo.color.replace('text-', '')}30` }}>
                <span className={statusInfo.color}>{statusInfo.icon}</span>
              </div>
            </div>
            <p className="text-[15px] font-bold text-slate-800 leading-tight mb-1 truncate">
              {statusInfo.label}
            </p>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider truncate">Evaluation Status</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <Award size={18} className="text-slate-600" />
              </div>
            </div>
            <p className="text-[15px] font-bold text-slate-800 leading-tight mb-1 truncate">
              {loading ? "—" : data?.user.departmentId?.departmentCode || "N/A"}
            </p>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider truncate">Department</p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <Clock size={18} className="text-slate-600" />
              </div>
            </div>
            <p className="text-[15px] font-bold text-slate-800 leading-tight mb-1 truncate">
              {loading ? "—" : data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
            </p>
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider truncate">Last Saved</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Action Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-[18px] leading-tight mb-1">Self Assessment Form</h3>
                <p className="text-[13px] text-slate-500 font-medium">Complete your evaluation for {academicYear}</p>
              </div>
              {data?.lastUpdated && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-500 shadow-sm shrink-0">
                  <Clock size={12} /> Updated {new Date(data.lastUpdated).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              )}
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 border ${statusInfo.bg}`} style={{ borderColor: `${statusInfo.color.replace('text-', '')}30` }}>
              <span className={`${statusInfo.color} shrink-0 mt-0.5`}>
                {["RETURNED_BY_HOD", "RETURNED_BY_PRINCIPAL"].includes(data?.evaluationStatus || "") ? <AlertCircle size={16} /> : statusInfo.icon}
              </span>
              <div>
                <p className={`text-[13px] font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                <p className="text-[12px] text-slate-600 font-medium mt-0.5 leading-relaxed">{statusInfo.description}</p>
              </div>
            </div>

            {data?.assignedCategories && data.assignedCategories.length > 0 ? (
              canEdit ? (
                <Link href="/faculty/evaluation">
                  <button className="w-full bg-[#00a859] text-white py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#008f4c] transition shadow-sm shadow-[#00a859]/20">
                    <ClipboardList size={18} />
                    {data?.evaluationStatus === "NOT_STARTED" || !data?.evaluationStatus ? "Start Evaluation" : "Continue Evaluation"}
                    <ArrowUpRight size={16} />
                  </button>
                </Link>
              ) : (
                <Link href="/faculty/evaluation">
                  <button className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
                    <ClipboardList size={18} /> View Submitted Evaluation <ArrowUpRight size={16} />
                  </button>
                </Link>
              )
            ) : (
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 py-3.5 rounded-xl text-[13px] font-bold text-center">
                No categories assigned yet — contact your admin
              </div>
            )}
          </div>

          {/* Assigned Categories List */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-[15px] mb-5">Assigned Categories</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />)}
              </div>
            ) : data?.assignedCategories.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-[13px] font-medium bg-slate-50 rounded-xl border border-slate-100">
                No categories assigned
              </div>
            ) : (
              <div className="space-y-3">
                {data?.assignedCategories.map((cat, i) => (
                  <div key={cat._id} className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#00a859]/30 hover:bg-[#00a859]/5 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-[#00a859]/30 group-hover:bg-white flex items-center justify-center text-[11px] font-bold text-slate-500 group-hover:text-[#00a859] shrink-0 transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-700 truncate group-hover:text-slate-900">{cat.categoryName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{cat.categoryCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notices */}
        {!loading && data?.evaluationStatus === "RETURNED_BY_HOD" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-amber-800 mb-1">Evaluation returned by HOD</p>
              <p className="text-[13px] text-amber-700/80 font-medium leading-relaxed">
                Please review the remarks in the evaluation form, make necessary changes, and resubmit.
              </p>
            </div>
          </div>
        )}

        {!loading && data?.evaluationStatus === "FINALIZED" && (
          <div className="rounded-2xl border border-[#00a859]/20 bg-[#00a859]/5 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#00a859]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-[#00a859]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#00a859] mb-1">Evaluation Finalized</p>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                Congratulations! Your self-assessment for {data.academicYear} is complete and approved.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
