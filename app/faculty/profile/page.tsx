"use client";

import { useEffect, useState } from "react";
import FacultySidebar from "@/app/components/faculty/FacultySidebar";
import { GraduationCap, Building2, Mail, BadgeCheck, User, CalendarDays, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type UserData = {
  name?: string;
  email?: string;
  role?: string;
  employeeId?: string;
};

export default function FacultyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({});
  const [department, setDepartment] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      const d = localStorage.getItem("departmentName");
      if (d) setDepartment(d);
    } catch {}
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    ["role", "user", "departmentName"].forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "F";

  if (!mounted) return null;

  const INFO = [
    { label: "Full Name",    value: user.name || "—",         icon: User },
    { label: "Email",        value: user.email || "—",        icon: Mail },
    { label: "Employee ID",  value: user.employeeId || "—",   icon: BadgeCheck },
    { label: "Department",   value: department || "—",        icon: Building2 },
    { label: "Role",         value: user.role || "Faculty",   icon: GraduationCap },
    { label: "Academic Year", value: new Date().getFullYear() + "–" + (new Date().getFullYear() + 1), icon: CalendarDays },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <FacultySidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 sm:px-8 py-4 flex items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
              <User size={16} className="text-[#00a859]" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none mb-1">My Profile</h1>
              <p className="text-[12px] text-slate-500 font-medium">Your account information</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 max-w-2xl mx-auto space-y-6">

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8 flex items-center gap-5 sm:gap-6 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a859]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shrink-0 shadow-lg shadow-[#00a859]/20">
              {initial}
            </div>
            <div className="relative z-10">
              <p className="text-[20px] sm:text-[24px] font-bold text-slate-800 tracking-tight leading-tight mb-1">{user.name || "Faculty"}</p>
              <p className="text-[13px] text-slate-500 font-medium mb-3">{user.email}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#00a859]/10 text-[#00a859] text-[10px] font-bold uppercase tracking-wider border border-[#00a859]/20">
                <GraduationCap size={12} />
                Faculty Member
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
            <p className="text-[14px] font-bold text-slate-800 mb-5">Account Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {INFO.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[13px] font-semibold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200/60 text-[13px] font-bold text-slate-600 shadow-sm hover:shadow-md hover:bg-[#e31e24]/10 hover:text-[#e31e24] hover:border-[#e31e24]/20 transition-all duration-200 group"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-[#e31e24] transition-colors" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
