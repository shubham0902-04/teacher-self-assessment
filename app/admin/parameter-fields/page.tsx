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
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-100",
    iconText: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    marks: "text-blue-600",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "bg-purple-100",
    iconText: "text-purple-700",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    marks: "text-purple-600",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "bg-emerald-100",
    iconText: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    marks: "text-emerald-600",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "bg-amber-100",
    iconText: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111]">
              Parameter Criteria
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage scoring criteria for each evaluation parameter
            </p>
          </div>
          {!loading && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                {totalFields} criteria
              </span>
              <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100">
                {totalMaxMarks} total marks
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            Loading...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            No categories found — create categories first
          </div>
        ) : (
          <div className="space-y-5">
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
                  className={`rounded-2xl border-2 ${color.border} bg-white shadow-sm overflow-hidden`}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat._id)}
                    className={`w-full flex items-center justify-between px-5 py-4 ${color.bg} hover:opacity-95 transition text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${color.icon} px-3 py-1.5 rounded-lg shrink-0`}
                      >
                        <span
                          className={`text-xs font-bold font-mono ${color.iconText}`}
                        >
                          {cat.categoryCode}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-[#111] text-[15px]">
                          {cat.categoryName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {catParams.length} parameter
                          {catParams.length !== 1 ? "s" : ""} &middot;{" "}
                          {catFieldCount} criteria &middot;{" "}
                          <span className={`font-semibold ${color.marks}`}>
                            {catTotalMarks} marks
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${color.badge}`}
                      >
                        {catTotalMarks} / 300
                      </span>
                      {isCollapsed ? (
                        <ChevronDown
                          size={16}
                          className="text-gray-500 shrink-0"
                        />
                      ) : (
                        <ChevronUp
                          size={16}
                          className="text-gray-500 shrink-0"
                        />
                      )}
                    </div>
                  </button>

                  {/* Parameters */}
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-100">
                      {catParams.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-gray-400 text-center">
                          No parameters under this category
                        </p>
                      ) : (
                        catParams.map((param, paramIdx) => {
                          const paramFields = getFields(param._id);
                          return (
                            <div key={param._id} className="bg-white">
                              {/* Parameter row */}
                              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-t border-gray-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${color.dot}`}
                                  >
                                    {paramIdx + 1}
                                  </span>
                                  <span className="font-mono text-[11px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md shrink-0">
                                    {param.parameterCode}
                                  </span>
                                  <span className="text-sm font-semibold text-[#111] truncate">
                                    {param.parameterName}
                                  </span>
                                  <span className="text-xs text-gray-400 shrink-0">
                                    ({paramFields.length} criteria)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${color.badge}`}
                                  >
                                    Max {param.maxMarks}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setForm({ fieldName: "", maxMarks: 0 });
                                      setActiveParam(param._id);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#ca1f23] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition shrink-0"
                                  >
                                    <Plus size={12} />
                                    Add Criteria
                                  </button>
                                </div>
                              </div>

                              {/* Fields table */}
                              {paramFields.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-400 font-medium border-b border-gray-100">
                                      <th className="px-5 py-2 text-left w-8">
                                        #
                                      </th>
                                      <th className="px-5 py-2 text-left">
                                        Criteria Name
                                      </th>
                                      <th className="px-5 py-2 text-center w-28">
                                        Max Marks
                                      </th>
                                      <th className="px-5 py-2 text-center w-24">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {paramFields.map((f, fi) => (
                                      <tr
                                        key={f._id}
                                        className="hover:bg-gray-50/50 transition"
                                      >
                                        <td className="px-5 py-3 text-xs text-gray-300">
                                          {fi + 1}
                                        </td>
                                        <td className="px-5 py-3 text-[#111]">
                                          {f.fieldName}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                                            {f.maxMarks}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3">
                                          <div className="flex items-center justify-center gap-3">
                                            <button
                                              onClick={() => openEdit(f)}
                                              className="text-gray-300 hover:text-blue-500 transition"
                                              title="Edit"
                                            >
                                              <Pencil size={14} />
                                            </button>
                                            <button
                                              onClick={() => setDeleteId(f._id)}
                                              className="text-gray-300 hover:text-red-500 transition"
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
                              ) : (
                                <p className="px-5 py-4 text-xs text-gray-400 text-center italic">
                                  No criteria added yet
                                </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#111]">Add Criteria</h3>
              <button
                onClick={() => setActiveParam(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Criteria Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. Number of lectures delivered"
                  value={form.fieldName}
                  onChange={(e) =>
                    setForm({ ...form, fieldName: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addField()}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>
            </div>
            <div className="flex gap-2.5 px-6 pb-6">
              <button
                onClick={() => setActiveParam(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addField}
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#ca1f23] py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                {submitting ? "Saving..." : "Add Criteria"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#111]">Edit Criteria</h3>
              <button
                onClick={() => setEditField(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Criteria Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. Number of lectures delivered"
                  value={editForm.fieldName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fieldName: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                />
              </div>
            </div>
            <div className="flex gap-2.5 px-6 pb-6">
              <button
                onClick={() => setEditField(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSubmitting}
                className="flex-1 rounded-xl bg-[#ca1f23] py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Pencil size={14} />
                {editSubmitting ? "Saving..." : "Save Changes"}
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
                Delete Criteria?
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={17} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This action is permanent and cannot be undone.
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
