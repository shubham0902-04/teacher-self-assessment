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
  color,
  children,
  defaultOpen = false,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/60 transition text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: color + "15" }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#111]">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="text-gray-400 shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100">{children}</div>
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
        className="block text-sm font-medium text-[#111] mb-1.5"
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
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-11 text-[#111] text-sm outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/10 transition placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
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
          <div className="relative z-10">
            <p className="text-white/40 text-xs mb-1">Admin Panel</p>
            <h1 className="text-xl font-semibold text-white mb-1">
              Settings ⚙️
            </h1>
            <p className="text-white/30 text-xs">
              Manage your account, password, academic year, and system info.
            </p>
          </div>
        </div>

        {/* ── SECTION 1 — MY PROFILE ────────────────────────────────────── */}
        <Section
          id="profile"
          icon={<User size={18} />}
          title="My Profile"
          subtitle="Update your display name and email address"
          color="#ca1f23"
          defaultOpen
        >
          {profileLoading ? (
            <div className="pt-5 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={saveProfile} className="pt-5 space-y-4">
              {/* Role badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-[#ca1f23]">
                  <Shield size={11} />
                  {profile?.role || "Admin"}
                </span>
                {profile?.employeeId && (
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {profile.employeeId}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-sm font-medium text-[#111] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[#111] text-sm outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/10 transition placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-sm font-medium text-[#111] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="admin@college.edu"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[#111] text-sm outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/10 transition placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ca1f23] text-white text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
                >
                  {profileSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
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
          icon={<Lock size={18} />}
          title="Change Password"
          subtitle="Update your login password with current password verification"
          color="#2563eb"
        >
          <form onSubmit={changePassword} className="pt-5 space-y-4">
            <PasswordInput
              id="current-password"
              label="Current Password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm((p) => ({ ...p, currentPassword: v }))}
              placeholder="Enter your current password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={`flex items-center gap-2 text-xs font-medium ${
                  pwForm.newPassword === pwForm.confirmPassword
                    ? "text-[#00a651]"
                    : "text-red-500"
                }`}
              >
                <CheckCircle2 size={13} />
                {pwForm.newPassword === pwForm.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {/* Password strength hint */}
            {pwForm.newPassword && (
              <div className="flex gap-1.5 items-center">
                {["bg-gray-200", "bg-gray-200", "bg-gray-200"].map((base, i) => {
                  const len = pwForm.newPassword.length;
                  const filled =
                    (i === 0 && len >= 1) ||
                    (i === 1 && len >= 6) ||
                    (i === 2 && len >= 10);
                  const fillColor =
                    len < 6
                      ? "bg-red-400"
                      : len < 10
                        ? "bg-amber-400"
                        : "bg-[#00a651]";
                  return (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${filled ? fillColor : base} transition-all duration-300`}
                    />
                  );
                })}
                <span className="text-[11px] text-gray-400 ml-1 shrink-0">
                  {pwForm.newPassword.length < 6
                    ? "Weak"
                    : pwForm.newPassword.length < 10
                      ? "Fair"
                      : "Strong"}
                </span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:opacity-95 transition disabled:opacity-50"
              >
                {pwSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </Section>

        {/* ── SECTION 3 — ACADEMIC YEAR ─────────────────────────────────── */}
        <Section
          id="academic-year"
          icon={<CalendarDays size={18} />}
          title="Academic Year"
          subtitle="Set the active academic year for faculty evaluations"
          color="#059669"
        >
          <div className="pt-5 space-y-4">
            <p className="text-sm text-gray-500">
              This setting controls which academic year is shown in dashboards
              and evaluation forms. It is saved per browser session.
            </p>

            {/* Current year indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#059669]">
                  Active Year: {academicYear}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  All evaluation data is filtered by this year.
                </p>
              </div>
            </div>

            {/* Year selector */}
            <div>
              <label className="block text-sm font-medium text-[#111] mb-2">
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
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition ${
                      y === academicYear
                        ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#059669]/40 hover:bg-green-50/50"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  resetToCurrentYear();
                  toast.success("Academic year reset to auto-detected current year.");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <RefreshCw size={13} />
                Reset to Auto-Detected
              </button>
              <p className="text-xs text-gray-400">
                Auto-detected: Academic year changes every June.
              </p>
            </div>
          </div>
        </Section>

        {/* ── SECTION 4 — SYSTEM INFO ───────────────────────────────────── */}
        <Section
          id="system-info"
          icon={<Info size={18} />}
          title="System Information"
          subtitle="Overview of the current system configuration and data"
          color="#7c3aed"
        >
          <div className="pt-5 space-y-5">
            {/* App info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "App Version",
                  value: "0.1.0",
                  icon: <Layers size={14} />,
                  color: "#7c3aed",
                  bg: "rgba(124,58,237,0.08)",
                },
                {
                  label: "Framework",
                  value: "Next.js 16",
                  icon: <Database size={14} />,
                  color: "#111",
                  bg: "rgba(0,0,0,0.04)",
                },
                {
                  label: "Database",
                  value: "MongoDB",
                  icon: <Database size={14} />,
                  color: "#059669",
                  bg: "rgba(5,150,105,0.08)",
                },
                {
                  label: "Environment",
                  value:
                    process.env.NODE_ENV === "production"
                      ? "Production"
                      : "Development",
                  icon: <Shield size={14} />,
                  color:
                    process.env.NODE_ENV === "production" ? "#ca1f23" : "#d97706",
                  bg:
                    process.env.NODE_ENV === "production"
                      ? "rgba(202,31,35,0.08)"
                      : "rgba(217,119,6,0.08)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-4 border border-gray-100"
                  style={{ background: item.bg }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <p
                    className="text-sm font-bold mt-2 mb-0.5"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                  <p className="text-[11px] text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Data counts */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Database Records
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
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#ca1f23]/30 hover:bg-red-50/20 transition group"
                  >
                    <span className="text-sm text-gray-600 group-hover:text-[#111] transition">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-[#111]">
                      {item.value ?? (
                        <span className="w-8 h-4 rounded bg-gray-100 animate-pulse inline-block" />
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Tech Stack
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
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200"
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
