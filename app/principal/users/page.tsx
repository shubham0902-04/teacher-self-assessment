"use client";

import { useEffect, useState } from "react";
import { Trash2, X, UserPlus, Building2, Pencil, Eye, EyeOff, Filter } from "lucide-react";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type User = {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  departmentId?: { _id: string; departmentName: string } | string;
  schoolId?: { _id: string; schoolName: string } | string;
};

type Department = {
  _id: string;
  departmentName: string;
  departmentCode: string;
  schoolId?: string | { _id: string };
};

const ROLE_COLORS: Record<string, string> = {
  Principal: "bg-emerald-50 text-[#00a859] border border-emerald-200",
  HOD: "bg-blue-50 text-blue-600 border border-blue-200",
  Faculty: "bg-slate-50 text-slate-600 border border-slate-200",
};

const initialForm = {
  name: "",
  email: "",
  employeeId: "",
  role: "Faculty",
  password: "",
  departmentId: "",
};

export default function PrincipalUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = editingUser !== null;

  async function loadData() {
    try {
      setFetching(true);
      const [userRes, deptRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments")
      ]);
      
      const userData = await userRes.json();
      const deptData = await deptRes.json();

      if (userData.success) setUsers(userData.data);
      if (deptData.success) setDepartments(deptData.data || []);

      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setSchoolId(parsed.schoolId);
      }
      const s = localStorage.getItem("principalSchoolName");
      if (s) setSchoolName(s);

    } catch {
      toast.error("Failed to load data");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getDeptName(user: User) {
    if (!user.departmentId) return null;
    if (typeof user.departmentId === "object") return user.departmentId.departmentName;
    return departments.find(d => d._id === user.departmentId)?.departmentName ?? null;
  }

  function openAddForm() {
    setEditingUser(null);
    setForm(initialForm);
    setIsFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      employeeId: user.employeeId || "",
      role: user.role || "Faculty",
      password: "",
      departmentId: typeof user.departmentId === "object" ? user.departmentId._id : (user.departmentId || ""),
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and Email are required");
    if (!isEditing && !form.password) return toast.error("Password is required");
    if (!form.departmentId) return toast.error("Department is required");

    try {
      setLoading(true);
      const url = isEditing ? `/api/users/${editingUser._id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";
      
      const body = { ...form, schoolId };
      if (!body.password) delete (body as any).password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "User updated" : "User created");
        setIsFormOpen(false);
        loadData();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      if ((await res.json()).success) {
        toast.success("User deleted");
        setUsers(prev => prev.filter(u => u._id !== deleteId));
      }
    } catch { toast.error("Delete failed"); }
    finally { setDeleteId(null); }
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">User Management</h1>
            <p className="text-[13px] text-slate-500 font-medium">Manage HODs and Faculty for <span className="text-[#00a859] font-bold">{schoolName}</span></p>
          </div>
          <button onClick={openAddForm} className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5">
            <UserPlus size={16} /> Add User
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-800">School Faculty & Staff</h2>
          </div>

          {fetching ? (
            <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin mx-auto mb-2" /> Loading...</div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-slate-400">No users found for this school.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-sm">{u.name?.charAt(0).toUpperCase()}</div>
                          <span className="font-bold text-slate-700 text-[13px]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                          <Building2 size={12} /> {getDeptName(u) || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-md ${ROLE_COLORS[u.role] || "bg-slate-100 text-slate-500"}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditForm(u)} className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-emerald-50 rounded-lg"><Pencil size={16} /></button>
                          <button onClick={() => setDeleteId(u._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{isEditing ? "Edit User" : "Add New User"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none focus:border-[#00a859] bg-slate-50" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none focus:border-[#00a859] bg-slate-50" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1">Employee ID</label>
                <input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none focus:border-[#00a859] bg-slate-50" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1">Password {isEditing && "(optional)"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none focus:border-[#00a859] bg-slate-50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1">Role</label>
                  <CustomSelect
                    options={[{ value: "HOD", label: "HOD" }, { value: "Faculty", label: "Faculty" }]}
                    value={form.role}
                    onChange={(val) => setForm({ ...form, role: val })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-1">Department</label>
                  <CustomSelect
                    options={[{ value: "", label: "Select Dept" }, ...departments.map(d => ({ value: d._id, label: d.departmentName }))]}
                    value={form.departmentId}
                    onChange={(val) => setForm({ ...form, departmentId: val })}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-2xl flex gap-3">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 py-2.5 rounded-xl border bg-white font-bold text-slate-600">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#00a859] text-white font-bold hover:bg-[#008f4c] shadow-lg shadow-[#00a859]/20 disabled:opacity-50">{loading ? "Saving..." : "Save User"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">Delete User?</h3>
            <p className="text-[14px] text-slate-500 mb-6">This action cannot be undone. All evaluation data for this user will be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border py-2.5 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
