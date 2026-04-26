"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  School, 
  Building2, 
  Users, 
  FileBarChart, 
  UserCircle, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function DirectorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userName } = useAuth();

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/director" },
    { name: "School Analysis", icon: School, path: "/director/schools" },
    { name: "Departmental Data", icon: Building2, path: "/director/departments" },
    { name: "Faculty Ranking", icon: TrendingUp, path: "/director/faculty" },
    { name: "Performance Reports", icon: FileBarChart, path: "/director/reports" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-[#0f172a] text-white flex flex-col z-50 border-r border-slate-800 shadow-2xl overflow-hidden hidden lg:flex">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-black tracking-tighter leading-none">DIRECTOR / CHAIRMAN</h1>
            <p className="text-[9px] font-bold text-emerald-400 tracking-[0.2em] mt-1 uppercase">Portal Control</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <span className="text-[11px] font-black text-emerald-400">{userName?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold truncate leading-tight">{userName || "User"}</p>
              <p className="text-[9px] text-white/40 font-medium">Director / Chairman</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto relative z-10 custom-scrollbar">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
        
        <div className="px-3 mb-2 mt-2">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Navigation</p>
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                isActive 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon size={16} className={isActive ? "text-white" : "group-hover:text-emerald-400 transition-colors"} />
                <span className="text-[13px] font-bold">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={12} />}
            </Link>
          );
        })}

        <div className="px-3 mt-6 mb-2 pt-4 border-t border-white/5">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Management</p>
        </div>
        
        <Link
          href="/director/profile"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 ${
            pathname === "/director/profile" 
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
            : "text-white/50 hover:bg-white/5 hover:text-white"
          }`}
        >
          <UserCircle size={16} />
          <span className="text-[13px] font-bold">My Profile</span>
        </Link>
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 text-[13px] font-black shadow-lg shadow-red-500/5"
        >
          <LogOut size={14} />
          Logout System
        </button>
      </div>
    </aside>
  );
}
