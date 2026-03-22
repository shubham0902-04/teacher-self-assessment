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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111]">Schools</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage schools — departments are linked to schools
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ca1f23] px-5 py-3 font-medium text-white shadow-md transition hover:opacity-95"
          >
            <Plus size={18} />
            Add School
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="rounded-xl p-3 bg-red-50 text-[#ca1f23]">
              <School size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Schools</p>
              <h3 className="text-3xl font-bold text-[#111]">
                {schools.length}
              </h3>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="rounded-xl p-3 bg-green-50 text-[#00a651]">
              <School size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Schools</p>
              <h3 className="text-3xl font-bold text-[#111]">
                {activeSchools}
              </h3>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
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

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f5f5f7]">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="px-5 py-4">School Name</th>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      Loading schools...
                    </td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      {search
                        ? `No results for "${search}"`
                        : "No schools found — add one above"}
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr
                      key={school._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 font-medium text-[#111]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <School size={13} className="text-[#ca1f23]" />
                          </div>
                          {school.schoolName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {school.schoolCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(school)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            school.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-4 w-8 rounded-full p-0.5 transition ${
                              school.isActive ? "bg-[#00a651]" : "bg-gray-400"
                            }`}
                          >
                            <span
                              className={`block h-3 w-3 rounded-full bg-white transition-all ${
                                school.isActive ? "translate-x-4" : ""
                              }`}
                            />
                          </span>
                          {school.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(school)}
                            className="text-gray-400 hover:text-[#ca1f23] transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(school._id)}
                            className="text-gray-400 hover:text-red-500 transition"
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
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredSchools.length} of {schools.length} schools
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
                {editingSchool ? "Edit School" : "Add School"}
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
                id="school-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School of Engineering"
                    value={form.schoolName}
                    onChange={(e) =>
                      setForm({ ...form, schoolName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    School Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOE"
                    value={form.schoolCode}
                    onChange={(e) =>
                      setForm({ ...form, schoolCode: e.target.value })
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
                form="school-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {submitting
                  ? editingSchool
                    ? "Updating..."
                    : "Saving..."
                  : editingSchool
                    ? "Update School"
                    : "Save School"}
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
                Delete School?
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={17} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This will also affect all departments linked to this school.
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
