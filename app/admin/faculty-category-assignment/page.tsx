"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import { Search, X, Save, Users, CheckSquare, Building2 } from "lucide-react";
import { toast } from "sonner";

type Faculty = {
  _id: string;
  name: string;
  departmentId?: { _id: string; departmentName: string } | null;
  schoolId?: { _id: string; schoolName: string } | null;
};

type Category = {
  _id: string;
  categoryName: string;
};

type Assignment = {
  facultyId: string;
  assignedCategories: string[];
  academicYear: string;
};

type AssignmentResponse = {
  success: boolean;
  data: Assignment[];
};

const ACADEMIC_YEAR = "2025-26";

export default function FacultyCategoryAssignmentPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Unique departments from faculties
  const departments = Array.from(
    new Map(
      faculties
        .filter((f) => f.departmentId && typeof f.departmentId === "object")
        .map((f) => {
          const dept = f.departmentId as {
            _id: string;
            departmentName: string;
          };
          return [dept._id, dept];
        }),
    ).values(),
  );

  const filteredFaculties = faculties.filter((fac) => {
    const matchName = fac.name.toLowerCase().includes(search.toLowerCase());
    const deptId =
      typeof fac.departmentId === "object" ? fac.departmentId?._id : null;
    const matchDept = departmentFilter === "" || deptId === departmentFilter;
    return matchName && matchDept;
  });

  const fullyAssigned = faculties.filter(
    (f) =>
      selected[f._id]?.length === categories.length && categories.length > 0,
  ).length;

  // ---------------- LOAD ----------------

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [facRes, catRes, assRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/categories"),
          fetch("/api/faculty-category-assignments"),
        ]);

        const [facData, catData, assData]: [
          { success: boolean; data: Faculty[] },
          { success: boolean; data: Category[] },
          AssignmentResponse,
        ] = await Promise.all([facRes.json(), catRes.json(), assRes.json()]);

        if (facData.success) setFaculties(facData.data);
        if (catData.success) setCategories(catData.data);

        if (assData.success) {
          const mapping: Record<string, string[]> = {};
          assData.data.forEach((item) => {
            mapping[item.facultyId] = item.assignedCategories ?? [];
          });
          setSelected(mapping);
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ---------------- TOGGLE ----------------

  function toggleCategory(facultyId: string, categoryId: string) {
    setSelected((prev) => {
      const facultyCats = prev[facultyId] || [];
      if (facultyCats.includes(categoryId)) {
        return {
          ...prev,
          [facultyId]: facultyCats.filter((c) => c !== categoryId),
        };
      }
      return { ...prev, [facultyId]: [...facultyCats, categoryId] };
    });
  }

  function bulkSelectCategory(categoryId: string) {
    setSelected((prev) => {
      const updated = { ...prev };
      faculties.forEach((f) => {
        if (!updated[f._id]) updated[f._id] = [];
        if (!updated[f._id].includes(categoryId)) {
          updated[f._id] = [...updated[f._id], categoryId];
        }
      });
      return updated;
    });
    toast.success("All faculty assigned to this category");
  }

  function bulkSelectFaculty(facultyId: string) {
    setSelected((prev) => ({
      ...prev,
      [facultyId]: categories.map((c) => c._id),
    }));
  }

  // ---------------- SAVE ----------------

  async function saveAll() {
    const payload = Object.keys(selected).map((facultyId) => ({
      facultyId,
      assignedCategories: selected[facultyId],
      academicYear: ACADEMIC_YEAR,
    }));

    try {
      setSaving(true);
      const res = await fetch("/api/faculty-category-assignments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Assignments saved successfully");
      } else {
        toast.error("Save failed — try again");
      }
    } catch {
      toast.error("Network error — try again");
    } finally {
      setSaving(false);
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
              Faculty Category Assignment
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Academic Year: {ACADEMIC_YEAR}
            </p>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ca1f23] px-5 py-3 font-medium text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Assignments
              </>
            )}
          </button>
        </div>

        {/* STAT PILLS */}
        {!loading && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
              {faculties.length} faculty members
            </span>
            <span className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
              {categories.length} categories
            </span>
            <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
              {fullyAssigned} fully assigned
            </span>
          </div>
        )}

        {/* BULK SELECT */}
        {!loading && categories.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Assign category to all faculty
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => bulkSelectCategory(cat._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-[#ca1f23] hover:text-[#ca1f23] transition shadow-sm"
                >
                  <CheckSquare size={12} />
                  All — {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search faculty by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-[#111] placeholder:text-gray-400 outline-none bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#111] outline-none focus:border-[#ca1f23] shadow-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Loading assignments...
            </div>
          ) : faculties.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No faculty members found — create faculty users first
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f5f5f7]">
                  <tr className="text-left text-sm font-semibold text-gray-600">
                    <th className="px-5 py-4 sticky left-0 bg-[#f5f5f7] z-10">
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        Faculty
                      </div>
                    </th>
                    <th className="px-5 py-4">Department</th>
                    {categories.map((cat) => (
                      <th
                        key={cat._id}
                        className="px-5 py-4 text-center whitespace-nowrap"
                      >
                        {cat.categoryName}
                      </th>
                    ))}
                    <th className="px-5 py-4 text-center">All</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredFaculties.length === 0 ? (
                    <tr>
                      <td
                        colSpan={categories.length + 3}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        No faculty match your search
                      </td>
                    </tr>
                  ) : (
                    filteredFaculties.map((fac) => {
                      const assignedCount = selected[fac._id]?.length ?? 0;
                      const allAssigned =
                        assignedCount === categories.length &&
                        categories.length > 0;
                      const deptName =
                        typeof fac.departmentId === "object"
                          ? fac.departmentId?.departmentName
                          : null;

                      return (
                        <tr
                          key={fac._id}
                          className="hover:bg-gray-50/60 transition"
                        >
                          <td className="px-5 py-3.5 sticky left-0 bg-white hover:bg-gray-50/60 z-10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#ca1f23]/10 flex items-center justify-center text-[11px] font-bold text-[#ca1f23] shrink-0">
                                {fac.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-[#111] text-[13px]">
                                  {fac.name}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {assignedCount}/{categories.length} assigned
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            {deptName ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                                <Building2 size={11} />
                                {deptName}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {categories.map((cat) => {
                            const checked =
                              selected[fac._id]?.includes(cat._id) ?? false;
                            return (
                              <td
                                key={cat._id}
                                className="px-5 py-3.5 text-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleCategory(fac._id, cat._id)
                                  }
                                  className="w-4 h-4 accent-[#ca1f23] cursor-pointer"
                                />
                              </td>
                            );
                          })}

                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => bulkSelectFaculty(fac._id)}
                              disabled={allAssigned}
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg transition ${
                                allAssigned
                                  ? "bg-green-50 text-green-600 cursor-default"
                                  : "bg-gray-100 text-gray-500 hover:bg-[#ca1f23]/10 hover:text-[#ca1f23]"
                              }`}
                            >
                              {allAssigned ? "All" : "Select all"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredFaculties.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredFaculties.length} of {faculties.length} faculty
              members
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
