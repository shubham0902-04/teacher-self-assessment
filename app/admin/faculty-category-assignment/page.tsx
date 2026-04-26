"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import {
  Search,
  X,
  Save,
  Users,
  CheckSquare,
  Building2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import CustomSelect from "@/app/components/ui/CustomSelect";

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

export default function FacultyCategoryAssignmentPage() {
  const { academicYear } = useAcademicYear();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [facRes, catRes, assRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/categories"),
          fetch("/api/faculty-category-assignments"),
        ]);

        const [facData, catData, assData] = await Promise.all([
          facRes.json(),
          catRes.json(),
          assRes.json(),
        ]);

        if (facData.success) setFaculties(facData.data);
        if (catData.success) setCategories(catData.data);

        if (assData.success) {
          const mapping: Record<string, string[]> = {};
          assData.data.forEach((item: any) => {
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
        if (!updated[f._id].includes(categoryId))
          updated[f._id] = [...updated[f._id], categoryId];
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

  async function saveAll() {
    const payload = Object.keys(selected).map((facultyId) => ({
      facultyId,
      assignedCategories: selected[facultyId],
      academicYear: academicYear,
    }));

    try {
      setSaving(true);
      const res = await fetch("/api/faculty-category-assignments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if ((await res.json()).success)
        toast.success("Assignments saved successfully");
      else toast.error("Save failed");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a859]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
              Category Assignment
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              Academic Year:{" "}
              <span className="text-slate-700 font-bold">{academicYear}</span>
            </p>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-[#00a859] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 transition-all hover:bg-[#008f4c] hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Assignments"}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">
            {faculties.length} faculty
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100">
            {categories.length} categories
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">
            {fullyAssigned} fully assigned
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-[#00a859] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search faculty..."
                className="flex-1 text-[13px] outline-none bg-transparent"
              />
            </div>

            <CustomSelect
              options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({
                  value: d._id,
                  label: d.departmentName,
                })),
              ]}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              icon={Filter}
              className="w-full sm:w-64"
            />
          </div>

          {!loading && categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assign category to all faculty
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => bulkSelectCategory(cat._id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#00a859] hover:text-[#00a859] hover:bg-emerald-50 transition-all shadow-sm"
                  >
                    <CheckSquare size={14} /> {cat.categoryName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-[#00a859]/20 border-t-[#00a859] rounded-full animate-spin mx-auto mb-2" />{" "}
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 text-[11px] font-bold text-slate-400 uppercase border-r">
                      Faculty
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">
                      Department
                    </th>
                    {categories.map((cat) => (
                      <th
                        key={cat._id}
                        className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase"
                      >
                        {cat.categoryName}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase bg-slate-100/50">
                      All
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredFaculties.map((fac) => {
                    const assigned = selected[fac._id]?.length ?? 0;
                    const allDone =
                      assigned === categories.length && categories.length > 0;
                    return (
                      <tr
                        key={fac._id}
                        className="hover:bg-slate-50 transition group"
                      >
                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-600 border">
                              {fac.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-700 text-[13px] leading-tight">
                                {fac.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {assigned}/{categories.length} assigned
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {typeof fac.departmentId === "object" ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100">
                              <Building2 size={12} />{" "}
                              {fac.departmentId?.departmentName}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        {categories.map((cat) => (
                          <td key={cat._id} className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                selected[fac._id]?.includes(cat._id) ?? false
                              }
                              onChange={() => toggleCategory(fac._id, cat._id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#00a859] focus:ring-[#00a859] cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center bg-slate-50/50">
                          <button
                            onClick={() => bulkSelectFaculty(fac._id)}
                            disabled={allDone}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition ${allDone ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-500 hover:border-[#00a859] hover:text-[#00a859]"}`}
                          >
                            {allDone ? "Selected" : "Select All"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
