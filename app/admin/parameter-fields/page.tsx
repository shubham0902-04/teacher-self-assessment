"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useEffect, useState } from "react";

type Category = {
  _id: string;
  categoryName: string;
};

type Parameter = {
  _id: string;
  parameterName: string;
  categoryId: {
    _id: string;
  };
};

type Field = {
  _id: string;
  fieldName: string;
  maxMarks: number;
  parameterId: {
    _id: string;
  };
};

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  const [activeParam, setActiveParam] = useState<string | null>(null);

  const [form, setForm] = useState({
    fieldName: "",
    maxMarks: 0,
  });

  // ---------------- LOAD ----------------

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, paramRes, fieldRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/parameters"),
          fetch("/api/parameter-fields"),
        ]);

        const catData = await catRes.json();
        const paramData = await paramRes.json();
        const fieldData = await fieldRes.json();

        if (catData.success) setCategories(catData.data);
        if (paramData.success) setParameters(paramData.data);
        if (fieldData.success) setFields(fieldData.data);
      } catch (err) {
        console.error("Load error:", err);
      }
    }

    fetchData();
  }, []);

  async function loadFields() {
    const res = await fetch("/api/parameter-fields");
    const data = await res.json();
    if (data.success) setFields(data.data);
  }

  // ---------------- GROUP ----------------

  function getParams(catId: string) {
    return parameters.filter((p) => p.categoryId._id === catId);
  }

  function getFields(paramId: string) {
    return fields.filter((f) => f.parameterId._id === paramId);
  }

  // ---------------- ADD ----------------

  async function addField() {
    if (!activeParam) return;

    const res = await fetch("/api/parameter-fields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        parameterId: activeParam,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setForm({ fieldName: "", maxMarks: 0 });
      setActiveParam(null);
      loadFields(); // 🔥 reload
    }
  }

  // ---------------- DELETE ----------------

  async function deleteField(id: string) {
    await fetch(`/api/parameter-fields/${id}`, {
      method: "DELETE",
    });

    loadFields();
  }

  // ---------------- UI ----------------

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] text-[#111]">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Parameter Criteria Management
        </h1>

        {categories.map((cat) => (
          <div key={cat._id} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {cat.categoryName}
            </h2>

            {getParams(cat._id).map((param) => (
              <div
                key={param._id}
                className="bg-white rounded-lg shadow-sm border mb-5"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <span className="font-medium">{param.parameterName}</span>

                  <button
                    onClick={() => setActiveParam(param._id)}
                    className="bg-[#ca1f23] text-white px-3 py-1 rounded text-sm"
                  >
                    + Add Criteria
                  </button>
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Criteria</th>
                      <th className="p-3 text-center">Marks</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {getFields(param._id).map((f) => (
                      <tr key={f._id} className="border-t">
                        <td className="p-3">{f.fieldName}</td>
                        <td className="p-3 text-center">{f.maxMarks}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteField(f._id)}
                            className="text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {getFields(param._id).length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center p-4 text-gray-400"
                        >
                          No Criteria added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}

        {/* MODAL */}
        {activeParam && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[380px]">
              <h2 className="font-semibold mb-4">Add Criteria</h2>

              <input
                placeholder="Criteria Name"
                value={form.fieldName}
                onChange={(e) =>
                  setForm({ ...form, fieldName: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
              />

              <input
                type="number"
                placeholder="Max Marks"
                value={form.maxMarks}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxMarks: Number(e.target.value),
                  })
                }
                className="w-full mb-4 p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveParam(null)}
                  className="border px-3 py-1 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={addField}
                  className="bg-[#ca1f23] text-white px-4 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
