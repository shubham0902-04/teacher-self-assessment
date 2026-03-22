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
      className={`inline-block ${w} ${h} rounded-lg bg-gray-100 animate-pulse`}
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
      color: "#ca1f23",
      bg: "rgba(202,31,35,0.08)",
      href: "/admin/users",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      sub: `${stats.activeCategories} active`,
      icon: FolderKanban,
      color: "#2563eb",
      bg: "rgba(37,99,235,0.08)",
      href: "/admin/categories",
    },
    {
      label: "Parameters",
      value: stats.totalParameters,
      sub: `${stats.totalFields} criteria defined`,
      icon: ListChecks,
      color: "#059669",
      bg: "rgba(5,150,105,0.08)",
      href: "/admin/parameters",
    },
    {
      label: "Assignments",
      value: stats.totalAssignments,
      sub: "faculty-category links",
      icon: UserCheck,
      color: "#d97706",
      bg: "rgba(217,119,6,0.08)",
      href: "/admin/faculty-category-assignment",
    },
  ];

  // Mini stat cards
  const miniCards = [
    {
      label: "Schools",
      value: stats.totalSchools,
      icon: School,
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.1)",
      href: "/admin/schools",
    },
    {
      label: "Departments",
      value: stats.totalDepartments,
      icon: Building2,
      color: "#0891b2",
      bg: "rgba(8,145,178,0.1)",
      href: "/admin/departments",
    },
    {
      label: "Criteria Fields",
      value: stats.totalFields,
      icon: SlidersHorizontal,
      color: "#059669",
      bg: "rgba(5,150,105,0.1)",
      href: "/admin/parameter-fields",
    },
    {
      label: "Active Categories",
      value: stats.activeCategories,
      icon: CheckCircle2,
      color: "#ca1f23",
      bg: "rgba(202,31,35,0.08)",
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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ── GREETING BANNER ─────────────────────────────────── */}
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

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-xs mb-1">{greeting}</p>
              <h1 className="text-xl font-semibold text-white mb-1">
                {userName} 👋
              </h1>
              <p className="text-white/30 text-xs">
                Teacher Self-Assessment System — Admin Panel
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">System Setup</span>
                <span className="text-white text-sm font-semibold">
                  {setupPct}%
                </span>
              </div>
              <div className="w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${setupPct}%`,
                    background:
                      setupPct === 100
                        ? "#00a651"
                        : "linear-gradient(90deg,#ca1f23,#ff5555)",
                  }}
                />
              </div>
              <span className="text-white/25 text-xs">
                {setupDone}/{setupSteps.length} steps complete
              </span>
            </div>
          </div>
        </div>

        {/* ── PRIMARY STAT CARDS ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group overflow-hidden">
                  <ArrowUpRight
                    size={13}
                    className="absolute top-4 right-4 text-gray-300 group-hover:text-gray-400 transition"
                  />
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: card.bg }}
                  >
                    <Icon size={16} style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold text-[#111] mb-0.5">
                    {loading ? (
                      <Skeleton />
                    ) : (
                      <AnimatedNumber value={card.value} />
                    )}
                  </p>
                  <p className="text-[13px] font-medium text-[#111]">
                    {card.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── MINI CARDS + SETUP CHECKLIST ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 2×2 mini grid */}
          <div className="grid grid-cols-2 gap-3">
            {miniCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: card.bg }}
                    >
                      <Icon size={14} style={{ color: card.color }} />
                    </div>
                    <p className="text-xl font-bold text-[#111]">
                      {loading ? (
                        <Skeleton w="w-8" h="h-6" />
                      ) : (
                        <AnimatedNumber value={card.value} />
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#111] text-[14px]">
                  System Setup Checklist
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Complete all steps to activate evaluations
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                style={{
                  borderColor: setupPct === 100 ? "#00a651" : "#ca1f23",
                  color: setupPct === 100 ? "#00a651" : "#ca1f23",
                }}
              >
                {setupPct === 100 ? "✓" : `${setupPct}%`}
              </div>
            </div>

            <div className="space-y-1.5">
              {setupSteps.map((step, i) => (
                <Link key={i} href={step.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                      step.done
                        ? "bg-green-50/70 hover:bg-green-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2
                        size={15}
                        className="text-[#00a651] shrink-0"
                      />
                    ) : (
                      <Clock size={15} className="text-gray-300 shrink-0" />
                    )}
                    <span
                      className={`text-sm flex-1 ${step.done ? "text-[#111]" : "text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        step.done
                          ? "bg-green-100 text-green-700"
                          : "bg-red-50 text-[#ca1f23]"
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#ca1f23]" />
            <h3 className="font-semibold text-[#111] text-[14px]">
              Quick actions
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.label} href={link.href}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-[#ca1f23]/30 hover:bg-red-50/30 transition-all cursor-pointer group text-center">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#ca1f23]/10 flex items-center justify-center transition-colors">
                      <Icon
                        size={15}
                        className="text-gray-400 group-hover:text-[#ca1f23] transition-colors"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 group-hover:text-[#111] leading-tight transition-colors">
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                System setup is incomplete ({setupPct}% done)
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Complete all checklist items above before faculty can submit
                evaluations.
              </p>
            </div>
          </div>
        )}

        {!loading && setupPct === 100 && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle2
              size={15}
              className="text-[#00a651] shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-green-800">
                System is fully configured and ready
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Faculty can now log in and submit their self-assessments.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
