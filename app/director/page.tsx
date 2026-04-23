"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  GraduationCap,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Send,
  FileCheck,
  AlertCircle,
  LogOut,
  BarChart3,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type EvaluationStats = {
  academicYear: string;
  total: number;
  byStatus: Record<string, number>;
  byDepartment: { departmentName: string; count: number; finalized: number }[];
  recentSubmissions: {
    _id: string;
    facultyName: string;
    departmentName: string;
    status: string;
    submittedAt: string;
  }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Draft",
    color: "#d97706",
    bg: "bg-amber-50",
    icon: <Clock size={14} />,
  },
  SUBMITTED_TO_HOD: {
    label: "Submitted to HOD",
    color: "#2563eb",
    bg: "bg-blue-50",
    icon: <Send size={14} />,
  },
  RETURNED_BY_HOD: {
    label: "Returned by HOD",
    color: "#ea580c",
    bg: "bg-orange-50",
    icon: <RotateCcw size={14} />,
  },
  SUBMITTED_TO_PRINCIPAL: {
    label: "With Principal",
    color: "#7c3aed",
    bg: "bg-purple-50",
    icon: <FileCheck size={14} />,
  },
  RETURNED_BY_PRINCIPAL: {
    label: "Returned by Principal",
    color: "#dc2626",
    bg: "bg-red-50",
    icon: <AlertCircle size={14} />,
  },
  FINALIZED: {
    label: "Finalized",
    color: "#00a651",
    bg: "bg-green-50",
    icon: <CheckCircle2 size={14} />,
  },
};

const PIE_COLORS = [
  "#d97706",
  "#2563eb",
  "#ea580c",
  "#7c3aed",
  "#dc2626",
  "#00a651",
];

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: bg }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#111] mb-0.5">{value}</p>
      <p className="text-[13px] font-medium text-[#111]">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-[#111] mb-1 truncate max-w-[160px]">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DirectorDashboard() {
  const router = useRouter();
  const { userName } = useAuth();
  const { academicYear, setYear, yearOptions, loaded } = useAcademicYear();

  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Wait for localStorage preference before fetching
    if (!loaded) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/evaluations/stats?academicYear=${academicYear}`,
        );
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [academicYear, loaded]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const finalized = stats?.byStatus?.FINALIZED ?? 0;
  const submitted =
    (stats?.byStatus?.SUBMITTED_TO_HOD ?? 0) +
    (stats?.byStatus?.SUBMITTED_TO_PRINCIPAL ?? 0);
  const total = stats?.total ?? 0;
  const completionPct =
    total > 0 ? Math.round((finalized / total) * 100) : 0;

  // Pie chart data
  const pieData = Object.entries(stats?.byStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: STATUS_META[key]?.label ?? key,
      value,
    }));

  // Bar chart data (top 8 departments)
  const barData = (stats?.byDepartment ?? []).slice(0, 8).map((d) => ({
    name:
      d.departmentName.length > 12
        ? d.departmentName.slice(0, 12) + "…"
        : d.departmentName,
    Total: d.count,
    Finalized: d.finalized,
  }));

  // ── Skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = ({ w = "w-16", h = "h-7" }: { w?: string; h?: string }) => (
    <span className={`inline-block ${w} ${h} rounded-lg bg-gray-100 animate-pulse`} />
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#111]">
      {/* ── TOP NAV ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
        style={{ background: "#0f0f0f" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ca1f23] flex items-center justify-center shadow-lg shadow-red-900/40">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">
              Teacher Assessment
            </p>
            <p className="text-[11px] text-white/40 leading-tight">
              Chairman Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Year picker */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white text-xs font-medium transition"
            >
              <CalendarDays size={13} />
              {academicYear}
              <ChevronDown size={12} />
            </button>
            {showYearDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[120px]">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setYear(y);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50 ${
                      y === academicYear
                        ? "text-[#ca1f23] font-semibold"
                        : "text-[#111]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* ── GREETING BANNER ──────────────────────────────────────────────── */}
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
                {userName || "Chairman"} 👋
              </h1>
              <p className="text-white/30 text-xs">
                Institution-wide Analytics —{" "}
                <span className="text-white/50 font-medium">{academicYear}</span>
              </p>
            </div>

            {/* Completion ring */}
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">Completion Rate</span>
                <span className="text-white text-sm font-semibold">
                  {loading ? "—" : `${completionPct}%`}
                </span>
              </div>
              <div className="w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: loading ? "0%" : `${completionPct}%`,
                    background:
                      completionPct === 100
                        ? "#00a651"
                        : "linear-gradient(90deg,#ca1f23,#ff5555)",
                  }}
                />
              </div>
              <span className="text-white/25 text-xs">
                {finalized} of {total} finalized
              </span>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Evaluations"
            value={loading ? "—" : total}
            sub={`Academic year ${academicYear}`}
            color="#ca1f23"
            bg="rgba(202,31,35,0.08)"
            icon={<ClipboardCheck size={16} />}
          />
          <StatCard
            label="Finalized"
            value={loading ? "—" : finalized}
            sub={`${completionPct}% completion`}
            color="#00a651"
            bg="rgba(0,166,81,0.08)"
            icon={<CheckCircle2 size={16} />}
          />
          <StatCard
            label="In Review"
            value={loading ? "—" : submitted}
            sub="HOD + Principal"
            color="#2563eb"
            bg="rgba(37,99,235,0.08)"
            icon={<Send size={16} />}
          />
          <StatCard
            label="Departments Active"
            value={loading ? "—" : stats?.byDepartment?.length ?? 0}
            sub="With submissions"
            color="#7c3aed"
            bg="rgba(124,58,237,0.08)"
            icon={<BarChart3 size={16} />}
          />
        </div>

        {/* ── CHARTS ROW ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart — evaluations by department */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-[#111] text-[14px] mb-1">
              Evaluations by Department
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Total submitted vs finalized per department
            </p>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <Skeleton w="w-32" h="h-6" />
              </div>
            ) : barData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                No evaluation data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="Total"
                    fill="#ca1f23"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="Finalized"
                    fill="#00a651"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — status breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-[#111] text-[14px] mb-1">
              Status Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">All evaluations</p>
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <Skeleton w="w-24" h="h-6" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── STATUS BREAKDOWN CARDS ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[#111] text-[14px] mb-4">
            Status Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = stats?.byStatus?.[key] ?? 0;
              return (
                <div
                  key={key}
                  className={`flex flex-col gap-2 p-3 rounded-xl ${meta.bg}`}
                >
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <p
                    className="text-xl font-bold"
                    style={{ color: meta.color }}
                  >
                    {loading ? "—" : count}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    {meta.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RECENT SUBMISSIONS ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[#111] text-[14px] mb-4">
            Recent Submissions
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
          ) : (stats?.recentSubmissions ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              No submissions yet for {academicYear}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left font-medium pb-3 pr-4">Faculty</th>
                    <th className="text-left font-medium pb-3 pr-4">
                      Department
                    </th>
                    <th className="text-left font-medium pb-3 pr-4">Status</th>
                    <th className="text-left font-medium pb-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(stats?.recentSubmissions ?? []).map((submission) => {
                    const meta =
                      STATUS_META[submission.status] ??
                      STATUS_META["DRAFT"];
                    return (
                      <tr key={submission._id} className="hover:bg-gray-50/50">
                        <td className="py-3 pr-4 font-medium text-[#111]">
                          {submission.facultyName}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {submission.departmentName}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${meta.bg}`}
                            style={{ color: meta.color }}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" },
                              )
                            : "—"}
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
    </div>
  );
}