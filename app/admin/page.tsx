"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FolderKanban,
  ListChecks,
  SlidersHorizontal,
  Building2,
  School,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  BarChart3,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Stats = {
  totalUsers: number;
  totalFaculty: number;
  totalCategories: number;
  activeCategories: number;
  totalParameters: number;
  totalFields: number;
  totalSchools: number;
  totalDepartments: number;
  totalAssignments: number;
};

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let n = 0;
    const steps = 40;
    const inc = value / steps;
    const timer = setInterval(() => {
      n += inc;
      if (n >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(Math.floor(n));
    }, 800 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
function Skeleton({ w = "w-12", h = "h-7" }: { w?: string; h?: string }) {
  return (
    <span
      className={`inline-block ${w} ${h} rounded-lg bg-slate-100 animate-pulse`}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalFaculty: 0,
    totalCategories: 0,
    activeCategories: 0,
    totalParameters: 0,
    totalFields: 0,
    totalSchools: 0,
    totalDepartments: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Load user name
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUserName(JSON.parse(u).name || "Admin");
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch all stats in parallel
  useEffect(() => {
    (async () => {
      try {
        const [
          usersRes,
          catRes,
          paramRes,
          fieldsRes,
          schoolsRes,
          deptsRes,
          assRes,
        ] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/categories"),
          fetch("/api/parameters"),
          fetch("/api/parameter-fields"),
          fetch("/api/schools"),
          fetch("/api/departments"),
          fetch("/api/faculty-category-assignments"),
        ]);
        const [users, cats, params, fields, schools, depts, ass] =
          await Promise.all([
            usersRes.json(),
            catRes.json(),
            paramRes.json(),
            fieldsRes.json(),
            schoolsRes.json(),
            deptsRes.json(),
            assRes.json(),
          ]);
        setStats({
          totalUsers: users.success ? users.data.length : 0,
          totalFaculty: users.success
            ? users.data.filter((u: { role: string }) => u.role === "Faculty")
                .length
            : 0,
          totalCategories: cats.success ? cats.data.length : 0,
          activeCategories: cats.success
            ? cats.data.filter((c: { isActive: boolean }) => c.isActive).length
            : 0,
          totalParameters: params.success ? params.data.length : 0,
          totalFields: fields.success ? fields.data.length : 0,
          totalSchools: schools.success ? schools.data.length : 0,
          totalDepartments: depts.success ? depts.data.length : 0,
          totalAssignments: ass.success ? ass.data.length : 0,
        });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Setup checklist
  const setupSteps = [
    {
      label: "Schools created",
      done: stats.totalSchools > 0,
      href: "/admin/schools",
    },
    {
      label: "Departments created",
      done: stats.totalDepartments > 0,
      href: "/admin/departments",
    },
    {
      label: "Faculty users added",
      done: stats.totalFaculty > 0,
      href: "/admin/users",
    },
    {
      label: "Categories defined",
      done: stats.totalCategories > 0,
      href: "/admin/categories",
    },
    {
      label: "Parameters defined",
      done: stats.totalParameters > 0,
      href: "/admin/parameters",
    },
    {
      label: "Criteria added",
      done: stats.totalFields > 0,
      href: "/admin/parameter-fields",
    },
    {
      label: "Categories assigned",
      done: stats.totalAssignments > 0,
      href: "/admin/faculty-category-assignment",
    },
  ];
  const setupDone = setupSteps.filter((s) => s.done).length;
  const setupPct = Math.round((setupDone / setupSteps.length) * 100);

  // Primary stat cards
  const primaryCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.totalFaculty} faculty members`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
      href: "/admin/users",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      sub: `${stats.activeCategories} active`,
      icon: FolderKanban,
      color: "text-[#00a859]",
      bg: "bg-[#00a859]/10",
      href: "/admin/categories",
    },
    {
      label: "Parameters",
      value: stats.totalParameters,
      sub: `${stats.totalFields} criteria defined`,
      icon: ListChecks,
      color: "text-amber-500",
      bg: "bg-amber-50",
      href: "/admin/parameters",
    },
    {
      label: "Assignments",
      value: stats.totalAssignments,
      sub: "faculty-category links",
      icon: UserCheck,
      color: "text-purple-500",
      bg: "bg-purple-50",
      href: "/admin/faculty-category-assignment",
    },
  ];

  // Mini stat cards
  const miniCards = [
    {
      label: "Schools",
      value: stats.totalSchools,
      icon: School,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      href: "/admin/schools",
    },
    {
      label: "Departments",
      value: stats.totalDepartments,
      icon: Building2,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      href: "/admin/departments",
    },
    {
      label: "Criteria Fields",
      value: stats.totalFields,
      icon: SlidersHorizontal,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      href: "/admin/parameter-fields",
    },
    {
      label: "Active Categories",
      value: stats.activeCategories,
      icon: CheckCircle2,
      color: "text-[#00a859]",
      bg: "bg-[#00a859]/10",
      href: "/admin/categories",
    },
  ];

  // Quick actions
  const quickLinks = [
    { label: "Add Faculty", icon: UserCheck, href: "/admin/users" },
    { label: "New Category", icon: FolderKanban, href: "/admin/categories" },
    { label: "Add Parameter", icon: ListChecks, href: "/admin/parameters" },
    {
      label: "Assign Categories",
      icon: BarChart3,
      href: "/admin/faculty-category-assignment",
    },
    { label: "Add Department", icon: Building2, href: "/admin/departments" },
    {
      label: "Add Criteria",
      icon: SlidersHorizontal,
      href: "/admin/parameter-fields",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* ── GREETING BANNER ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-[#e31e24]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[13px] text-slate-400 font-medium tracking-wide uppercase mb-1.5">{greeting}</p>
              <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
                {userName} <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-[14px] text-slate-500">
                Teacher Self-Assessment System — <span className="font-semibold text-slate-700">Admin Portal</span>
              </p>
            </div>

            <div className="w-full sm:w-auto bg-slate-50 rounded-xl border border-slate-100 p-4 shrink-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-6">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">System Setup</span>
                <span className="text-[14px] font-bold text-slate-800">
                  {setupPct}%
                </span>
              </div>
              <div className="w-full sm:w-48 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${setupPct}%`,
                    background:
                      setupPct === 100
                        ? "#00a859"
                        : "linear-gradient(90deg, #00a859, #e31e24)",
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {setupDone}/{setupSteps.length} steps complete
              </span>
            </div>
          </div>
        </div>

        {/* ── PRIMARY STAT CARDS ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {primaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <div className="relative rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group overflow-hidden">
                  <ArrowUpRight
                    size={15}
                    className="absolute top-5 right-5 text-slate-300 group-hover:text-slate-500 transition"
                  />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors ${card.bg}`}
                  >
                    <Icon size={18} className={card.color} />
                  </div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                    {loading ? (
                      <Skeleton />
                    ) : (
                      <AnimatedNumber value={card.value} />
                    )}
                  </p>
                  <p className="text-[14px] font-bold text-slate-600">
                    {card.label}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1 font-medium">{card.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── MINI CARDS ───────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {miniCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href}>
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors ${card.bg}`}
                    >
                      <Icon size={14} className={card.color} />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 tracking-tight">
                      {loading ? (
                        <Skeleton w="w-8" h="h-6" />
                      ) : (
                        <AnimatedNumber value={card.value} />
                      )}
                    </p>
                    <p className="text-[12px] font-bold text-slate-500 mt-1">{card.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── SETUP CHECKLIST ─────────────────────────────── */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800">
                  System Setup Checklist
                </h3>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                  Complete all steps to activate evaluations
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
                  setupPct === 100 ? "border-[#00a859] text-[#00a859] bg-[#00a859]/5" : "border-slate-200 text-slate-500"
                }`}
              >
                {setupPct === 100 ? "✓" : `${setupPct}%`}
              </div>
            </div>

            <div className="space-y-2">
              {setupSteps.map((step, i) => (
                <Link key={i} href={step.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer border ${
                      step.done
                        ? "bg-[#00a859]/5 border-[#00a859]/10 hover:bg-[#00a859]/10"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/80"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2
                        size={16}
                        className="text-[#00a859] shrink-0"
                      />
                    ) : (
                      <Clock size={16} className="text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-[13px] font-semibold flex-1 ${step.done ? "text-slate-800" : "text-slate-500"}`}
                    >
                      {step.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        step.done
                          ? "bg-white border-[#00a859]/20 text-[#00a859]"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                    >
                      {step.done ? "Done" : "Pending"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ──────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <Zap size={16} className="text-[#00a859]" />
            <h3 className="text-[15px] font-bold text-slate-800">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.label} href={link.href}>
                  <div className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-[#00a859]/30 hover:bg-[#00a859]/5 hover:shadow-sm transition-all duration-200 cursor-pointer group text-center h-full">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 group-hover:border-[#00a859]/30 flex items-center justify-center transition-colors shadow-sm">
                      <Icon
                        size={16}
                        className="text-slate-400 group-hover:text-[#00a859] transition-colors"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-800 leading-tight transition-colors">
                      {link.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── STATUS NOTICE ───────────────────────────────────── */}
        {!loading && setupPct < 100 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-amber-900 mb-1">
                System setup is incomplete ({setupPct}% done)
              </p>
              <p className="text-[13px] font-medium text-amber-700">
                Complete all checklist items above before faculty can submit
                evaluations.
              </p>
            </div>
          </div>
        )}

        {!loading && setupPct === 100 && (
          <div className="rounded-2xl border border-[#00a859]/20 bg-[#00a859]/5 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-[#00a859]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-emerald-900 mb-1">
                System is fully configured and ready
              </p>
              <p className="text-[13px] font-medium text-emerald-700">
                Faculty can now log in and submit their self-assessments.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
