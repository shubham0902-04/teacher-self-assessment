"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { toast } from "sonner";

type Category = { _id: string; categoryName: string; categoryCode: string };
type Parameter = {
  _id: string;
  parameterName: string;
  parameterCode: string;
  maxMarks: number;
  categoryId: { _id: string };
};
type Field = {
  _id: string;
  fieldName: string;
  maxMarks: number;
  parameterId: { _id: string };
};

const CAT_COLORS = [
  {
    bg: "bg-blue-50/50 hover:bg-blue-50",
    border: "border-blue-200/60",
    icon: "bg-blue-100/50",
    iconText: "text-blue-600",
    badge: "bg-blue-100/50 border border-blue-200/50 text-blue-700",
    dot: "bg-blue-500",
    marks: "text-blue-600",
  },
  {
    bg: "bg-purple-50/50 hover:bg-purple-50",
    border: "border-purple-200/60",
    icon: "bg-purple-100/50",
    iconText: "text-purple-600",
    badge: "bg-purple-100/50 border border-purple-200/50 text-purple-700",
    dot: "bg-purple-500",
    marks: "text-purple-600",
  },
  {
    bg: "bg-[#00a859]/5 hover:bg-[#00a859]/10",
    border: "border-[#00a859]/20",
    icon: "bg-[#00a859]/10",
    iconText: "text-[#00a859]",
    badge: "bg-[#00a859]/10 border border-[#00a859]/20 text-[#00a859]",
    dot: "bg-[#00a859]",
    marks: "text-[#00a859]",
  },
  {
    bg: "bg-amber-50/50 hover:bg-amber-50",
    border: "border-amber-200/60",
    icon: "bg-amber-100/50",
    iconText: "text-amber-600",
    badge: "bg-amber-100/50 border border-amber-200/50 text-amber-700",
    dot: "bg-amber-500",
    marks: "text-amber-600",
  },
];

