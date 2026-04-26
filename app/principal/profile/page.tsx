"use client";

import { useEffect, useState } from "react";
import { GraduationCap, School, Mail, BadgeCheck, User, CalendarDays, LogOut, Key, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserData = {
  name?: string;
  email?: string;
  role?: string;
  employeeId?: string;
  schoolId?: { schoolName?: string } | string;
};

export default function PrincipalProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({});
  const [schoolName, setSchoolName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      const s = localStorage.getItem("principalSchoolName");
      if (s) setSchoolName(s);
    } catch {}
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword.trim()) return toast.error("Please enter your current password");
    if (!newPassword.trim()) return toast.error("Please enter a new password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setUpdating(true);
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim() 
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated successfully");
        setNewPassword("");
        setCurrentPassword("");
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    ["role", "user", "principalSchoolName"].forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "P";

  if (!mounted) return null;

  const INFO = [
    { label: "Full Name",    value: user.name || "—",         icon: User },
    { label: "Email",        value: user.email || "—",        icon: Mail },
    { label: "Employee ID",  value: user.employeeId || "—",   icon: BadgeCheck },
    { label: "School",       value: schoolName || "—",        icon: School },
    { label: "Role",         value: user.role || "Principal", icon: GraduationCap },
    { label: "Academic Year", value: new Date().getFullYear() + "–" + (new Date().getFullYear() + 1), icon: CalendarDays },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc]">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 sm:px-8 py-4 flex items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
              <User size={16} className="text-[#00a859]" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none mb-1">My Profile</h1>
              <p className="text-[12px] text-slate-500 font-medium">Principal account information</p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">

        <div className="px-5 sm:px-8 py-6 max-w-2xl mx-auto space-y-6">

          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex items-center gap-5 sm:gap-6 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a859]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shrink-0 shadow-lg shadow-[#00a859]/20">
              {initial}
            </div>
            <div className="relative z-10">
              <p className="text-[20px] sm:text-[24px] font-bold text-slate-800 tracking-tight leading-tight mb-1">{user.name || "Principal"}</p>
              <p className="text-[13px] text-slate-500 font-medium mb-3">{user.email}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#00a859]/10 text-[#00a859] text-[10px] font-bold uppercase tracking-wider border border-[#00a859]/20">
                <GraduationCap size={12} />
                School Principal
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
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

          {/* Password change */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Key size={14} />
              </div>
              <p className="text-[14px] font-bold text-slate-800">Security & Password</p>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-[#00a859] text-white text-[13px] font-bold shadow-sm shadow-[#00a859]/20 hover:bg-[#008f4c] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Update Password
              </button>
            </form>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 shadow-sm hover:shadow-md hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 group"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
