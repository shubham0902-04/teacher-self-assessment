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
} from "lucide-react";
import { toast } from "sonner";

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
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        value ? "bg-[#00a651]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          value ? "left-[22px]" : "left-0.5"
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
    } catch {
      // silent
    }
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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111]">Departments</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Each department belongs to a school
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ca1f23] px-5 py-3 font-medium text-white shadow-md transition hover:opacity-95"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="rounded-xl p-3 bg-blue-50 text-blue-600">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <h3 className="text-3xl font-bold text-[#111]">
                {departments.length}
              </h3>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="rounded-xl p-3 bg-green-50 text-[#00a651]">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Departments</p>
              <h3 className="text-3xl font-bold text-[#111]">{activeDepts}</h3>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Search + Filter */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code..."
                className="flex-1 text-sm text-[#111] placeholder:text-gray-400 outline-none bg-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="text-sm text-[#111] border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#ca1f23] bg-white"
            >
              <option value="">All Schools</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.schoolName}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f5f5f7]">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="px-5 py-4">Department Name</th>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">School</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      {search || filterSchool
                        ? "No departments match your filters"
                        : "No departments found — add one above"}
                    </td>
                  </tr>
                ) : (
                  filteredDepts.map((dept) => {
                    const schoolName = getSchoolName(dept);
                    return (
                      <tr
                        key={dept._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4 font-medium text-[#111]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Building2 size={13} className="text-blue-600" />
                            </div>
                            {dept.departmentName}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                            {dept.departmentCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {schoolName ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-[#ca1f23] px-2.5 py-1 rounded-full">
                              <School size={11} />
                              {schoolName}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleStatus(dept)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                              dept.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`h-4 w-8 rounded-full p-0.5 transition ${
                                dept.isActive ? "bg-[#00a651]" : "bg-gray-400"
                              }`}
                            >
                              <span
                                className={`block h-3 w-3 rounded-full bg-white transition-all ${
                                  dept.isActive ? "translate-x-4" : ""
                                }`}
                              />
                            </span>
                            {dept.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(dept)}
                              className="text-gray-400 hover:text-[#ca1f23] transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(dept._id)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredDepts.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredDepts.length} of {departments.length} departments
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold text-[#111]">
                {editingDept ? "Edit Department" : "Add Department"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <form
                id="dept-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* School dropdown */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    School <span className="text-red-500">*</span>
                  </label>
                  {schools.length === 0 ? (
                    <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      No schools found —{" "}
                      <a
                        href="/admin/schools"
                        className="underline font-medium"
                      >
                        create schools first
                      </a>
                    </div>
                  ) : (
                    <select
                      value={form.schoolId}
                      onChange={(e) =>
                        setForm({ ...form, schoolId: e.target.value })
                      }
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
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={form.departmentName}
                    onChange={(e) =>
                      setForm({ ...form, departmentName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Department Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS"
                    value={form.departmentCode}
                    onChange={(e) =>
                      setForm({ ...form, departmentCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] uppercase"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-medium text-[#111]">
                    Active
                  </span>
                  <Toggle
                    value={form.isActive}
                    onChange={() =>
                      setForm({ ...form, isActive: !form.isActive })
                    }
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="submit"
                form="dept-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {submitting
                  ? editingDept
                    ? "Updating..."
                    : "Saving..."
                  : editingDept
                    ? "Update Department"
                    : "Save Department"}
              </button>
              <button
                type="button"
                onClick={closeModal}
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
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#111]">
                Delete Department?
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={17} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Users linked to this department will lose their department
              reference.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition"
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
