"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Building2, Mail, BadgeCheck, User, CalendarDays, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "sonner";
import { Key, Eye, EyeOff, Loader2, Save } from "lucide-react";

export default function HODProfilePage() {
  const router = useRouter();
  const { userName, userEmail } = useAuth();
  const [deptName, setDeptName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);

  useEffect(() => {
    const d = localStorage.getItem("hodDepartmentName");
    if (d) setDeptName(d);
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
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.push("/login");
  }

  const items = [
    { label: "Name", value: userName || "HOD", icon: User },
    { label: "Email", value: userEmail || "—", icon: Mail },
    { label: "Department", value: deptName || "—", icon: Building2 },
    { label: "Role", value: "Department Head", icon: BadgeCheck, color: "text-[#00a859]" },
    { label: "Last Activity", value: new Date().toLocaleDateString(), icon: CalendarDays },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 sm:px-8 py-4 flex items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00a859] flex items-center justify-center border border-emerald-100 shadow-sm">
            <User size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">My Profile</h1>
            <p className="text-[12px] text-slate-500 font-medium">Your personal account details</p>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={`text-[14px] font-bold ${item.color || "text-slate-700"}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Key size={14} />
                  </div>
                  <p className="text-[14px] font-bold text-slate-800">Change Password</p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-[#00a859] transition shadow-inner"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-[#00a859] transition shadow-inner"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 rounded-2xl bg-[#00a859] text-white text-[13px] font-black shadow-lg shadow-[#00a859]/20 hover:bg-[#008f4c] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Update Password
                  </button>
                </form>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-20 h-20 rounded-3xl bg-[#00a859]/10 flex items-center justify-center text-[#00a859] mb-4">
                  <GraduationCap size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Institutional Access</h3>
                <p className="text-sm text-slate-500 text-center max-w-[200px]">You have full administrative access to your department evaluations.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={18} />
            Logout System
          </button>
        </div>
      </div>
    </div>
  </main>
  );
}
