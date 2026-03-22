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
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#111]">
            Evaluation Categories
          </h1>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ca1f23] px-5 py-3 font-medium text-white shadow-md transition hover:opacity-95"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Categories"
            value={totalCategories}
            icon={<Grid2x2 size={20} />}
            bg="bg-red-50"
            iconColor="text-[#ca1f23]"
          />
          <StatCard
            title="Active Categories"
            value={activeCategories}
            icon={<LayoutDashboard size={20} />}
            bg="bg-green-50"
            iconColor="text-[#00a651]"
          />
          <StatCard
            title="Total Parameters"
            value={totalParameters}
            icon={<ListChecks size={20} />}
            bg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        {/* TABLE CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code or description..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f5f5f7]">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="px-5 py-4">Category Name</th>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-400"
                    >
                      {search
                        ? `No results for "${search}"`
                        : "No categories found — add one above"}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 font-medium text-[#111]">
                        {category.categoryName}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {category.categoryCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-[200px] truncate">
                        {category.description || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {category.displayOrder}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-4 w-8 rounded-full p-0.5 transition ${
                              category.isActive ? "bg-[#00a651]" : "bg-gray-400"
                            }`}
                          >
                            <span
                              className={`block h-3 w-3 rounded-full bg-white transition-all ${
                                category.isActive ? "translate-x-4" : ""
                              }`}
                            />
                          </span>
                          {category.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-gray-400 hover:text-[#ca1f23] transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteId(category._id)}
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

          {/* Footer count */}
          {!loading && filteredCategories.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredCategories.length} of {totalCategories}{" "}
              categories
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold text-[#111]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">
              <form
                id="category-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Teaching Quality"
                    value={form.categoryName}
                    onChange={(e) =>
                      handleInputChange("categoryName", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Category Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TEACH"
                    value={form.categoryCode}
                    onChange={(e) =>
                      handleInputChange("categoryCode", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] uppercase"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this category..."
                    value={form.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] resize-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#111]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) =>
                      handleInputChange("displayOrder", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-medium text-[#111]">
                    Active
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
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                type="submit"
                form="category-form"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {submitting
                  ? editingCategory
                    ? "Updating..."
                    : "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Save Category"}
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

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#111]">
                Delete Category?
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
      <div className={`rounded-xl p-3 ${bg} ${iconColor}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-[#111]">{value}</h3>
      </div>
    </div>
  );
}
