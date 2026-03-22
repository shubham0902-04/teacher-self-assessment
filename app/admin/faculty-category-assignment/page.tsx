"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";

type Faculty = {
  _id: string;
  name: string;
  department: string;
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

export default function FacultyCategoryAssignmentPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const academicYear = "2025-26";
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const filteredFaculties = faculties.filter((fac) => {
    const matchName = fac.name.toLowerCase().includes(search.toLowerCase());
    const matchDept =
      departmentFilter === "" || fac.department === departmentFilter;
    return matchName && matchDept;
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Faculties
        const facRes = await fetch("/api/faculties");
        const facData = await facRes.json();

        if (facData.success) {
          setFaculties(facData.data);
        }

        // Categories
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();

        if (catData.success) {
          setCategories(catData.data);
        }

        // Assignments
        const assRes = await fetch("/api/faculty-category-assignments");
        const assData: AssignmentResponse = await assRes.json();

        if (assData.success) {
          const mapping: Record<string, string[]> = {};

          assData.data.forEach((item) => {
            mapping[item.facultyId] = item.assignedCategories ?? [];
          });

          setSelected(mapping);
        }
      } catch (error) {
        console.error("Load data error:", error);
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

      return {
        ...prev,
        [facultyId]: [...facultyCats, categoryId],
      };
    });
  }

  function bulkSelect(categoryId: string) {
    const updated: Record<string, string[]> = { ...selected };

    faculties.forEach((f) => {
      if (!updated[f._id]) {
        updated[f._id] = [];
      }

      if (!updated[f._id].includes(categoryId)) {
        updated[f._id].push(categoryId);
      }
    });

    setSelected(updated);
  }

  async function saveAll() {
    const payload = Object.keys(selected).map((facultyId) => ({
      facultyId,
      assignedCategories: selected[facultyId],
      academicYear,
    }));

    try {
      const res = await fetch("/api/faculty-category-assignments/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Assignments Saved Successfully");
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8">Faculty Category Assignment</h1>

        {/* Bulk Select */}
        <div className="mb-6 flex gap-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => bulkSelect(cat._id)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              Select All {cat.categoryName}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {Array.from(new Set(faculties.map((f) => f.department))).map(
              (dept,index) => (
                <option key={dept + index} value={dept}>
                  {dept}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Faculty</th>
                <th className="p-4 text-left font-semibold">Department</th>
                {categories.map((cat) => (
                  <th key={cat._id} className="p-4 text-center font-semibold">
                    {cat.categoryName}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredFaculties.map((fac) => (
                <tr key={fac._id} className="border-t">
                  <td className="p-4 font-medium">{fac.name}</td>
                  <td className="p-4 font-medium">{fac.department}</td>
                  {categories.map((cat) => {
                    const checked =
                      selected[fac._id]?.includes(cat._id) ?? false;

                    return (
                      <td key={cat._id} className="text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(fac._id, cat._id)}
                          className="w-4 h-4 accent-[#ca1f23]"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={saveAll}
          className="mt-6 bg-[#ca1f23] hover:bg-[#a81a1d] text-white px-6 py-3 rounded-lg shadow"
        >
          Save All Assignments
        </button>
      </div>
    </div>
  );
}
