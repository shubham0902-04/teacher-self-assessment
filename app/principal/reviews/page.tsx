"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Building2, ClipboardList, Filter } from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import CustomSelect from "@/app/components/ui/CustomSelect";

type Evaluation = {
  _id: string;
  facultyId: { name: string; email: string };
  departmentId: { _id: string; departmentName: string };
  submittedToPrincipalAt?: string;
  status: string;
};

export default function PrincipalPendingReviews() {
  const { academicYear, loaded } = useAcademicYear();
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      try {
        const res = await fetch(`/api/evaluations?academicYear=${academicYear}&status=SUBMITTED_TO_PRINCIPAL`);
        const json = await res.json();
        if (json.success) {
          const all = json.data as Evaluation[];
          setEvals(all.filter(e => e.status === "SUBMITTED_TO_PRINCIPAL"));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [academicYear, loaded]);

  const departments = Array.from(new Set(evals.map(e => e.departmentId?._id)))
    .map(id => evals.find(e => e.departmentId?._id === id)?.departmentId)
    .filter(Boolean);

  const deptOptions = [
    { value: "", label: "All Departments" },
    ...departments.map(d => ({ value: d!._id, label: d!.departmentName }))
  ];

  const filtered = evals.filter(e => {
    const matchSearch = e.facultyId.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.departmentId?._id === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a859] flex items-center justify-center border border-emerald-100 shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pending Reviews</h1>
            <p className="text-[13px] text-slate-500 font-medium">Forwarded by HODs for final approval</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#00a859]">{academicYear}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#00a859] transition shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search faculty..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="bg-transparent outline-none text-[14px] w-full" 
          />
        </div>
        
        <CustomSelect 
          options={deptOptions} 
          value={deptFilter} 
          onChange={setDeptFilter} 
          icon={Filter}
          className="w-full sm:w-64"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" /> 
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-[14px]">No evaluations waiting for your review.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faculty</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Forwarded At</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(e => (
                  <tr key={e._id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00a859] flex items-center justify-center text-[13px] font-bold border border-emerald-100 shadow-sm">
                          {e.facultyId.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-700 leading-tight">{e.facultyId.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{e.facultyId.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                        <Building2 size={12} /> {e.departmentId.departmentName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                      {e.submittedToPrincipalAt ? new Date(e.submittedToPrincipalAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/principal/reviews/${e._id}`} 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a859] text-white text-[13px] font-bold shadow-sm hover:bg-[#008f4c] transition"
                      >
                        Review <span className="opacity-60 text-[10px]">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
