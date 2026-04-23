"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { School, Search, Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

type SchoolType = {
  _id: string;
  schoolName: string;
  schoolCode: string;
  isActive: boolean;
};

type SchoolForm = {
  schoolName: string;
  schoolCode: string;
  isActive: boolean;
};

const initialForm: SchoolForm = {
  schoolName: "",
  schoolCode: "",
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

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [form, setForm] = useState<SchoolForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchSchools() {
    try {
      setLoading(true);
      const res = await fetch("/api/schools");
      const data = await res.json();
      if (data.success) setSchools(data.data || []);
      else toast.error(data.message || "Failed to fetch schools");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.schoolName.toLowerCase().includes(q) ||
        s.schoolCode.toLowerCase().includes(q),
    );
  }, [schools, search]);

  const activeSchools = schools.filter((s) => s.isActive).length;

  function openAddModal() {
    setEditingSchool(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(school: SchoolType) {
    setEditingSchool(school);
    setForm({
      schoolName: school.schoolName,
      schoolCode: school.schoolCode,
      isActive: school.isActive,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingSchool(null);
    setForm(initialForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.schoolName.trim()) return toast.error("School name is required");
    if (!form.schoolCode.trim()) return toast.error("School code is required");

    try {
      setSubmitting(true);
      const url = editingSchool
        ? `/api/schools/${editingSchool._id}`
        : "/api/schools";
      const method = editingSchool ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: form.schoolName.trim(),
          schoolCode: form.schoolCode.trim().toUpperCase(),
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(editingSchool ? "School updated" : "School created");
      closeModal();
      fetchSchools();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/schools/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("School deleted");
      setSchools((prev) => prev.filter((s) => s._id !== deleteId));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggleStatus(school: SchoolType) {
    try {
      const res = await fetch(`/api/schools/${school._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: school.schoolName,
          schoolCode: school.schoolCode,
          isActive: !school.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Status update failed");
        return;
      }
      fetchSchools();
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Schools</h1>
            <p className="text-[13px] text-slate-500 font-medium">
              Manage schools — departments are linked to schools
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add School
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="rounded-xl p-3.5 bg-indigo-50 text-indigo-500">
              <School size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                {schools.length}
              </h3>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Schools</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="rounded-xl p-3.5 bg-[#00a859]/10 text-[#00a859]">
              <School size={24} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                {activeSchools}
              </h3>
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Active Schools</p>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code..."
              className="flex-1 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">School Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
                        <span className="text-[13px] font-medium">Loading schools...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <School size={20} className="text-slate-300" />
                        </div>
                        <span className="text-[13px] font-medium">
                          {search
                            ? `No results for "${search}"`
                            : "No schools found — add one above"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100">
                            <School size={14} className="text-indigo-500" />
                          </div>
                          {school.schoolName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md">
                          {school.schoolCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(school)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition border ${
                            school.isActive
                              ? "bg-[#00a859]/10 text-[#00a859] border-[#00a859]/20 hover:bg-[#00a859]/20"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${school.isActive ? "bg-[#00a859]" : "bg-slate-400"}`} />
                          {school.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(school)}
                            className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-[#00a859]/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(school._id)}
                            className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-[#e31e24]/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredSchools.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
              Showing {filteredSchools.length} of {schools.length} schools
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
                {editingSchool ? "Edit School" : "Add School"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <form
                id="school-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    School Name <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School of Engineering"
                    value={form.schoolName}
                    onChange={(e) =>
                      setForm({ ...form, schoolName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    School Code <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOE"
                    value={form.schoolCode}
                    onChange={(e) =>
                      setForm({ ...form, schoolCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 bg-slate-50">
                  <span className="text-[13px] font-bold text-slate-700">
                    Active Status
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

            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="school-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#00a859] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50"
              >
                {submitting
                  ? editingSchool
                    ? "Updating..."
                    : "Saving..."
                  : editingSchool
                    ? "Update School"
                    : "Save School"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#e31e24]/10 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-[#e31e24]" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">
              Delete School?
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              This will also affect all departments linked to this school. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-[#e31e24] py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#e31e24]/20 hover:bg-[#c9181f] transition"
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
