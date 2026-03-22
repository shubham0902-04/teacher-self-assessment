"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useState } from "react";

export default function UsersPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Faculty",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("User Created");
      setForm({ name: "", email: "", password: "", role: "Faculty" });
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        <div className="bg-white p-6 rounded-xl shadow max-w-md">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-4 p-3 border rounded"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full mb-4 p-3 border rounded"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full mb-4 p-3 border rounded"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
          >
            <option value="Faculty">Faculty</option>
            <option value="HOD">HOD</option>
            <option value="Principal">Principal</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-[#ca1f23] text-white px-6 py-3 rounded"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}
