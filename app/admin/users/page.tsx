"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { Trash2, X, UserPlus, Building2, School, Pencil, Eye, EyeOff, Filter, Search, Users } from "lucide-react";
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

const ROLES = ["All", "Admin", "Principal", "HOD", "Faculty", "Chairman"];

const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  Admin: { color: "text-[#e31e24]", bg: "bg-[#e31e24]/10" },
  Principal: { color: "text-purple-600", bg: "bg-purple-50" },
  HOD: { color: "text-blue-600", bg: "bg-blue-50" },
  Faculty: { color: "text-[#00a859]", bg: "bg-[#00a859]/10" },
  Chairman: { color: "text-amber-600", bg: "bg-amber-50" },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", employeeId: "", role: "Faculty", password: "", schoolId: "", departmentId: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    try {
      const [uRes, sRes, dRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/schools"),
        fetch("/api/departments")
      ]);
      const [uData, sData, dData] = await Promise.all([uRes.json(), sRes.json(), dRes.json()]);
      
      if (uData.success) setUsers(uData.data);
      if (sData.success) setSchools(sData.data || []);
      if (dData.success) setAllDepartments(dData.data || []);
    } catch {
      toast.error("Failed to sync data");
    } finally {
      setFetching(false);
    }
  }

  const filteredUsers = users.filter(u => {
    const matchTab = activeTab === "All" || u.role === activeTab;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    
    const uSchoolId = typeof u.schoolId === "object" ? u.schoolId?._id : u.schoolId;
    const uDeptId = typeof u.departmentId === "object" ? u.departmentId?._id : u.departmentId;
    
    const matchSchool = !schoolFilter || uSchoolId === schoolFilter;
    const matchDept = !deptFilter || uDeptId === deptFilter;
    
    return matchTab && matchSearch && matchSchool && matchDept;
  });

  const filteredDepts = allDepartments.filter(d => {
    const dSchoolId = typeof d.schoolId === "object" ? d.schoolId?._id : d.schoolId;
    return !schoolFilter || dSchoolId === schoolFilter;
  });

  // Modal logic (simplified for brevity but functional)
  function openForm(user?: User) {
    if (user) {
      setEditingUser(user);
      const sId = typeof user.schoolId === "object" ? user.schoolId?._id : user.schoolId;
      const dId = typeof user.departmentId === "object" ? user.departmentId?._id : user.departmentId;
      setForm({
        name: user.name, email: user.email, employeeId: user.employeeId || "",
        role: user.role, password: "", schoolId: sId || "", departmentId: dId || ""
      });
    } else {
      setEditingUser(null);
      setForm({ name: "", email: "", employeeId: "", role: "Faculty", password: "", schoolId: "", departmentId: "" });
    }
    setIsFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User saved successfully");
        setIsFormOpen(false);
        loadData();
      } else toast.error(data.message);
    } catch { toast.error("Error saving user"); }
    finally { setLoading(false); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      if ((await res.json()).success) {
        toast.success("User deleted");
        loadData();
      }
    } catch { toast.error("Delete failed"); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 max-w-[1400px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h1>
            <p className="text-[13px] text-slate-500 font-medium">Grouped by roles and institutional hierarchy</p>
          </div>
          <button 
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00a859] text-white rounded-2xl font-bold text-[14px] hover:bg-[#008f4c] transition shadow-lg shadow-[#00a859]/20"
          >
            <UserPlus size={18} />
            Add New User
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => { setActiveTab(role); setSchoolFilter(""); setDeptFilter(""); }}
              className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
                activeTab === role 
                ? "bg-slate-900 text-white shadow-md" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-[#00a859] transition shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="bg-transparent outline-none text-[13px] w-full font-medium" 
            />
          </div>

          {(activeTab === "All" || activeTab === "Principal" || activeTab === "HOD" || activeTab === "Faculty") && (
            <CustomSelect
              options={[{ value: "", label: "All Schools" }, ...schools.map(s => ({ value: s._id, label: s.schoolName }))]}
              value={schoolFilter}
              onChange={setSchoolFilter}
              icon={School}
              className="w-full"
            />
          )}

          {(activeTab === "All" || activeTab === "HOD" || activeTab === "Faculty") && (
            <CustomSelect
              options={[{ value: "", label: "All Departments" }, ...filteredDepts.map(d => ({ value: d._id, label: d.departmentName }))]}
              value={deptFilter}
              onChange={setDeptFilter}
              icon={Building2}
              className="w-full"
            />
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {fetching ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Synchronizing User Directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold text-[14px]">No users match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Institution Detail</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const sName = typeof u.schoolId === "object" ? u.schoolId?.schoolName : schools.find(s => s._id === u.schoolId)?.schoolName;
                    const dName = typeof u.departmentId === "object" ? u.departmentId?.departmentName : allDepartments.find(d => d._id === u.departmentId)?.departmentName;
                    const config = ROLE_CONFIG[u.role] || { color: "text-slate-600", bg: "bg-slate-100" };

                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center font-black text-[15px] border border-current/10 shadow-sm`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[14px] font-black text-slate-800 leading-tight">{u.name}</p>
                              <p className="text-[12px] text-slate-500 font-medium mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-1.5">
                            {sName && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                                <School size={12} /> {sName}
                              </div>
                            )}
                            {dName && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                                <Building2 size={12} /> {dName}
                              </div>
                            )}
                            {!sName && !dName && <span className="text-slate-300 italic text-[12px]">Global Scope</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-wider border border-current/10`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openForm(u)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-[#00a859] transition shadow-sm">
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => setDeleteId(u._id)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition shadow-sm">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">{editingUser ? "Edit User Account" : "Create New Account"}</h3>
                <p className="text-[12px] text-slate-500 font-medium">Configure credentials and institutional access</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-800 transition shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold bg-slate-50 focus:bg-white focus:border-[#00a859] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold bg-slate-50 focus:bg-white focus:border-[#00a859] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Employee ID</label>
                  <input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold bg-slate-50 focus:bg-white focus:border-[#00a859] outline-none transition shadow-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Role Assignment</label>
                  <CustomSelect
                    options={["Admin", "Chairman", "Principal", "HOD", "Faculty"].map(r => ({ value: r, label: r }))}
                    value={form.role}
                    onChange={v => setForm({ ...form, role: v, schoolId: "", departmentId: "" })}
                  />
                </div>
                
                {(form.role === "Principal" || form.role === "HOD" || form.role === "Faculty") && (
                  <div className="col-span-2 p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Institutional School</label>
                      <CustomSelect
                        options={[{ value: "", label: "Select School" }, ...schools.map(s => ({ value: s._id, label: s.schoolName }))]}
                        value={form.schoolId}
                        onChange={v => setForm({ ...form, schoolId: v, departmentId: "" })}
                      />
                    </div>
                    {(form.role === "HOD" || form.role === "Faculty") && (
                      <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Department</label>
                        <CustomSelect
                          options={[{ value: "", label: "Select Dept" }, ...allDepartments.filter(d => (typeof d.schoolId === "object" ? d.schoolId?._id : d.schoolId) === form.schoolId).map(d => ({ value: d._id, label: d.departmentName }))]}
                          value={form.departmentId}
                          onChange={v => setForm({ ...form, departmentId: v })}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Account Password {editingUser && "(Optional)"}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[14px] font-bold bg-slate-50 focus:bg-white focus:border-[#00a859] outline-none transition shadow-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white font-black text-slate-500 hover:bg-slate-100 transition shadow-sm text-[14px]">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-[#00a859] text-white font-black shadow-lg shadow-[#00a859]/20 hover:bg-[#008f4c] transition text-[14px] disabled:opacity-50">
                {loading ? "Processing..." : editingUser ? "Update Profile" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-sm"><Trash2 size={32} /></div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Delete User?</h3>
            <p className="text-[14px] text-slate-500 text-center mb-8 font-medium leading-relaxed">This will permanently remove the account and all associated records.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white font-black text-slate-500 hover:bg-slate-50 transition shadow-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}