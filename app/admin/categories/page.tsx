"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Grid2x2,
  LayoutDashboard,
  ListChecks,
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
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

type CategoryForm = {
  categoryName: string;
  categoryCode: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
};

const initialForm: CategoryForm = {
  categoryName: "",
  categoryCode: "",
  description: "",
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [totalParameters, setTotalParameters] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ---------------- FETCH ----------------

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch {
      toast.error("Something went wrong while fetching categories");
    } finally {
      setLoading(false);
    }
  }

  async function fetchParametersCount() {
    try {
      const res = await fetch("/api/parameters", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setTotalParameters(data.data.length);
    } catch {
      // silent fail — not critical
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchParametersCount();
  }, []);

  // ---------------- FILTER ----------------

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (item) =>
        item.categoryName.toLowerCase().includes(q) ||
        item.categoryCode.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  // ---------------- MODAL ----------------

  function openAddModal() {
    setEditingCategory(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setForm({
      categoryName: category.categoryName,
      categoryCode: category.categoryCode,
      description: category.description || "",
      displayOrder: category.displayOrder || 1,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
  }

  function handleInputChange<K extends keyof CategoryForm>(
    key: K,
    value: CategoryForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ---------------- SUBMIT ----------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.categoryName.trim())
      return toast.error("Category Name is required");
    if (!form.categoryCode.trim())
      return toast.error("Category Code is required");

    try {
      setSubmitting(true);
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: form.categoryName.trim(),
          categoryCode: form.categoryCode.trim().toUpperCase(),
          description: form.description.trim(),
          displayOrder: Number(form.displayOrder),
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(editingCategory ? "Category updated" : "Category created");
      closeModal();
      fetchCategories();
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
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== deleteId));
    } catch {
      toast.error("Something went wrong while deleting");
    } finally {
      setDeleteId(null);
    }
  }

  // ---------------- TOGGLE STATUS ----------------

  async function handleToggleStatus(category: Category) {
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: category.categoryName,
          categoryCode: category.categoryCode,
          description: category.description || "",
          displayOrder: category.displayOrder,
          isActive: !category.isActive,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Status update failed");
        return;
      }
      fetchCategories();
    } catch {
      toast.error("Something went wrong while updating status");
    }
  }

  // ---------------- UI ----------------

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
              Evaluation Categories
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">Manage primary self-assessment categories</p>
          </div>
          <button
            onClick={openAddModal}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Categories"
            value={totalCategories}
            icon={<Grid2x2 size={20} />}
            bg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatCard
            title="Active Categories"
            value={activeCategories}
            icon={<LayoutDashboard size={20} />}
            bg="bg-[#00a859]/10"
            iconColor="text-[#00a859]"
          />
          <StatCard
            title="Total Parameters"
            value={totalParameters}
            icon={<ListChecks size={20} />}
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
              placeholder="Search by name, code or description..."
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
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Order</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin" />
                        <span className="text-[13px] font-medium">Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <Grid2x2 size={20} className="text-slate-300" />
                        </div>
                        <span className="text-[13px] font-medium">
                          {search ? `No results for "${search}"` : "No categories found — add one above"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700 text-[13px]">
                        {category.categoryName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md">
                          {category.categoryCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 max-w-[200px] truncate font-medium">
                        {category.description || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-500 text-center">
                        {category.displayOrder}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition border ${
                            category.isActive
                              ? "bg-[#00a859]/10 text-[#00a859] border-[#00a859]/20 hover:bg-[#00a859]/20"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-[#00a859]" : "bg-slate-400"}`} />
                          {category.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-1.5 text-slate-400 hover:text-[#00a859] hover:bg-[#00a859]/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(category._id)}
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

          {/* Footer count */}
          {!loading && filteredCategories.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
              Showing {filteredCategories.length} of {totalCategories} categories
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">
              <form
                id="category-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Category Name <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Teaching Quality"
                    value={form.categoryName}
                    onChange={(e) =>
                      handleInputChange("categoryName", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Category Code <span className="text-[#e31e24]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TEACH"
                    value={form.categoryCode}
                    onChange={(e) =>
                      handleInputChange("categoryCode", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this category..."
                    value={form.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 bg-slate-50">
                  <span className="text-[13px] font-bold text-slate-700">
                    Active Status
                  </span>
                  <Toggle
                    value={form.isActive}
                    onChange={() =>
                      handleInputChange("isActive", !form.isActive)
                    }
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
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
                form="category-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#00a859] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition hover:bg-[#008f4c] disabled:opacity-50"
              >
                {submitting
                  ? editingCategory
                    ? "Updating..."
                    : "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Save Category"}
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
              Delete Category?
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              This action is permanent and cannot be undone. All parameters associated with this category may be affected.
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
