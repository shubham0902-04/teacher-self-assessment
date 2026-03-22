"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Categories</h2>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold">Parameters</h2>
            <p className="text-2xl font-bold mt-2">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
