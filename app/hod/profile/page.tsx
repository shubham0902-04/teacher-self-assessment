"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Building2, Mail, BadgeCheck, User, CalendarDays, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export default function HODProfilePage() {
  const router = useRouter();
  const { userName, userEmail } = useAuth();
  const [deptName, setDeptName] = useState("");

  useEffect(() => {
    const d = localStorage.getItem("hodDepartmentName");
    if (d) setDeptName(d);
  }, []);

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
    <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a859] flex items-center justify-center border border-emerald-100 shadow-sm">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Profile</h1>
            <p className="text-[13px] text-slate-500 font-medium">Your personal account details</p>
          </div>
        </div>
      </div>

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
            
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-3xl bg-[#00a859]/10 flex items-center justify-center text-[#00a859] mb-4">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Institutional Access</h3>
              <p className="text-sm text-slate-500 text-center max-w-[200px]">You have full administrative access to your department evaluations.</p>
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
    </main>
  );
}
