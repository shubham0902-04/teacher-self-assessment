"use client";

import { useEffect, useState } from "react";
import HODSidebar from "@/app/components/hod/HODSidebar";
import { Trash2, X, UserPlus, Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  departmentId?: { _id: string; departmentName: string } | string;
  schoolId?: { _id: string; schoolName: string } | string;
};

const initialForm = {
  name: "",
  email: "",
  employeeId: "",
  role: "Faculty",
  password: "",
};

export default function HODManageFacultyPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [hodSchoolId, setHodSchoolId] = useState<string>("");
  const [hodDepartmentId, setHodDepartmentId] = useState<string>("");

  const isEditing = editingUser !== null;

  // ---------------- LOAD ----------------

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data;
          const sId = typeof user.schoolId === "object" ? user.schoolId?._id : user.schoolId;
          const dId = typeof user.departmentId === "object" ? user.departmentId?._id : user.departmentId;
          setHodSchoolId(sId || "");
          setHodDepartmentId(dId || "");
        }
      } catch {
        // ignore
      }
    }
    loadProfile();
  }, []);

  async function loadUsers() {
    try {
      setFetching(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        // HOD can only see Faculty in their own department
        const filtered = data.data.filter((u: User) => {
          const sId = typeof u.schoolId === "object" ? u.schoolId?._id : u.schoolId;
          const dId = typeof u.departmentId === "object" ? u.departmentId?._id : u.departmentId;
          return u.role === "Faculty" && sId === hodSchoolId && dId === hodDepartmentId;
        });
        setUsers(filtered);
      } else {
        toast.error("Failed to load faculty");
      }
    } catch {
      toast.error("Network error — try again");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (hodSchoolId && hodDepartmentId) {
      loadUsers();
    } else if (fetching && !hodSchoolId && !hodDepartmentId) {
      // Wait for localStorage extraction
      setTimeout(() => setFetching(false), 500);
    }
  }, [hodSchoolId, hodDepartmentId]);

  // ---------------- MODAL ----------------

  function openAddForm() {
    if (!hodSchoolId || !hodDepartmentId) {
      return toast.error("Missing your School or Department info. Please re-login.");
    }
    setEditingUser(null);
    setForm(initialForm);
    setShowPassword(false);
    setIsFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      employeeId: user.employeeId || "",
      role: "Faculty",
      password: "", // empty — only update if filled
    });
    setShowPassword(false);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setShowPassword(false);
  }

  // ---------------- SUBMIT ----------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!isEditing && !form.password.trim()) return toast.error("Password is required");

    try {
      setLoading(true);

      const url = isEditing ? `/api/users/${editingUser._id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: "Faculty",
        employeeId: form.employeeId.trim() || undefined,
        schoolId: hodSchoolId,
        departmentId: hodDepartmentId,
      };

      // Only send password if filled
      if (form.password.trim()) {
        body.password = form.password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? `${form.name}'s profile updated` : `${form.name} added as Faculty`);
        closeForm();
        loadUsers();
      } else {
        toast.error(data.message || (isEditing ? "Update failed" : "Creation failed"));
      }
    } catch {
      toast.error("Network error — try again");
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
        toast.success("Faculty member deleted");
        setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Network error — try again");
    } finally {
      setDeleteId(null);
    }
  }

  // ---------------- UI ----------------

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <HODSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Manage Faculty</h1>
            <p className="text-[13px] text-slate-500 font-medium">Add, edit, or remove faculty members in your department</p>
          </div>
          <button
            onClick={openAddForm}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <UserPlus size={16} />
            Add Faculty
          </button>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-800">
              Department Faculty
              {!fetching && (
                <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-200/50 text-[12px] font-semibold text-slate-500">
                  {users.length} total
                </span>
              )}
            </h2>
          </div>

          {fetching ? (
            <div className="py-16 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
              Loading faculty...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-[13px] font-medium">No faculty members found — add one above</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-[13px]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">{u.email}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">{u.employeeId || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditForm(u)}
                            className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-[#00a859]/10 rounded-lg transition"
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(u._id)}
                            className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-[#e31e24]/10 rounded-lg transition"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
                  {isEditing ? "Edit Faculty" : "Add New Faculty"}
                </h3>
                {isEditing && (
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                    Leave password empty to keep existing
                  </p>
                )}
              </div>
              <button onClick={closeForm} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Full Name <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Email <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Employee ID
                  </label>
                  <input
                    placeholder="e.g. EMP-001"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    {isEditing ? "New Password" : "Password"}{" "}
                    {!isEditing && <span className="text-[#e31e24]">*</span>}
                    {isEditing && (
                      <span className="text-slate-400 font-medium ml-1">(optional)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditing ? "Leave empty to keep current" : "Min 6 characters"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100/50">
                  <p className="text-[12px] font-medium text-blue-700 leading-relaxed">
                    This faculty member will automatically be assigned to your department and school.
                  </p>
                </div>

              </form>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#00a859] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50"
              >
                {loading
                  ? isEditing ? "Updating..." : "Creating..."
                  : isEditing ? "Update Faculty" : "Create Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#e31e24]/10 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-[#e31e24]" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">Remove Faculty?</h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              This action is permanent and cannot be undone. Any data tied to this user may be orphaned.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-200 bg-white text-slate-600 py-2.5 rounded-xl text-[14px] font-bold hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-[#e31e24] text-white py-2.5 rounded-xl text-[14px] font-bold shadow-sm shadow-[#e31e24]/20 hover:bg-[#c9181f] transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
