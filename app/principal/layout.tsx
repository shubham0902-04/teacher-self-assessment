"use client";

import PrincipalSidebar from "@/app/components/principal/PrincipalSidebar";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <PrincipalSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
