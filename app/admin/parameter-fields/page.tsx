"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  _id: string;
  categoryName: string;
};

type Parameter = {
  _id: string;
  parameterName: string;
  categoryId: { _id: string };
};

type Field = {
  _id: string;
  fieldName: string;
  maxMarks: number;
  parameterId: { _id: string };
};

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

  // ---------------- LOAD ----------------

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

  // ---------------- HELPERS ----------------

  function getParams(catId: string) {
    return parameters.filter((p) => p.categoryId._id === catId);
  }

  function getFields(paramId: string) {
    return fields.filter((f) => f.parameterId._id === paramId);
  }

  function toggleCategory(catId: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }

  // total fields count
  const totalFields = fields.length;
  const totalMaxMarks = fields.reduce((sum, f) => sum + f.maxMarks, 0);

  // ---------------- ADD ----------------

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
        toast.success("Criteria added");
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

  // ---------------- DELETE ----------------

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

  // ---------------- UI ----------------

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

          {/* Summary pills */}
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

        {/* LOADING */}
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
            {categories.map((cat) => {
              const catParams = getParams(cat._id);
              const isCollapsed = collapsedCategories.has(cat._id);
              const catFieldCount = catParams.reduce(
                (sum, p) => sum + getFields(p._id).length,
                0,
              );

              return (
                <div
                  key={cat._id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat._id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ca1f23]/10 flex items-center justify-center">
                        <SlidersHorizontal
                          size={15}
                          className="text-[#ca1f23]"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111] text-[15px]">
                          {cat.categoryName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {catParams.length} parameter
                          {catParams.length !== 1 ? "s" : ""} &middot;{" "}
                          {catFieldCount} criteria
                        </p>
                      </div>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown
                        size={16}
                        className="text-gray-400 shrink-0"
                      />
                    ) : (
                      <ChevronUp size={16} className="text-gray-400 shrink-0" />
                    )}
                  </button>

                  {/* Parameters list */}
                  {!isCollapsed && (
                    <div className="border-t border-gray-100 divide-y divide-gray-100">
                      {catParams.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-gray-400 text-center">
                          No parameters under this category
                        </p>
                      ) : (
                        catParams.map((param) => {
                          const paramFields = getFields(param._id);

                          return (
                            <div key={param._id}>
                              {/* Parameter row */}
                              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#ca1f23] shrink-0" />
                                  <span className="text-sm font-medium text-[#111]">
                                    {param.parameterName}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ({paramFields.length} criteria)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setForm({ fieldName: "", maxMarks: 0 });
                                    setActiveParam(param._id);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#ca1f23] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                                >
                                  <Plus size={12} />
                                  Add Criteria
                                </button>
                              </div>

                              {/* Fields table */}
                              {paramFields.length > 0 ? (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-500 font-medium bg-white">
                                      <th className="px-5 py-2.5 text-left">
                                        Criteria Name
                                      </th>
                                      <th className="px-5 py-2.5 text-center w-28">
                                        Max Marks
                                      </th>
                                      <th className="px-5 py-2.5 text-center w-20">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {paramFields.map((f) => (
                                      <tr
                                        key={f._id}
                                        className="hover:bg-gray-50/50 transition"
                                      >
                                        <td className="px-5 py-3 text-[#111]">
                                          {f.fieldName}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                                            {f.maxMarks}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                          <button
                                            onClick={() => setDeleteId(f._id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                            title="Delete"
                                          >
                                            <Trash2 size={14} />
                                          </button>
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

      {/* ADD CRITERIA MODAL */}
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

      {/* DELETE CONFIRM MODAL */}
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
