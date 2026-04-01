"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  ChevronRight,
  FileText,
} from "lucide-react";

const menu = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", path: "/faculty", icon: LayoutDashboard }],
  },
  {
    label: "Evaluation",
    items: [
      {
        name: "My Evaluation",
        path: "/faculty/evaluation",
        icon: ClipboardList,
      },
      { name: "My Submissions", path: "/faculty/submissions", icon: FileText },
    ],
  },
];

type SidebarContentProps = {
  pathname: string;
  userName: string;
  departmentName?: string;
  onNavigate?: () => void;
  onLogoutClick: () => void;
};

function SidebarContent({
  pathname,
  userName,
  departmentName,
  onNavigate,
  onLogoutClick,
}: SidebarContentProps) {
  const initial = userName ? userName.charAt(0).toUpperCase() : "F";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <style>{`
        .faculty-sidebar-nav::-webkit-scrollbar { width: 3px; }
        .faculty-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .faculty-sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .faculty-sidebar-nav::-webkit-scrollbar-thumb:hover { background: rgba(202,31,35,0.7); }
      `}</style>

      {/* LOGO */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ca1f23] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">
              Teacher Assessment
            </p>
            <p className="text-[11px] text-white/40 leading-tight mt-0.5">
              Faculty Portal
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav
        className="faculty-sidebar-nav flex-1 py-4 px-3 space-y-5"
        style={{
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.12) transparent",
        }}
      >
        {menu.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.path === "/faculty"
                    ? pathname === "/faculty"
                    : pathname.startsWith(item.path);
                const Icon = item.icon;

                return (
                  <Link key={item.path} href={item.path} onClick={onNavigate}>
                    <div
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-150 cursor-pointer
                        ${
                          isActive
                            ? "bg-[#ca1f23] text-white shadow-md shadow-red-900/30"
                            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/60" />
                      )}
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-white/40 group-hover:text-white/70"
                        }`}
                      />
                      <span className="text-[13px] font-medium flex-1">
                        {item.name}
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={13}
                          className="text-white/50 shrink-0"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* BOTTOM — user info + logout */}
      <div className="px-4 py-4 border-t border-white/[0.06] shrink-0">
        {departmentName && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
              Department
            </p>
            <p className="text-[12px] font-medium text-white/70 truncate">
              {departmentName}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ca1f23] to-[#8b1417] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {userName || "Faculty"}
              </p>
              <p className="text-[11px] text-white/35 truncate">
                Faculty Member
              </p>
            </div>
          </div>
          <button
            onClick={onLogoutClick}
            title="Logout"
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-150"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── HYDRATION FIX ────────────────────────────────────────────────────────────
  // Problem: typeof window !== 'undefined' check in useState initializer
  //          causes server/client mismatch → hydration error
  // Solution: mounted pattern — server aur client dono ka pehla render
  //           empty strings se hota hai, useEffect ke baad real values aati hain
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserName(parsed.name || "");
      }

      const dept = localStorage.getItem("departmentName");
      if (dept) setDepartmentName(dept);
    } catch {}
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("departmentName");
    router.push("/login");
  }

  // mounted hone tak empty pass karo → server aur client match karein
  const displayName = mounted ? userName : "";
  const displayDept = mounted ? departmentName : "";

  return (
    <>
      {/* DESKTOP spacer */}
      <div className="hidden lg:block w-[260px] shrink-0" />

      {/* DESKTOP fixed sidebar */}
      <aside
        className="hidden lg:flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "260px",
          height: "100vh",
          background: "#0f0f0f",
          color: "white",
          zIndex: 30,
        }}
      >
        <SidebarContent
          pathname={pathname}
          userName={displayName}
          departmentName={displayDept}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* MOBILE top bar */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ca1f23] flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white">
              Faculty Portal
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/60 hover:text-white transition p-1"
          >
            <Menu size={22} />
          </button>
        </div>
        <div className="h-14" />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-[260px] bg-[#0f0f0f] text-white
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition p-1 z-10"
          >
            <X size={18} />
          </button>
          <SidebarContent
            pathname={pathname}
            userName={displayName}
            departmentName={displayDept}
            onNavigate={() => setMobileOpen(false)}
            onLogoutClick={() => {
              setMobileOpen(false);
              setShowLogoutModal(true);
            }}
          />
        </aside>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-[#ca1f23]" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-[#ca1f23]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111] leading-tight">
                    Sign out of your account?
                  </h3>
                  <p className="text-[13px] text-gray-400 mt-1 leading-snug">
                    Your session will be ended and you will be redirected to the
                    login page.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-[#ca1f23] text-white text-[13px] font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
