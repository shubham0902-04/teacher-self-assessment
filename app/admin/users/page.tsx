"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { Trash2, X, UserPlus } from "lucide-react";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
};

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700",
  Principal: "bg-purple-100 text-purple-700",
  HOD: "bg-blue-100 text-blue-700",
  Faculty: "bg-green-100 text-green-700",
  Chairman: "bg-amber-100 text-amber-700",
};

const initialForm = {
  name: "",
  email: "",
  employeeId: "",
  role: "Faculty",
  password: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ---------------- LOAD ----------------

  async function loadUsers() {
    try {
      setFetching(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error("Users load karne mein problem aayi");
      }
    } catch {
      toast.error("Network error — dobara try karo");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openForm() {
    setForm(initialForm);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setForm(initialForm);
  }

  // ---------------- CREATE ----------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name required hai");
    if (!form.email.trim()) return toast.error("Email required hai");
    if (!form.password.trim()) return toast.error("Password required hai");

    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${form.name} ka account ban gaya`);
        closeForm();
        loadUsers();
      } else {
        toast.error(data.message || "User create nahi hua");
      }
    } catch {
      toast.error("Network error — dobara try karo");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- DELETE ----------------

  async function confirmDelete() {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("User delete ho gaya");
        setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      } else {
        toast.error(data.message || "Delete nahi hua");
      }
    } catch {
      toast.error("Network error — dobara try karo");
    } finally {
      setDeleteId(null);
    }
  }

  // ---------------- UI ----------------

  return (
    <div className="flex h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 text-[#111]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#111]">User Management</h1>

          <button
            onClick={openForm}
            className="inline-flex items-center gap-2 bg-[#ca1f23] text-white px-5 py-3 rounded-xl font-medium shadow-md hover:opacity-95 transition"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#111]">
              All Users
              {!fetching && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({users.length})
                </span>
              )}
            </h2>
          </div>

          {fetching ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Koi user nahi mila — upar se naya banao
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f5f7]">
                  <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Employee ID</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition text-sm"
                    >
                      <td className="px-5 py-4 font-medium text-[#111]">
                        {u.name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {u.employeeId || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleteId(u._id)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD USER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#111]">Add New User</h3>
              <button
                onClick={closeForm}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#111]">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#111]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#111]">
                  Employee ID
                </label>
                <input
                  placeholder="EMP-001"
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#111]">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#111]">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] outline-none focus:border-[#ca1f23] bg-white"
                >
                  <option>Admin</option>
                  <option>Chairman</option>
                  <option>Principal</option>
                  <option>HOD</option>
                  <option>Faculty</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111]">
                User Delete Karo?
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Yeh action permanent hai aur undo nahi ho sakta.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 transition"
              >
                Haan, Delete Karo
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
