"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Building2, CheckCircle2 } from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";

type Evaluation = {
  _id: string;
  facultyId: { name: string; email: string };
  departmentId: { _id: string; departmentName: string };
  updatedAt: string;
  status: string;
};

export default function PrincipalCompletedReviews() {
  const { academicYear, loaded } = useAcademicYear();
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loaded) return;
    async function load() {
      try {
        const res = await fetch(`/api/evaluations?academicYear=${academicYear}&status=FINALIZED`);
        const json = await res.json();
        if (json.success) {
          const all = json.data as Evaluation[];
          setEvals(all.filter(e => e.status === "FINALIZED"));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [academicYear, loaded]);

  const filtered = evals.filter(e => e.facultyId.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex-1 overflow-y-auto px-5 sm:px-8 py-8 space-y-6 max-w-[1200px] mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm"><CheckCircle2 size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Completed Reviews</h1>
              <p className="text-[13px] text-slate-500 font-medium">History of all finalized evaluation forms</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-emerald-500 transition shadow-sm flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-[14px] w-full" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" /> Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-[14px]">No finalized evaluations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faculty</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Finalized At</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(e => (
                    <tr key={e._id} className="hover:bg-slate-50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[13px] font-bold border border-slate-200 shadow-sm">{e.facultyId.name.charAt(0)}</div>
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
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">{new Date(e.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/principal/reviews/${e._id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition">View Full</Link>
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
