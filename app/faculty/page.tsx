"use client";

import { useEffect, useState } from "react";
import FacultySidebar from "@/app/components/faculty/FacultySidebar";
import Link from "next/link";
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

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
    description: string;
  }
> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: <Clock size={16} />,
    description: "You haven't started your evaluation yet.",
  },
  DRAFT: {
    label: "Draft",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: <ClipboardList size={16} />,
    description: "Your evaluation is saved as draft.",
  },
  SUBMITTED_TO_HOD: {
    label: "Submitted to HOD",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: <Send size={16} />,
    description: "Awaiting review from your HOD.",
  },
  RETURNED_BY_HOD: {
    label: "Returned by HOD",
    color: "text-orange-600",
    bg: "bg-orange-100",
    icon: <RotateCcw size={16} />,
    description: "HOD has returned your evaluation with remarks.",
  },
  SUBMITTED_TO_PRINCIPAL: {
    label: "Submitted to Principal",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: <FileCheck size={16} />,
    description: "Awaiting final approval from Principal.",
  },
  RETURNED_BY_PRINCIPAL: {
    label: "Returned by Principal",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: <RotateCcw size={16} />,
    description: "Principal has returned your evaluation.",
  },
  FINALIZED: {
    label: "Finalized",
    color: "text-[#00a651]",
    bg: "bg-green-100",
    icon: <CheckCircle2 size={16} />,
    description: "Your evaluation has been finalized and approved.",
  },
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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/faculty/me");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          // Department name localStorage mein save karo sidebar ke liye
          if (json.data.user.departmentId?.departmentName) {
            localStorage.setItem(
              "departmentName",
              json.data.user.departmentId.departmentName,
            );
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statusInfo = data
    ? STATUS_CONFIG[data.evaluationStatus] || STATUS_CONFIG["NOT_STARTED"]
    : STATUS_CONFIG["NOT_STARTED"];

  const canEdit =
    !data?.evaluationStatus ||
    data.evaluationStatus === "NOT_STARTED" ||
    data.evaluationStatus === "DRAFT" ||
    data.evaluationStatus === "RETURNED_BY_HOD" ||
    data.evaluationStatus === "RETURNED_BY_PRINCIPAL";

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <FacultySidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ── GREETING BANNER ─────────────────────────────── */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f0f0f 0%, #1c0405 60%, #2d0b0c 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(202,31,35,0.15)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 60,
              bottom: -50,
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "rgba(202,31,35,0.08)",
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/40 text-xs mb-1">{greeting}</p>
              <h1 className="text-xl font-semibold text-white mb-1">
                {loading ? "Loading..." : `${data?.user.name} 👋`}
              </h1>
              <p className="text-white/30 text-xs">
                Academic Year:{" "}
                <span className="text-white/50 font-medium">
                  {data?.academicYear || "2025-26"}
                </span>
              </p>
            </div>

            {/* Status pill */}
            {!loading && data && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            )}
          </div>
        </div>

        {/* ── STAT CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assigned Categories */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <BookOpen size={16} className="text-[#ca1f23]" />
            </div>
            <p className="text-2xl font-bold text-[#111] mb-0.5">
              {loading ? (
                "—"
              ) : (
                <AnimatedNumber value={data?.assignedCategories.length || 0} />
              )}
            </p>
            <p className="text-[13px] font-medium text-[#111]">Categories</p>
            <p className="text-xs text-gray-400 mt-0.5">Assigned to you</p>
          </div>

          {/* Evaluation Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${statusInfo.bg}`}
            >
              <span className={statusInfo.color}>{statusInfo.icon}</span>
            </div>
            <p className="text-[13px] font-bold text-[#111] mb-0.5 leading-tight">
              {statusInfo.label}
            </p>
            <p className="text-[13px] font-medium text-[#111]">Status</p>
            <p className="text-xs text-gray-400 mt-0.5">Current evaluation</p>
          </div>

          {/* Department */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Award size={16} className="text-blue-600" />
            </div>
            <p className="text-[13px] font-bold text-[#111] mb-0.5 leading-tight truncate">
              {loading ? "—" : data?.user.departmentId?.departmentCode || "N/A"}
            </p>
            <p className="text-[13px] font-medium text-[#111]">Department</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {data?.user.departmentId?.departmentName || "—"}
            </p>
          </div>

          {/* Last Updated */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={16} className="text-[#00a651]" />
            </div>
            <p className="text-[13px] font-bold text-[#111] mb-0.5 leading-tight">
              {loading
                ? "—"
                : data?.lastUpdated
                  ? new Date(data.lastUpdated).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—"}
            </p>
            <p className="text-[13px] font-medium text-[#111]">Last Saved</p>
            <p className="text-xs text-gray-400 mt-0.5">Evaluation data</p>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Evaluation CTA Card */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#111] text-[15px]">
                  Self Assessment Form
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Academic Year: {data?.academicYear || "2025-26"}
                </p>
              </div>
              {data?.lastUpdated && (
                <span className="text-xs text-gray-400">
                  Updated{" "}
                  {new Date(data.lastUpdated).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Status description */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl mb-5 ${statusInfo.bg}`}
            >
              <span className={`${statusInfo.color} shrink-0 mt-0.5`}>
                {data?.evaluationStatus === "RETURNED_BY_HOD" ||
                data?.evaluationStatus === "RETURNED_BY_PRINCIPAL" ? (
                  <AlertCircle size={16} />
                ) : (
                  statusInfo.icon
                )}
              </span>
              <div>
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {statusInfo.description}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            {data?.assignedCategories && data.assignedCategories.length > 0 ? (
              canEdit ? (
                <Link href="/faculty/evaluation">
                  <button className="w-full bg-[#ca1f23] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition">
                    <ClipboardList size={16} />
                    {data?.evaluationStatus === "NOT_STARTED" ||
                    !data?.evaluationStatus
                      ? "Start Evaluation"
                      : "Continue Evaluation"}
                    <ArrowUpRight size={14} />
                  </button>
                </Link>
              ) : (
                <Link href="/faculty/evaluation">
                  <button className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                    <ClipboardList size={16} />
                    View Evaluation
                    <ArrowUpRight size={14} />
                  </button>
                </Link>
              )
            ) : (
              <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 py-3 rounded-xl text-sm text-center">
                No categories assigned yet — contact your admin
              </div>
            )}
          </div>

          {/* Assigned Categories List */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-[#111] text-[14px] mb-4">
              Assigned Categories
            </h3>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : data?.assignedCategories.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No categories assigned
              </div>
            ) : (
              <div className="space-y-2">
                {data?.assignedCategories.map((cat, i) => {
                  const colors = [
                    {
                      bg: "bg-red-50",
                      text: "text-[#ca1f23]",
                      badge: "bg-red-100 text-red-700",
                    },
                    {
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                      badge: "bg-blue-100 text-blue-700",
                    },
                    {
                      bg: "bg-green-50",
                      text: "text-[#00a651]",
                      badge: "bg-green-100 text-green-700",
                    },
                    {
                      bg: "bg-purple-50",
                      text: "text-purple-600",
                      badge: "bg-purple-100 text-purple-700",
                    },
                  ];
                  const c = colors[i % colors.length];
                  return (
                    <div
                      key={cat._id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${c.bg}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${c.badge} shrink-0`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#111] truncate">
                          {cat.categoryName}
                        </p>
                        <p className={`text-[11px] font-mono ${c.text}`}>
                          {cat.categoryCode}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── INFO NOTICE ──────────────────────────────────── */}
        {!loading && data?.evaluationStatus === "RETURNED_BY_HOD" && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
            <AlertCircle
              size={15}
              className="text-orange-500 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Your evaluation has been returned by HOD
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Please review the remarks, make necessary changes, and resubmit.
              </p>
            </div>
          </div>
        )}

        {!loading && data?.evaluationStatus === "FINALIZED" && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle2
              size={15}
              className="text-[#00a651] shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-green-800">
                Your evaluation has been finalized
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Congratulations! Your self-assessment for {data.academicYear} is
                complete.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
