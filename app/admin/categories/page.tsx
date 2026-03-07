"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Grid2x2,
  LayoutDashboard,
  ListChecks,
  Pencil,
  Search,
  Settings,
  Trash2,
  UserCircle2,
  Users,
  X,
  Plus,
  FileText,
} from "lucide-react";

type Category = {
  _id: string;
  categoryName: string;
  categoryCode: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        alert(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while fetching categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((item) => {
      return (
        item.categoryName.toLowerCase().includes(q) ||
        item.categoryCode.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    });
  }, [categories, search]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const totalParameters = 0; // later connect with /api/parameters

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
    value: CategoryForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.categoryName.trim()) {
      alert("Category Name is required");
      return;
    }

    if (!form.categoryCode.trim()) {
      alert("Category Code is required");
      return;
    }

    try {
      setSubmitting(true);

      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";

      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
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
        alert(data.message || "Operation failed");
        return;
      }

      closeModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this category?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed");
        return;
      }

      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting");
    }
  }

  async function handleToggleStatus(category: Category) {
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
        alert(data.message || "Status update failed");
        return;
      }

      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating status");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#111]">
      <div className="flex">
        <aside className="hidden min-h-screen w-[290px] border-r border-gray-200 bg-white lg:block">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ca1f23] text-white shadow-md">
              <ListChecks size={24} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold leading-6">
                Teacher Self
                <br />
                Assessment System
              </h1>
            </div>
          </div>

          <nav className="mt-4 space-y-2 px-3">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarItem
              active
              icon={<Grid2x2 size={20} />}
              label="Categories Management"
            />
            <SidebarItem icon={<ListChecks size={20} />} label="Parameters Management" />
            <SidebarItem icon={<Users size={20} />} label="Faculty Category Assignment" />
            <SidebarItem icon={<FileText size={20} />} label="Reports" />
            <SidebarItem icon={<Settings size={20} />} label="Settings" />
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div />
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 md:flex md:w-[320px]">
                <Search size={20} className="text-gray-500" />
                <input
                  placeholder="Search"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <Bell size={20} className="text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gray-200 p-2">
                  <UserCircle2 size={20} className="text-gray-600" />
                </div>
                <span className="font-medium">Admin</span>
              </div>
            </div>
          </header>

          <div className="p-6">
            <h2 className="mb-6 text-4xl font-bold tracking-tight">
              Evaluation Categories
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <StatCard
                title="Total Categories"
                value={totalCategories}
                icon={<Grid2x2 size={22} />}
                bg="bg-red-50"
                iconColor="text-[#ca1f23]"
              />
              <StatCard
                title="Active Categories"
                value={activeCategories}
                icon={<LayoutDashboard size={22} />}
                bg="bg-green-50"
                iconColor="text-[#00a651]"
              />
              <StatCard
                title="Total Parameters"
                value={totalParameters}
                icon={<ListChecks size={22} />}
                bg="bg-emerald-50"
                iconColor="text-[#00a651]"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full max-w-md">
                  <h3 className="mb-3 text-2xl font-bold">
                    Search Categories: Category
                  </h3>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-3">
                    <Search size={20} className="text-gray-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search Categories"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ca1f23] px-5 py-3 font-medium text-white shadow-md transition hover:opacity-95"
                >
                  <Plus size={18} />
                  Add Category
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#f5f5f7]">
                      <tr className="text-left text-sm font-semibold text-gray-700">
                        <th className="px-5 py-4">Category Name</th>
                        <th className="px-5 py-4">Category Code</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4">Display Order</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-8 text-center text-gray-500"
                          >
                            Loading categories...
                          </td>
                        </tr>
                      ) : filteredCategories.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-8 text-center text-gray-500"
                          >
                            No categories found
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((category) => (
                          <tr
                            key={category._id}
                            className="border-t border-gray-200 text-sm"
                          >
                            <td className="px-5 py-4 font-medium">
                              {category.categoryName}
                            </td>
                            <td className="px-5 py-4">{category.categoryCode}</td>
                            <td className="px-5 py-4">
                              {category.description || "-"}
                            </td>
                            <td className="px-5 py-4">{category.displayOrder}</td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleToggleStatus(category)}
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                                  category.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                <span
                                  className={`h-5 w-10 rounded-full p-0.5 transition ${
                                    category.isActive
                                      ? "bg-[#00a651]"
                                      : "bg-gray-400"
                                  }`}
                                >
                                  <span
                                    className={`block h-4 w-4 rounded-full bg-white transition ${
                                      category.isActive ? "translate-x-5" : ""
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
                                  className="text-gray-600 transition hover:text-[#ca1f23]"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(category._id)}
                                  className="text-gray-600 transition hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category Name
                </label>
                <input
                  type="text"
                  value={form.categoryName}
                  onChange={(e) =>
                    handleInputChange("categoryName", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category Code
                </label>
                <input
                  type="text"
                  value={form.categoryCode}
                  onChange={(e) =>
                    handleInputChange("categoryCode", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) =>
                    handleInputChange("displayOrder", Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#ca1f23]"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="font-medium">Active</span>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("isActive", !form.isActive)
                  }
                  className={`relative h-7 w-14 rounded-full transition ${
                    form.isActive ? "bg-[#00a651]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      form.isActive ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#ca1f23] px-4 py-3 font-medium text-white transition hover:opacity-95 disabled:opacity-50"
                >
                  {submitting
                    ? editingCategory
                      ? "Updating..."
                      : "Saving..."
                    : editingCategory
                    ? "Update"
                    : "Save"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-lg transition ${
        active
          ? "bg-red-50 font-medium text-[#ca1f23]"
          : "text-gray-800 hover:bg-gray-50"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
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
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-4 ${bg} ${iconColor}`}>{icon}</div>
        <div>
          <p className="text-2xl font-medium">{title}</p>
          <h3 className="text-4xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}