export default function ParameterFieldsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fieldName: "", maxMarks: 0 });

  const [editField, setEditField] = useState<Field | null>(null);
  const [editForm, setEditForm] = useState({ fieldName: "", maxMarks: 0 });
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catRes, paramRes, fieldRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/parameters"),
          fetch("/api/parameter-fields"),
        ]);
        const [catData, paramData, fieldData] = await Promise.all([
          catRes.json(),
          paramRes.json(),
          fieldRes.json(),
        ]);
        if (catData.success) setCategories(catData.data);
        if (paramData.success) setParameters(paramData.data);
        if (fieldData.success) setFields(fieldData.data);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function loadFields() {
    const res = await fetch("/api/parameter-fields");
    const data = await res.json();
    if (data.success) setFields(data.data);
  }

  const getParams = (catId: string) =>
    parameters.filter((p) => p.categoryId._id === catId);
  const getFields = (paramId: string) =>
    fields.filter((f) => f.parameterId._id === paramId);

  function toggleCategory(catId: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  const totalFields = fields.length;
  const totalMaxMarks = categories.reduce(
    (sum, cat) =>
      sum + getParams(cat._id).reduce((s, p) => s + (p.maxMarks || 0), 0),
    0,
  );

  async function addField() {
    if (!activeParam) return;
    if (!form.fieldName.trim()) return toast.error("Criteria name is required");
    try {
      setSubmitting(true);
      const res = await fetch("/api/parameter-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parameterId: activeParam }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Criteria added successfully");
        setForm({ fieldName: "", maxMarks: 0 });
        setActiveParam(null);
        loadFields();
      } else {
        toast.error(data.message || "Failed to add criteria");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(f: Field) {
    setEditField(f);
    setEditForm({ fieldName: f.fieldName, maxMarks: f.maxMarks });
  }

  async function saveEdit() {
    if (!editField) return;
    if (!editForm.fieldName.trim())
      return toast.error("Criteria name is required");
    try {
      setEditSubmitting(true);
      const res = await fetch(`/api/parameter-fields/${editField._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Criteria updated successfully");
        setEditField(null);
        loadFields();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/parameter-fields/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Criteria deleted");
        setFields((prev) => prev.filter((f) => f._id !== deleteId));
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
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
              Parameter Criteria
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              Manage scoring criteria for each evaluation parameter
            </p>
          </div>
          {!loading && (
            <div className="relative z-10 hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Criteria</span>
                <span className="text-[18px] font-bold text-indigo-600 leading-tight">{totalFields}</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</span>
                <span className="text-[18px] font-bold text-[#00a859] leading-tight">{totalMaxMarks}</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
            <span className="text-[13px] font-medium">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-[13px] font-medium">
            No categories found — create categories first
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat, catIdx) => {
              const color = CAT_COLORS[catIdx % CAT_COLORS.length];
              const catParams = getParams(cat._id);
              const isCollapsed = collapsedCategories.has(cat._id);
              const catFieldCount = catParams.reduce(
                (sum, p) => sum + getFields(p._id).length,
                0,
              );
              const catTotalMarks = catParams.reduce(
                (sum, p) => sum + (p.maxMarks || 0),
                0,
              );

              return (
                <div
                  key={cat._id}
                  className={`rounded-2xl border ${color.border} bg-white shadow-sm overflow-hidden transition-all`}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat._id)}
                    className={`w-full flex items-center justify-between px-6 py-5 ${color.bg} transition-colors text-left group`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`${color.icon} w-12 h-12 flex items-center justify-center rounded-xl shrink-0 shadow-sm transition-transform group-hover:scale-105`}
                      >
                        <span
                          className={`text-[14px] font-bold font-mono ${color.iconText}`}
                        >
                          {cat.categoryCode}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[16px] tracking-tight">
                          {cat.categoryName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[12px] font-medium text-slate-500">
                            {catParams.length} parameter{catParams.length !== 1 ? "s" : ""}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[12px] font-medium text-slate-500">
                            {catFieldCount} criteria
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end mr-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Category Marks</span>
                        <span
                          className={`text-[13px] font-bold px-2.5 py-0.5 rounded-md ${color.badge}`}
                        >
                          {catTotalMarks} / 300
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200/60 text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </div>
                    </div>
                  </button>

                  {/* Parameters */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {catParams.length === 0 ? (
                        <p className="px-6 py-8 text-[13px] font-medium text-slate-400 text-center bg-slate-50/50">
                          No parameters under this category
                        </p>
                      ) : (
                        catParams.map((param, paramIdx) => {
                          const paramFields = getFields(param._id);
                          return (
                            <div key={param._id} className="bg-white hover:bg-slate-50/30 transition-colors">
                              {/* Parameter row */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm ${color.dot}`}
                                  >
                                    {paramIdx + 1}
                                  </span>
                                  <span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md shrink-0">
                                    {param.parameterCode}
                                  </span>
                                  <span className="text-[14px] font-bold text-slate-700 truncate">
                                    {param.parameterName}
                                  </span>
                                  <span className="text-[12px] font-medium text-slate-400 shrink-0">
                                    ({paramFields.length} criteria)
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 sm:ml-4">
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${color.badge}`}
                                  >
                                    Max {param.maxMarks}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setForm({ fieldName: "", maxMarks: 0 });
                                      setActiveParam(param._id);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-700 transition-colors shrink-0"
                                  >
                                    <Plus size={14} />
                                    Add Criteria
                                  </button>
                                </div>
                              </div>

                              {/* Fields table */}
                              {paramFields.length > 0 ? (
                                <div className="px-6 pb-5">
                                  <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50/50">
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-slate-100">
                                          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-12">
                                            #
                                          </th>
                                          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Criteria Name
                                          </th>
                                          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-32">
                                            Max Marks
                                          </th>
                                          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 bg-white">
                                        {paramFields.map((f, fi) => (
                                          <tr
                                            key={f._id}
                                            className="hover:bg-slate-50 transition-colors group"
                                          >
                                            <td className="px-5 py-3 text-[12px] font-bold text-slate-300">
                                              {fi + 1}
                                            </td>
                                            <td className="px-5 py-3 text-[13px] font-medium text-slate-700">
                                              {f.fieldName}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                              <span className="text-[12px] font-bold bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md inline-block min-w-[32px]">
                                                {f.maxMarks}
                                              </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => openEdit(f)}
                                                  className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-[#00a859]/10 rounded-lg transition"
                                                  title="Edit"
                                                >
                                                  <Pencil size={14} />
                                                </button>
                                                <button
                                                  onClick={() => setDeleteId(f._id)}
                                                  className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-[#e31e24]/10 rounded-lg transition"
                                                  title="Delete"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="px-6 pb-4">
                                  <p className="text-[12px] font-medium text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
                                    No criteria added yet
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ADD MODAL */}
      {activeParam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Add Criteria</h3>
              <button
                onClick={() => setActiveParam(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Criteria Name <span className="text-[#e31e24]">*</span>
                </label>
                <input
                  placeholder="e.g. Number of lectures delivered"
                  value={form.fieldName}
                  onChange={(e) =>
                    setForm({ ...form, fieldName: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addField()}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Max Marks
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.maxMarks}
                  onChange={(e) =>
                    setForm({ ...form, maxMarks: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setActiveParam(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={addField}
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#00a859] py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {submitting ? "Saving..." : "Add Criteria"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editField && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Edit Criteria</h3>
              <button
                onClick={() => setEditField(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Criteria Name <span className="text-[#e31e24]">*</span>
                </label>
                <input
                  placeholder="e.g. Number of lectures delivered"
                  value={editForm.fieldName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fieldName: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Max Marks
                </label>
                <input
                  type="number"
                  min={0}
                  value={editForm.maxMarks}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxMarks: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setEditField(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSubmitting}
                className="flex-1 rounded-xl bg-[#00a859] py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                {editSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#e31e24]/10 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-[#e31e24]" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800 mb-1.5">
              Delete Criteria?
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              This action is permanent and cannot be undone. Are you sure you want to remove this criteria?
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
