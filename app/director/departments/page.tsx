"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  ArrowUpDown, 
  School,
  FileBarChart,
  ChevronRight,
  Target,
  ArrowUpRight,
  Printer
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type DeptStats = {
  departmentName: string;
  schoolName: string;
  count: number;
  finalized: number;
  avgScore: number;
};

export default function DepartmentalDataPage() {
  const { academicYear, loaded } = useAcademicYear();
  const [departments, setDepartments] = useState<DeptStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [sortBy, setSortBy] = useState("count");

  useEffect(() => {
    if (!loaded) return;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) setDepartments(json.data.byDepartment || []);
      } catch (err) {
        toast.error("Failed to load department data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [academicYear, loaded]);

  const uniqueSchools = useMemo(() => {
    return Array.from(new Set(departments.map(d => d.schoolName)));
  }, [departments]);

  const filteredAndSorted = useMemo(() => {
    let result = departments.filter(d => 
      d.departmentName.toLowerCase().includes(search.toLowerCase()) &&
      (!schoolFilter || d.schoolName === schoolFilter)
    );
    
    result.sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      if (sortBy === "finalized") return b.finalized - a.finalized;
      return 0;
    });

    return result;
  }, [departments, search, schoolFilter, sortBy]);

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#f8fafc]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Granular Analysis</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Departmental Data</h1>
          <p className="text-[13px] text-slate-500 font-medium">Cross-institutional department performance comparison</p>
        </div>
        <button 
          onClick={() => window.open(`/director/reports/print?academicYear=${academicYear}`, '_blank')}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
        >
          <Printer size={14} />
          Official PDF
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-[#00a859] transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search department..." 
            className="flex-1 text-[13px] font-bold outline-none bg-transparent placeholder:text-slate-500" 
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <CustomSelect
            options={[{ value: "", label: "All Schools" }, ...uniqueSchools.map(s => ({ value: s, label: s }))]}
            value={schoolFilter}
            onChange={setSchoolFilter}
            icon={School}
            className="w-full md:w-56"
          />
          <CustomSelect
            options={[
              { value: "count", label: "Sort by Submissions" },
              { value: "finalized", label: "Sort by Completion" },
            ]}
            value={sortBy}
            onChange={setSortBy}
            icon={ArrowUpDown}
            className="w-full md:w-56"
          />
        </div>
      </div>

      {/* Dept Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">School</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Submissions</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Finalized</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Progress</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={6} className="px-6 py-3"><div className="h-10 bg-slate-50 rounded-xl animate-pulse" /></td></tr>
                ))
              ) : filteredAndSorted.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold">No data found.</td></tr>
              ) : (
                filteredAndSorted.map((dept, idx) => {
                  const completionPct = Math.round((dept.finalized / (dept.count || 1)) * 100);
                  return (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                            <Building2 size={16} />
                          </div>
                          <p className="text-[13px] font-bold text-slate-800">{dept.departmentName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wider">
                          {dept.schoolName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-[14px] font-black text-slate-700">{dept.count}</td>
                      <td className="px-6 py-4 text-center text-[14px] font-black text-emerald-600">{dept.finalized}</td>
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-slate-800">{completionPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/director/reports?dept=${encodeURIComponent(dept.departmentName)}`}
                          className="p-1.5 rounded-md bg-slate-100 text-slate-400 hover:bg-[#00a859] hover:text-white transition-all inline-block"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
