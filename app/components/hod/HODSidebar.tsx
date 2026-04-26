"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  GraduationCap,
  Building2,
  ChevronRight,
  User,
  CheckSquare,
} from "lucide-react";

const NAV = [
  {
    group: "Overview",
    items: [{ label: "Dashboard", href: "/hod", icon: LayoutDashboard }],
  },
  {
    group: "Evaluations",
    items: [
      { label: "Pending Reviews",   href: "/hod/reviews",   icon: ClipboardCheck },
      { label: "Completed Reviews", href: "/hod/completed", icon: CheckCircle2   },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Manage Faculty", href: "/hod/users", icon: User },
      { label: "Category Assignment", href: "/hod/faculty-category-assignment", icon: CheckSquare },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "My Profile", href: "/hod/profile", icon: User },
    ],
  },
];

function NavContent({
  pathname,
  name,
  department,
  onNav,
  onLogout,
}: {
  pathname: string;
  name: string;
  department: string;
  onNav?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full select-none bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-[#00a859] flex items-center justify-center shrink-0 shadow-md shadow-[#00a859]/20">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-800 tracking-tight">HOD Portal</p>
          <p className="text-[11px] text-slate-500 font-medium">Evaluation System</p>
        </div>
      </div>

      {/* Welcome card */}
      <div className="mx-4 mt-5 mb-2 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-sm">
            {name ? name.charAt(0).toUpperCase() : "H"}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-800 truncate">{name || "HOD"}</p>
            <p className="text-[11px] text-slate-500 truncate">Head of Department</p>
          </div>
        </div>
        {department && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
            <Building2 size={12} className="text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-500 font-medium truncate">{department}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/hod"
                    ? pathname === "/hod"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={onNav}>
                    <div
                      className={[
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer group",
                        active
                          ? "bg-[#00a859]/10 text-[#00a859]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <Icon size={16} className={active ? "text-[#00a859]" : "text-slate-400 group-hover:text-slate-600"} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={14} className="text-[#00a859]/60" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-[#e31e24] hover:bg-[#e31e24]/10 transition-all duration-200 group"
        >
          <LogOut size={16} className="text-slate-400 group-hover:text-[#e31e24]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function HODSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const u = localStorage.getItem("user");
      if (u) setName(JSON.parse(u).name || "");
      const d = localStorage.getItem("hodDepartmentName");
      if (d) setDepartment(d);
    } catch {}
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    ["role", "user", "hodDepartmentName"].forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  }

  const n = mounted ? name : "";
  const d = mounted ? department : "";

  return (
    <>
      {/* Desktop spacer */}
      <div className="hidden lg:block w-[260px] shrink-0 bg-[#f8fafc]" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 w-[260px] h-screen z-30">
        <NavContent
          pathname={pathname}
          name={n}
          department={d}
          onLogout={() => setShowModal(true)}
        />
      </aside>

      {/* Mobile bar */}
      <div className="lg:hidden">
        <div className="fixed top-0 inset-x-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a859] flex items-center justify-center shadow-sm">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-800">HOD Portal</span>
          </div>
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-800 transition bg-slate-50 p-2 rounded-lg">
            <Menu size={20} />
          </button>
        </div>
        <div className="h-16" />

        {open && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />}

        <aside
          className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-white transition-transform duration-300 ease-in-out ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-4 text-slate-400 hover:text-slate-800 bg-slate-50 p-1.5 rounded-lg"
          >
            <X size={16} />
          </button>
          <NavContent
            pathname={pathname}
            name={n}
            department={d}
            onNav={() => setOpen(false)}
            onLogout={() => { setOpen(false); setShowModal(true); }}
          />
        </aside>
      </div>

      {/* Logout modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#e31e24]/10 flex items-center justify-center mb-4">
                <LogOut size={20} className="text-[#e31e24]" />
              </div>
              <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">Sign Out</h3>
              <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to sign out? You will need to log back in to access the portal.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 rounded-xl bg-[#e31e24] text-white text-[14px] font-semibold hover:bg-[#c9181f] transition shadow-sm shadow-[#e31e24]/20"
                >
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
