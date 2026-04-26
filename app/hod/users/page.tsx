"use client";

import { useEffect, useState } from "react";
import { Trash2, X, UserPlus, Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  isActive: boolean;
};

export default function HODUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      toast.error("Failed to load faculty list");
    } finally {
      setLoading(false);
    }
  }

  function openForm(user?: User) {
    if (user) {
      setIsEditing(true);
      setCurrentId(user._id);
      setForm({
        name: user.name,
        email: user.email,
        employeeId: user.employeeId || "",
        password: "",
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setForm({ name: "", email: "", employeeId: "", password: "" });
    }
    setIsFormOpen(true);
    setShowPassword(false);
  }

  function closeForm() {
    setIsFormOpen(false);
    setIsEditing(false);
    setCurrentId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Name and Email are required");
    if (!isEditing && !form.password) return toast.error("Password is required for new users");

    try {
      setLoading(true);
      const url = isEditing ? `/api/users/${currentId}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = { ...form };
      if (isEditing && !payload.password) delete (payload as any).password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEditing ? "Faculty updated" : "Faculty created");
        fetchUsers();
        closeForm();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      if ((await res.json()).success) {
        toast.success("Faculty removed");
        fetchUsers();
        setDeleteId(null);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">Faculty Management</h1>
          <p className="text-[12px] text-slate-500 font-medium">Manage faculty members in your department</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a859] text-white rounded-xl font-bold text-[13px] hover:bg-[#008f4c] transition shadow-sm shadow-[#00a859]/20"
        >
          <UserPlus size={16} />
          Add New Faculty
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" /> Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-[14px]">No faculty members found in your department.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Faculty Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00a859] flex items-center justify-center font-bold text-[14px] border border-emerald-100 shadow-sm">{user.name.charAt(0)}</div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-700 leading-tight">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">{user.employeeId || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openForm(user)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-[#00a859] transition">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteId(user._id)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition">
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
                {isEditing ? "Edit Faculty" : "Add New Faculty"}
              </h3>
              <button onClick={closeForm} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] bg-slate-50 focus:bg-white outline-none focus:border-[#00a859] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] bg-slate-50 focus:bg-white outline-none focus:border-[#00a859] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Employee ID</label>
                  <input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] bg-slate-50 focus:bg-white outline-none focus:border-[#00a859] transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">Password {!isEditing && "*"}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-[14px] bg-slate-50 focus:bg-white outline-none focus:border-[#00a859] transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"><Eye size={16} /></button>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button onClick={closeForm} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" form="user-form" disabled={loading} className="flex-1 rounded-xl bg-[#00a859] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#008f4c] transition disabled:opacity-50">{loading ? "Saving..." : "Save Faculty"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl">
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">Remove Faculty?</h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 bg-white text-slate-600 py-2.5 rounded-xl text-[14px] font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[14px] font-bold shadow-sm hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
