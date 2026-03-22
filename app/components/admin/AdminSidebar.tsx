"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  SlidersHorizontal,
  Users,
  Settings,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: FolderKanban,
    },
    {
      name: "Parameters",
      path: "/admin/parameters",
      icon: ListChecks,
    },
    {
      name: "Parameter Fields",
      path: "/admin/parameter-fields",
      icon: SlidersHorizontal,
    },
    {
      name: "Faculty Assignment",
      path: "/admin/faculty-category-assignment",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-[250px] bg-white border-r h-screen p-5">
      {/* LOGO */}
      <h2 className="text-xl font-bold mb-8 text-[#ca1f23]">Teacher System</h2>

      {/* MENU */}
      <div className="space-y-2">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${
                  isActive
                    ? "bg-[#ca1f23] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
