"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import {
  ListChecks,
  LayoutDashboard,
  ShieldCheck,
  Pencil,
  Search,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  _id: string;
  categoryName: string;
  categoryCode: string;
};

type Parameter = {
  _id: string;
  categoryId:
    | string
    | { _id: string; categoryName: string; categoryCode: string };
  parameterName: string;
  parameterCode: string;
  description?: string;
  maxMarks: number;
  allowMultipleEntries: boolean;
  evidenceRequired: boolean;
  displayOrder: number;
  isActive: boolean;
};

type ParameterForm = {
  categoryId: string;
  parameterName: string;
  parameterCode: string;
  description: string;
  maxMarks: number;
  allowMultipleEntries: boolean;
  evidenceRequired: boolean;
  displayOrder: number;
  isActive: boolean;
};

const initialForm: ParameterForm = {
  categoryId: "",
  parameterName: "",
  parameterCode: "",
  description: "",
  maxMarks: 0,
  allowMultipleEntries: true,
  evidenceRequired: false,
  displayOrder: 1,
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

export default function AdminParametersPage() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(
    null,
  );
  const [form, setForm] = useState<ParameterForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  }

  async function fetchParameters() {
    try {
      setLoading(true);
      const res = await fetch("/api/parameters", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setParameters(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch parameters");
      }
    } catch {
      toast.error("Something went wrong while fetching parameters");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchParameters();
  }, []);

  const filteredParameters = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? parameters.filter((item) => {
          const categoryName =
            typeof item.categoryId === "object"
              ? item.categoryId.categoryName
              : "";
          return (
            item.parameterName.toLowerCase().includes(q) ||
            item.parameterCode.toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q) ||
            categoryName.toLowerCase().includes(q)
          );
        })
      : parameters;

    return [...filtered].sort((a, b) => {
      const catA =
        typeof a.categoryId === "object" ? a.categoryId.categoryName : "";
      const catB =
        typeof b.categoryId === "object" ? b.categoryId.categoryName : "";
      if (catA < catB) return -1;
      if (catA > catB) return 1;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [parameters, search]);

  const totalParameters = parameters.length;
  const activeParameters = parameters.filter((p) => p.isActive).length;
  const evidenceRequiredCount = parameters.filter(
    (p) => p.evidenceRequired,
  ).length;

  function openAddModal() {
    setEditingParameter(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(parameter: Parameter) {
    setEditingParameter(parameter);
    setForm({
      categoryId:
        typeof parameter.categoryId === "object"
          ? parameter.categoryId._id
          : parameter.categoryId,
      parameterName: parameter.parameterName,
      parameterCode: parameter.parameterCode,
      description: parameter.description || "",
      maxMarks: parameter.maxMarks || 0,
      allowMultipleEntries: parameter.allowMultipleEntries,
      evidenceRequired: parameter.evidenceRequired,
      displayOrder: parameter.displayOrder || 1,
      isActive: parameter.isActive,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingParameter(null);
    setForm(initialForm);
  }

  function handleInputChange<K extends keyof ParameterForm>(
    key: K,
    value: ParameterForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.categoryId) return toast.error("Please select a category");
    if (!form.parameterName.trim())
      return toast.error("Parameter Name is required");
    if (!form.parameterCode.trim())
      return toast.error("Parameter Code is required");

    try {
      setSubmitting(true);
      const url = editingParameter
        ? `/api/parameters/${editingParameter._id}`
        : "/api/parameters";
      const method = editingParameter ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: form.categoryId,
          parameterName: form.parameterName.trim(),
          parameterCode: form.parameterCode.trim().toUpperCase(),
          description: form.description.trim(),
          maxMarks: Number(form.maxMarks),
          allowMultipleEntries: form.allowMultipleEntries,
          evidenceRequired: form.evidenceRequired,
          displayOrder: Number(form.displayOrder),
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(
        editingParameter ? "Parameter updated" : "Parameter created",
      );
      closeModal();
      fetchParameters();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/parameters/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("Parameter deleted");
      setParameters((prev) => prev.filter((p) => p._id !== deleteId));
    } catch {
      toast.error("Something went wrong while deleting");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggleStatus(parameter: Parameter) {
    const categoryId =
      typeof parameter.categoryId === "object"
        ? parameter.categoryId._id
        : parameter.categoryId;
    try {
      const res = await fetch(`/api/parameters/${parameter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          parameterName: parameter.parameterName,
          parameterCode: parameter.parameterCode,
          description: parameter.description || "",
          maxMarks: parameter.maxMarks,
          allowMultipleEntries: parameter.allowMultipleEntries,
          evidenceRequired: parameter.evidenceRequired,
          displayOrder: parameter.displayOrder,
          isActive: !parameter.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Status update failed");
        return;
      }
      fetchParameters();
    } catch {
      toast.error("Something went wrong while updating status");
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
              Evaluation Parameters
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">Define parameters and their properties within each category</p>
          </div>
          <button
            onClick={openAddModal}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Parameter
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Parameters"
            value={totalParameters}
            icon={<ListChecks size={20} />}
            bg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatCard
            title="Active Parameters"
            value={activeParameters}
            icon={<LayoutDashboard size={20} />}
            bg="bg-[#00a859]/10"
            iconColor="text-[#00a859]"
          />
          <StatCard
            title="Evidence Required"
            value={evidenceRequiredCount}
            icon={<ShieldCheck size={20} />}
            bg="bg-amber-50"
            iconColor="text-amber-500"
          />
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code or category..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Parameter Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Max Marks</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Multi Entry</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Evidence</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Order</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
                        <span className="text-[13px] font-medium">Loading parameters...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredParameters.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <ListChecks size={20} className="text-slate-300" />
                        </div>
                        <span className="text-[13px] font-medium">
                          {search ? `No results for "${search}"` : "No parameters found — add one above"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredParameters.map((parameter) => {
                    const category =
                      typeof parameter.categoryId === "object"
                        ? parameter.categoryId.categoryName
                        : "-";

                    return (
                      <tr key={parameter._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold bg-blue-50 border border-blue-100/50 text-blue-600 px-2.5 py-1 rounded-md">
                            {category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700 text-[13px]">
                          {parameter.parameterName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md">
                            {parameter.parameterCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-600 text-center">
                          {parameter.maxMarks > 0 ? parameter.maxMarks : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            parameter.allowMultipleEntries
                              ? "bg-[#00a859]/5 text-[#00a859] border-[#00a859]/20"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {parameter.allowMultipleEntries ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            parameter.evidenceRequired
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>
                            {parameter.evidenceRequired ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-500 text-center">
                          {parameter.displayOrder}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(parameter)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition border ${
                              parameter.isActive
                                ? "bg-[#00a859]/10 text-[#00a859] border-[#00a859]/20 hover:bg-[#00a859]/20"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${parameter.isActive ? "bg-[#00a859]" : "bg-slate-400"}`} />
                            {parameter.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(parameter)}
                              className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-[#00a859]/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(parameter._id)}
                              className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-[#e31e24]/10 rounded-lg transition"
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

          {/* Footer count */}
          {!loading && filteredParameters.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
              Showing {filteredParameters.length} of {totalParameters} parameters
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
                {editingParameter ? "Edit Parameter" : "Add Parameter"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto px-6 py-5">
              <form
                id="parameter-form"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                {/* Category */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Category <span className="text-[#e31e24]">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      handleInputChange("categoryId", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parameter Name */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Parameter Name <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lectures Delivered"
                    value={form.parameterName}
                    onChange={(e) =>
                      handleInputChange("parameterName", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Parameter Code */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Parameter Code <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TEACH-01"
                    value={form.parameterCode}
                    onChange={(e) =>
                      handleInputChange("parameterCode", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white uppercase font-mono"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this parameter..."
                    value={form.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

                {/* Max Marks */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxMarks}
                    onChange={(e) =>
                      handleInputChange("maxMarks", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) =>
                      handleInputChange("displayOrder", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-[14px] outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Multiple Entries",
                      key: "allowMultipleEntries" as const,
                      value: form.allowMultipleEntries,
                    },
                    {
                      label: "Evidence Req.",
                      key: "evidenceRequired" as const,
                      value: form.evidenceRequired,
                    },
                    {
                      label: "Active Status",
                      key: "isActive" as const,
                      value: form.isActive,
                    },
                  ].map((toggle) => (
                    <div
                      key={toggle.key}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 bg-slate-50"
                    >
                      <span className="text-[13px] font-bold text-slate-700">
                        {toggle.label}
                      </span>
                      <Toggle
                        value={toggle.value}
                        onChange={() =>
                          handleInputChange(toggle.key, !toggle.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Modal footer */}
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
                form="parameter-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#00a859] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50"
              >
                {submitting
                  ? editingParameter
                    ? "Updating..."
                    : "Saving..."
                  : editingParameter
                    ? "Update Parameter"
                    : "Save Parameter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#e31e24]/10 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-[#e31e24]" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">
              Delete Parameter?
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              This action is permanent and cannot be undone. Any data tied to this parameter may be orphaned.
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

function StatCard({
  title,
  value,
  icon,
  bg,
  iconColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`rounded-xl p-3.5 ${bg} ${iconColor}`}>{icon}</div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-1">{value}</h3>
        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
