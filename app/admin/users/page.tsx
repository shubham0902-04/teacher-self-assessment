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

  const needsSchoolDept = form.role === "Faculty" || form.role === "HOD";
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
    if (needsSchoolDept && !form.schoolId) return toast.error("School is required for Faculty and HOD");
    if (needsSchoolDept && !form.departmentId) return toast.error("Department is required for Faculty and HOD");

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
    <div className="flex h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6 text-[#111]">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#111]">User Management</h1>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-[#ca1f23] text-white px-5 py-3 rounded-xl font-medium shadow-md hover:opacity-95 transition"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* TABLE */}
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
            <div className="py-16 text-center text-gray-400 text-sm">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No users found — add one above</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f5f7]">
                  <tr className="text-left text-sm font-semibold text-gray-600">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Employee ID</th>
                    <th className="px-5 py-4">School</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition text-sm">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#ca1f23]/10 flex items-center justify-center text-[12px] font-bold text-[#ca1f23] shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#111]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4 text-gray-500">{u.employeeId || "—"}</td>
                      <td className="px-5 py-4">
                        {getSchoolName(u) ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-[#ca1f23] px-2.5 py-1 rounded-full">
                            <School size={11} />
                            {getSchoolName(u)}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {getDeptName(u) ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                            <Building2 size={11} />
                            {getDeptName(u)}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditForm(u)}
                            className="text-gray-400 hover:text-[#ca1f23] transition"
                            title="Edit user"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(u._id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-[#111]">
                  {isEditing ? "Edit User" : "Add New User"}
                </h3>
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Leave password empty to keep existing
                  </p>
                )}
              </div>
              <button onClick={closeForm} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Employee ID
                  </label>
                  <input
                    placeholder="e.g. EMP-001"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    {isEditing ? "New Password" : "Password"}{" "}
                    {!isEditing && <span className="text-red-500">*</span>}
                    {isEditing && (
                      <span className="text-gray-400 font-normal">(optional)</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditing ? "Leave empty to keep current" : "Min 6 characters"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value, schoolId: "", departmentId: "" })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] bg-white"
                  >
                    <option>Admin</option>
                    <option>Chairman</option>
                    <option>Principal</option>
                    <option>HOD</option>
                    <option>Faculty</option>
                  </select>
                </div>

                {needsSchoolDept && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111]">
                        School <span className="text-red-500">*</span>
                      </label>
                      {schools.length === 0 ? (
                        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          No schools found —{" "}
                          <a href="/admin/schools" className="underline font-medium">create schools first</a>
                        </div>
                      ) : (
                        <select
                          value={form.schoolId}
                          onChange={(e) => setForm({ ...form, schoolId: e.target.value, departmentId: "" })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] bg-white"
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

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111]">
                        Department <span className="text-red-500">*</span>
                      </label>
                      {!form.schoolId ? (
                        <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
                          Select a school first
                        </div>
                      ) : filteredDepts.length === 0 ? (
                        <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          No departments in this school —{" "}
                          <a href="/admin/departments" className="underline font-medium">create departments first</a>
                        </div>
                      ) : (
                        <select
                          value={form.departmentId}
                          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] bg-white"
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
                  </>
                )}

              </form>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="submit"
                form="user-form"
                disabled={loading}
                className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading
                  ? isEditing ? "Updating..." : "Creating..."
                  : isEditing ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#111]">Delete User?</h3>
              <button onClick={() => setDeleteId(null)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition">
                <X size={17} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
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