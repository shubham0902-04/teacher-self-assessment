"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  SlidersHorizontal,
  Users,
  Settings,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  LogOut,
  AlertTriangle,
} from "lucide-react";

const menu = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Evaluation Setup",
    items: [
      { name: "Categories", path: "/admin/categories", icon: FolderKanban },
      { name: "Parameters", path: "/admin/parameters", icon: ListChecks },
      {
        name: "Parameter Fields",
        path: "/admin/parameter-fields",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Faculty Assignment",
        path: "/admin/faculty-category-assignment",
        icon: Users,
      },
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

type SidebarContentProps = {
  pathname: string;
  userName: string;
  onNavigate?: () => void;
  onLogoutClick: () => void;
};

function SidebarContent({
  pathname,
  userName,
  onNavigate,
  onLogoutClick,
}: SidebarContentProps) {
  const initial = userName ? userName.charAt(0).toUpperCase() : "A";

  return (
    <div className="flex flex-col h-full">
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
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {menu.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.path);
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

      {/* BOTTOM — User info + Logout */}
      <div className="px-4 py-4 border-t border-white/[0.06] shrink-0">
        {/* User + logout in one row */}
        <div className="flex items-center gap-2">
          {/* User badge */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ca1f23] to-[#8b1417] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {userName || "Admin"}
              </p>
              <p className="text-[11px] text-white/35 truncate">
                Administrator
              </p>
            </div>
          </div>

          {/* Logout icon button */}
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Lazy initializer — sirf first render pe chalta hai, useEffect ki zaroorat nahi
  const [userName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored).name || "";
    } catch {
      // ignore
    }
    return "";
  });

  function handleLogout() {
    // Cookie delete
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    // localStorage clear
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    // Redirect
    router.push("/login");
  }

  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden lg:flex w-[260px] shrink-0 sticky top-0 h-screen bg-[#0f0f0f] text-white flex-col">
        <SidebarContent
          pathname={pathname}
          userName={userName}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* MOBILE */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ca1f23] flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-white">
              Teacher Assessment
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
            userName={userName}
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
            {/* Red top strip */}
            <div className="h-1 bg-[#ca1f23]" />

            <div className="p-6">
              {/* Icon + heading */}
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

              {/* Buttons */}
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
