"use client";

import {
  LayoutDashboard,
  Grid2x2,
  ListChecks,
  Users,
  FileText,
  Settings,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-[290px] border-r border-gray-200 bg-white min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ca1f23] text-white shadow-md">
          <ListChecks size={24} />
        </div>

        <h1 className="text-[18px] font-bold leading-6">
          Teacher Self
          <br />
          Assessment System
        </h1>
      </div>

      <nav className="mt-4 space-y-2 px-3">
        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" />

        <SidebarItem
          icon={<Grid2x2 size={20} />}
          label="Categories Management"
          
        />

        <SidebarItem
          icon={<ListChecks size={20} />}
          label="Parameters Management"
        />

        <SidebarItem
          icon={<Users size={20} />}
          label="Faculty Category Assignment"
        />

        <SidebarItem icon={<FileText size={20} />} label="Reports" />

        <SidebarItem icon={<Settings size={20} />} label="Settings" />
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-lg text-gray-800 hover:bg-gray-50">
      {icon}
      {label}
    </button>
  );
}
