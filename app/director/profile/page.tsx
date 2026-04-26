"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut, ShieldCheck, Mail, Calendar, MapPin } from "lucide-react";

export default function DirectorProfilePage() {
  const { userName, userEmail } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[13px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Account Management</h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-8">My Profile</h1>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-slate-900 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-xl">
              <UserCircle size={48} />
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{userName || "Director"}</h2>
                <p className="text-slate-500 font-medium">Institution Director / Chairman</p>
              </div>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <LogOut size={18} />
                Logout Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Professional Information</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-[14px] font-bold text-slate-700">{userEmail || "director@institution.edu"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Access Role</p>
                    <p className="text-[14px] font-bold text-emerald-600">Director / Chairman</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Institutional Access</h3>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location Scope</p>
                    <p className="text-[14px] font-bold text-slate-700">All Registered Schools</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Activity</p>
                    <p className="text-[14px] font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
