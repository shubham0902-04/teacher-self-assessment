"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { Trash2, X, UserPlus, Building2, School, Pencil, Eye, EyeOff } from "lucide-react";
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

type SchoolType = {
  _id: string;
  schoolName: string;
  schoolCode: string;
};

type Department = {
  _id: string;
  departmentName: string;
  departmentCode: string;
  schoolId?: string | { _id: string };
};

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-[#e31e24]/10 text-[#e31e24] border border-[#e31e24]/20",
  Principal: "bg-purple-50 text-purple-600 border border-purple-200",
  HOD: "bg-blue-50 text-blue-600 border border-blue-200",
  Faculty: "bg-[#00a859]/10 text-[#00a859] border border-[#00a859]/20",
  Chairman: "bg-amber-50 text-amber-600 border border-amber-200",
};

const initialForm = {
  name: "",
  email: "",
  employeeId: "",
  role: "Faculty",
  password: "",
  schoolId: "",
  departmentId: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const needsSchool = form.role === "Faculty" || form.role === "HOD" || form.role === "Principal";
  const needsDept = form.role === "Faculty" || form.role === "HOD";
  const isEditing = editingUser !== null;

  // ---------------- LOAD ----------------

  async function loadUsers() {
    try {
      setFetching(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else toast.error("Failed to load users");
    } catch {
      toast.error("Network error — try again");
    } finally {
      setFetching(false);
    }
  }

  async function loadSchools() {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (data.success) setSchools(data.data || []);
    } catch { /* silent */ }
  }

  async function loadDepartments() {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success) setAllDepartments(data.data || []);
    } catch { /* silent */ }
  }

  useEffect(() => {
    loadUsers();
    loadSchools();
    loadDepartments();
  }, []);

  // Filter departments by selected school
  useEffect(() => {
    if (!form.schoolId) {
      setFilteredDepts([]);
      return;
    }
    const depts = allDepartments.filter((d) => {
      const dSchoolId = typeof d.schoolId === "object" ? d.schoolId?._id : d.schoolId;
      return dSchoolId === form.schoolId;
    });
    setFilteredDepts(depts);
  }, [form.schoolId, allDepartments]);

  // ---------------- HELPERS ----------------

  function getSchoolId(user: User) {
    if (!user.schoolId) return "";
    return typeof user.schoolId === "object" ? user.schoolId._id : user.schoolId;
  }

  function getDeptId(user: User) {
    if (!user.departmentId) return "";
    return typeof user.departmentId === "object" ? user.departmentId._id : user.departmentId;
  }

  function getDeptName(user: User) {
    if (!user.departmentId) return null;
    if (typeof user.departmentId === "object") return user.departmentId.departmentName;
    const found = allDepartments.find((d) => d._id === user.departmentId);
    return found?.departmentName ?? null;
  }

  function getSchoolName(user: User) {
    if (!user.schoolId) return null;
    if (typeof user.schoolId === "object") return user.schoolId.schoolName;
    const found = schools.find((s) => s._id === user.schoolId);
    return found?.schoolName ?? null;
  }

  // ---------------- MODAL ----------------

  function openAddForm() {
    setEditingUser(null);
    setForm(initialForm);
    setShowPassword(false);
    setFilteredDepts([]);
    setIsFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    const schoolId = getSchoolId(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      employeeId: user.employeeId || "",
      role: user.role || "Faculty",
      password: "", // empty — only update if filled
      schoolId,
      departmentId: getDeptId(user),
    });
    setShowPassword(false);
    // Pre-filter departments for this school
    if (schoolId) {
      const depts = allDepartments.filter((d) => {
        const dSchoolId = typeof d.schoolId === "object" ? d.schoolId?._id : d.schoolId;
        return dSchoolId === schoolId;
      });
      setFilteredDepts(depts);
    }
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFilteredDepts([]);
    setShowPassword(false);
  }

  // ---------------- SUBMIT ----------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!isEditing && !form.password.trim()) return toast.error("Password is required");
    if (needsSchool && !form.schoolId) return toast.error("School is required for this role");
    if (needsDept && !form.departmentId) return toast.error("Department is required for this role");

    try {
      setLoading(true);

      const url = isEditing ? `/api/users/${editingUser._id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        employeeId: form.employeeId.trim() || undefined,
        schoolId: form.schoolId || undefined,
        departmentId: form.departmentId || undefined,
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
        toast.success(isEditing ? `${form.name}'s profile updated` : `${form.name}'s account created`);
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
        toast.success("User deleted");
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
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">User Management</h1>
            <p className="text-[13px] text-slate-500 font-medium">Manage administrators, principals, HODs and faculty members</p>
          </div>
          <button
            onClick={openAddForm}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-800">
              All Users
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
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-[13px] font-medium">No users found — add one above</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">School</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
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
                      <td className="px-6 py-4">
                        {getSchoolName(u) ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-2.5 py-1 rounded-md">
                            <School size={12} />
                            {getSchoolName(u)}
                          </span>
                        ) : <span className="text-slate-300 text-[13px]">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {getDeptName(u) ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 border border-blue-100/50 text-blue-600 px-2.5 py-1 rounded-md">
                            <Building2 size={12} />
                            {getDeptName(u)}
                          </span>
                        ) : <span className="text-slate-300 text-[13px]">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          {u.role}
                        </span>
                      </td>
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
                  {isEditing ? "Edit User" : "Add New User"}
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

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value, schoolId: "", departmentId: "" })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  >
                    <option>Admin</option>
                    <option>Chairman</option>
                    <option>Principal</option>
                    <option>HOD</option>
                    <option>Faculty</option>
                  </select>
                </div>

                {needsSchool && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                        School <span className="text-[#e31e24]">*</span>
                      </label>
                      {schools.length === 0 ? (
                        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700 font-medium">
                          No schools found —{" "}
                          <a href="/admin/schools" className="underline font-bold hover:text-amber-900">create schools first</a>
                        </div>
                      ) : (
                        <select
                          value={form.schoolId}
                          onChange={(e) => setForm({ ...form, schoolId: e.target.value, departmentId: "" })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-white"
                        >
                          <option value="">Select School</option>
                          {schools.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.schoolName} ({s.schoolCode})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {needsDept && (
                      <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                        Department <span className="text-[#e31e24]">*</span>
                      </label>
                      {!form.schoolId ? (
                        <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-400">
                          Select a school first
                        </div>
                      ) : filteredDepts.length === 0 ? (
                        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700 font-medium">
                          No departments in this school —{" "}
                          <a href="/admin/departments" className="underline font-bold hover:text-amber-900">create departments first</a>
                        </div>
                      ) : (
                        <select
                          value={form.departmentId}
                          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-white"
                        >
                          <option value="">Select Department</option>
                          {filteredDepts.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.departmentName} ({d.departmentCode})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    )}
                  </div>
                )}

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
                  : isEditing ? "Update User" : "Create User"}
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
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">Delete User?</h3>
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