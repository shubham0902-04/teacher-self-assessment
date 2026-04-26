"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import {
  Building2,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  School,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type SchoolType = {
  _id: string;
  schoolName: string;
  schoolCode: string;
};

type Department = {
  _id: string;
  departmentName: string;
  departmentCode: string;
  isActive: boolean;
  schoolId?: { _id: string; schoolName: string; schoolCode: string } | string;
};

type DepartmentForm = {
  departmentName: string;
  departmentCode: string;
  schoolId: string;
  isActive: boolean;
};

const initialForm: DepartmentForm = {
  departmentName: "",
  departmentCode: "",
  schoolId: "",
  isActive: true,
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a859] ${
        value ? "bg-[#00a859]" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchDepartments() {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success) setDepartments(data.data || []);
      else toast.error(data.message || "Failed to fetch departments");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSchools() {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (data.success) setSchools(data.data || []);
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchDepartments();
    fetchSchools();
  }, []);

  const filteredDepts = useMemo(() => {
    return departments.filter((d) => {
      const schoolName =
        typeof d.schoolId === "object" ? (d.schoolId?.schoolName ?? "") : "";
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        d.departmentName.toLowerCase().includes(q) ||
        d.departmentCode.toLowerCase().includes(q) ||
        schoolName.toLowerCase().includes(q);

      const schoolId =
        typeof d.schoolId === "object" ? d.schoolId?._id : d.schoolId;
      const matchSchool = !filterSchool || schoolId === filterSchool;

      return matchSearch && matchSchool;
    });
  }, [departments, search, filterSchool]);

  const activeDepts = departments.filter((d) => d.isActive).length;

  function getSchoolName(dept: Department) {
    if (!dept.schoolId) return null;
    if (typeof dept.schoolId === "object") return dept.schoolId.schoolName;
    const found = schools.find((s) => s._id === dept.schoolId);
    return found?.schoolName ?? null;
  }

  function openAddModal() {
    setEditingDept(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(dept: Department) {
    setEditingDept(dept);
    setForm({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      schoolId:
        typeof dept.schoolId === "object"
          ? (dept.schoolId?._id ?? "")
          : (dept.schoolId ?? ""),
      isActive: dept.isActive,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingDept(null);
    setForm(initialForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.departmentName.trim())
      return toast.error("Department name is required");
    if (!form.departmentCode.trim())
      return toast.error("Department code is required");
    if (!form.schoolId) return toast.error("School is required");

    try {
      setSubmitting(true);
      const url = editingDept
        ? `/api/departments/${editingDept._id}`
        : "/api/departments";
      const method = editingDept ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentName: form.departmentName.trim(),
          departmentCode: form.departmentCode.trim().toUpperCase(),
          schoolId: form.schoolId,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(editingDept ? "Department updated" : "Department created");
      closeModal();
      fetchDepartments();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/departments/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("Department deleted");
      setDepartments((prev) => prev.filter((d) => d._id !== deleteId));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggleStatus(dept: Department) {
    const schoolId =
      typeof dept.schoolId === "object" ? dept.schoolId?._id : dept.schoolId;
    try {
      const res = await fetch(`/api/departments/${dept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentName: dept.departmentName,
          departmentCode: dept.departmentCode,
          schoolId,
          isActive: !dept.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Status update failed");
        return;
      }
      fetchDepartments();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Departments</h1>
            <p className="text-[13px] text-slate-500 font-medium">Manage all departments and their assigned schools</p>
          </div>
          <button
            onClick={openAddModal}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Department
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="rounded-xl p-3.5 bg-blue-50 text-blue-500"><Building2 size={24} /></div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">{departments.length}</h3>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Departments</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="rounded-xl p-3.5 bg-[#00a859]/10 text-[#00a859]"><Building2 size={24} /></div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">{activeDepts}</h3>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Active Departments</p>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-[#00a859] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments..."
                className="flex-1 text-[13px] text-slate-800 outline-none bg-transparent font-medium"
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"><X size={15} /></button>}
            </div>
            
            <CustomSelect
              options={[{ value: "", label: "All Schools" }, ...schools.map(s => ({ value: s._id, label: s.schoolName }))]}
              value={filterSchool}
              onChange={setFilterSchool}
              icon={Filter}
              className="w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">School</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin mx-auto mb-2" /> Loading...</td></tr>
                ) : filteredDepts.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400 text-[13px] font-medium">No departments found.</td></tr>
                ) : (
                  filteredDepts.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center border border-blue-100"><Building2 size={14} className="text-blue-500" /></div>
                          {dept.departmentName}
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md">{dept.departmentCode}</span></td>
                      <td className="px-6 py-4">
                        {getSchoolName(dept) ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-2.5 py-1 rounded-md">
                            <School size={12} /> {getSchoolName(dept)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleStatus(dept)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase transition border ${dept.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {dept.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(dept)} className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-emerald-50 rounded-lg"><Pencil size={16} /></button>
                          <button onClick={() => setDeleteId(dept._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{editingDept ? "Edit Department" : "Add Department"}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">School <span className="text-red-500">*</span></label>
                <CustomSelect
                  options={[{ value: "", label: "Select School" }, ...schools.map(s => ({ value: s._id, label: s.schoolName }))]}
                  value={form.schoolId}
                  onChange={v => setForm({ ...form, schoolId: v })}
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">Department Name <span className="text-red-500">*</span></label>
                <input value={form.departmentName} onChange={e => setForm({...form, departmentName: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-[#00a859] bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">Department Code <span className="text-red-500">*</span></label>
                <input value={form.departmentCode} onChange={e => setForm({...form, departmentCode: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-[#00a859] bg-slate-50 focus:bg-white uppercase font-mono" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 bg-slate-50">
                <span className="text-[13px] font-bold text-slate-700">Active Status</span>
                <Toggle value={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-2xl flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border bg-white font-bold text-slate-600">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-[#00a859] text-white font-bold shadow-lg shadow-[#00a859]/20 disabled:opacity-50">{submitting ? "Saving..." : "Save Dept"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-6 text-center">Delete Department?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border py-2.5 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
