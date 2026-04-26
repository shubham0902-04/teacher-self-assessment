"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { toast } from "sonner";
import {
  User,
  Lock,
  CalendarDays,
  Info,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Shield,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
};

type SysStats = {
  totalUsers: number;
  totalCategories: number;
  totalParameters: number;
  totalFields: number;
  totalSchools: number;
  totalDepartments: number;
};

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  id,
  icon,
  title,
  subtitle,
  iconBgClass,
  iconColorClass,
  children,
  defaultOpen = false,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  colorClass: string;
  iconBgClass: string;
  iconColorClass: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all"
    >
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left group`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${iconBgClass}`}
          >
            <span className={iconColorClass}>{icon}</span>
          </div>
          <div>
            <p className="text-[16px] font-bold text-slate-800 tracking-tight">{title}</p>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200/60 text-slate-400 group-hover:text-slate-600 transition-colors">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-6 pb-6 border-t border-slate-100 bg-white">{children}</div>
      )}
    </div>
  );
}

// ─── Password input ───────────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-bold text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { academicYear, setYear, resetToCurrentYear, yearOptions } =
    useAcademicYear();

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  // ── Password state ────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);

  // ── System info state ─────────────────────────────────────────────────────
  const [sysStats, setSysStats] = useState<SysStats | null>(null);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
          setProfileForm({
            name: json.data.name || "",
            email: json.data.email || "",
          });
        }
      } catch {
        /* silent */
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  // ── Load system stats ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, catRes, paramRes, fieldsRes, schoolsRes, deptsRes] =
          await Promise.all([
            fetch("/api/users"),
            fetch("/api/categories"),
            fetch("/api/parameters"),
            fetch("/api/parameter-fields"),
            fetch("/api/schools"),
            fetch("/api/departments"),
          ]);
        const [users, cats, params, fields, schools, depts] = await Promise.all(
          [
            usersRes.json(),
            catRes.json(),
            paramRes.json(),
            fieldsRes.json(),
            schoolsRes.json(),
            deptsRes.json(),
          ],
        );
        setSysStats({
          totalUsers: users.success ? users.data.length : 0,
          totalCategories: cats.success ? cats.data.length : 0,
          totalParameters: params.success ? params.data.length : 0,
          totalFields: fields.success ? fields.data.length : 0,
          totalSchools: schools.success ? schools.data.length : 0,
          totalDepartments: depts.success ? depts.data.length : 0,
        });
      } catch {
        /* silent */
      }
    }
    loadStats();
  }, []);

  // ── Save profile ──────────────────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (!profileForm.email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to update profile.");
        return;
      }
      // Update localStorage so sidebar reflects new name
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsed, name: json.data.name, email: json.data.email }),
          );
        }
      } catch { /* ignore */ }
      setProfile(json.data);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = pwForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setPwSaving(true);
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to change password.");
        return;
      }
      toast.success("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setPwSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1000px] mx-auto w-full">
        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
              Settings
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              Manage your account, password, academic year, and system info
            </p>
          </div>
        </div>

        {/* ── SECTION 1 — MY PROFILE ────────────────────────────────────── */}
        <Section
          id="profile"
          icon={<User size={24} />}
          title="My Profile"
          subtitle="Update your display name and email address"
          colorClass="text-blue-600"
          iconBgClass="bg-blue-50 border border-blue-100"
          iconColorClass="text-blue-600"
          defaultOpen
        >
          {profileLoading ? (
            <div className="pt-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={saveProfile} className="pt-6 space-y-5">
              {/* Role badge */}
              <div className="flex items-center gap-3 mb-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[14px] font-bold text-slate-600">
                  {profileForm.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-slate-800">{profileForm.name || "Admin User"}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#00a859]/10 text-[#00a859] border border-[#00a859]/20">
                      <Shield size={12} />
                      {profile?.role || "Admin"}
                    </span>
                  </div>
                  {profile?.employeeId && (
                    <span className="text-[12px] text-slate-500 font-mono mt-0.5 block">
                      ID: {profile.employeeId}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-[13px] font-bold text-slate-700 mb-1.5"
                  >
                    Full Name <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-[13px] font-bold text-slate-700 mb-1.5"
                  >
                    Email Address <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="admin@college.edu"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a859] text-white text-[14px] font-bold shadow-sm shadow-[#00a859]/20 hover:bg-[#008f4c] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {profileSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ── SECTION 2 — CHANGE PASSWORD ───────────────────────────────── */}
        <Section
          id="password"
          icon={<Lock size={24} />}
          title="Change Password"
          subtitle="Update your login password with current password verification"
          colorClass="text-indigo-600"
          iconBgClass="bg-indigo-50 border border-indigo-100"
          iconColorClass="text-indigo-600"
        >
          <form onSubmit={changePassword} className="pt-6 space-y-5">
            <PasswordInput
              id="current-password"
              label="Current Password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm((p) => ({ ...p, currentPassword: v }))}
              placeholder="Enter your current password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <PasswordInput
                id="new-password"
                label="New Password"
                value={pwForm.newPassword}
                onChange={(v) => setPwForm((p) => ({ ...p, newPassword: v }))}
                placeholder="Min. 6 characters"
              />
              <PasswordInput
                id="confirm-password"
                label="Confirm New Password"
                value={pwForm.confirmPassword}
                onChange={(v) =>
                  setPwForm((p) => ({ ...p, confirmPassword: v }))
                }
                placeholder="Re-enter new password"
              />
            </div>

            {/* Match indicator */}
            {pwForm.newPassword && pwForm.confirmPassword && (
              <div
                className={`flex items-center gap-2 text-[12px] font-bold px-3 py-2 rounded-lg inline-flex ${
                  pwForm.newPassword === pwForm.confirmPassword
                    ? "bg-[#00a859]/10 text-[#00a859] border border-[#00a859]/20"
                    : "bg-[#e31e24]/10 text-[#e31e24] border border-[#e31e24]/20"
                }`}
              >
                <CheckCircle2 size={14} />
                {pwForm.newPassword === pwForm.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {/* Password strength hint */}
            {pwForm.newPassword && (
              <div className="flex gap-1.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 flex gap-1.5">
                  {["bg-slate-200", "bg-slate-200", "bg-slate-200"].map((base, i) => {
                    const len = pwForm.newPassword.length;
                    const filled =
                      (i === 0 && len >= 1) ||
                      (i === 1 && len >= 6) ||
                      (i === 2 && len >= 10);
                    const fillColor =
                      len < 6
                        ? "bg-[#e31e24]"
                        : len < 10
                          ? "bg-amber-400"
                          : "bg-[#00a859]";
                    return (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${filled ? fillColor : base} transition-all duration-300`}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-2 w-16 text-right">
                  {pwForm.newPassword.length < 6
                    ? "Weak"
                    : pwForm.newPassword.length < 10
                      ? "Fair"
                      : "Strong"}
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 text-white text-[14px] font-bold shadow-sm hover:bg-slate-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {pwSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </Section>

        {/* ── SECTION 3 — ACADEMIC YEAR ─────────────────────────────────── */}
        <Section
          id="academic-year"
          icon={<CalendarDays size={24} />}
          title="Academic Year"
          subtitle="Set the active academic year for faculty evaluations"
          colorClass="text-emerald-600"
          iconBgClass="bg-emerald-50 border border-emerald-100"
          iconColorClass="text-emerald-600"
        >
          <div className="pt-6 space-y-5">
            <p className="text-[13px] font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              This setting controls which academic year is shown in dashboards
              and evaluation forms. It is saved per browser session.
            </p>

            {/* Current year indicator */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-emerald-800">
                  Active Year: <span className="text-[16px]">{academicYear}</span>
                </p>
                <p className="text-[12px] font-medium text-emerald-600/80 mt-0.5">
                  All evaluation data is filtered by this year.
                </p>
              </div>
            </div>

            {/* Year selector */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">
                Select Academic Year
              </label>
              <div className="flex flex-wrap gap-2">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setYear(y);
                      toast.success(`Academic year set to ${y}`);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      y === academicYear
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 ring-2 ring-emerald-600/20"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/50 hover:text-emerald-700"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  resetToCurrentYear();
                  toast.success("Academic year reset to auto-detected current year.");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw size={14} />
                Reset to Auto-Detected
              </button>
              <p className="text-[11px] font-medium text-slate-400 italic">
                Auto-detected changes every June.
              </p>
            </div>
          </div>
        </Section>

        {/* ── SECTION 4 — SYSTEM INFO ───────────────────────────────────── */}
        <Section
          id="system-info"
          icon={<Info size={24} />}
          title="System Information"
          subtitle="Overview of the current system configuration and data"
          colorClass="text-purple-600"
          iconBgClass="bg-purple-50 border border-purple-100"
          iconColorClass="text-purple-600"
        >
          <div className="pt-6 space-y-6">
            {/* App info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "App Version",
                  value: "0.1.0",
                  icon: <Layers size={16} />,
                  color: "text-purple-600",
                  bg: "bg-purple-50/50",
                  border: "border-purple-100",
                },
                {
                  label: "Framework",
                  value: "Next.js 16",
                  icon: <Database size={16} />,
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                  border: "border-slate-200",
                },
                {
                  label: "Database",
                  value: "MongoDB",
                  icon: <Database size={16} />,
                  color: "text-[#00a859]",
                  bg: "bg-[#00a859]/5",
                  border: "border-[#00a859]/20",
                },
                {
                  label: "Environment",
                  value:
                    process.env.NODE_ENV === "production"
                      ? "Production"
                      : "Development",
                  icon: <Shield size={16} />,
                  color:
                    process.env.NODE_ENV === "production" ? "text-[#e31e24]" : "text-amber-600",
                  bg:
                    process.env.NODE_ENV === "production"
                      ? "bg-[#e31e24]/5"
                      : "bg-amber-50",
                  border:
                    process.env.NODE_ENV === "production"
                      ? "border-[#e31e24]/20"
                      : "border-amber-200",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl p-5 border ${item.border} ${item.bg} flex flex-col items-center text-center transition-transform hover:-translate-y-0.5`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm ${item.color} mb-3`}>
                    {item.icon}
                  </div>
                  <p className={`text-[15px] font-bold mb-1 ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Data counts */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                Database Records Overview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Users",
                    value: sysStats?.totalUsers,
                    href: "/admin/users",
                  },
                  {
                    label: "Schools",
                    value: sysStats?.totalSchools,
                    href: "/admin/schools",
                  },
                  {
                    label: "Departments",
                    value: sysStats?.totalDepartments,
                    href: "/admin/departments",
                  },
                  {
                    label: "Categories",
                    value: sysStats?.totalCategories,
                    href: "/admin/categories",
                  },
                  {
                    label: "Parameters",
                    value: sysStats?.totalParameters,
                    href: "/admin/parameters",
                  },
                  {
                    label: "Criteria Fields",
                    value: sysStats?.totalFields,
                    href: "/admin/parameter-fields",
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#00a859]/30 hover:bg-[#00a859]/5 hover:shadow-sm transition-all group"
                  >
                    <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[16px] font-bold text-slate-800 group-hover:text-[#00a859] transition-colors">
                      {item.value ?? (
                        <span className="w-8 h-4 rounded bg-slate-100 animate-pulse inline-block" />
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div className="pt-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js 16",
                  "TypeScript 5",
                  "MongoDB + Mongoose",
                  "Tailwind CSS v4",
                  "JWT (jose)",
                  "Cloudinary",
                  "Recharts",
                  "Lucide Icons",
                  "Sonner",
                  "bcryptjs",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
