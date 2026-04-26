"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  School, 
  Search, 
  ArrowUpDown, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  ChevronRight,
  LayoutGrid,
  Download,
  Printer
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type SchoolStats = {
  schoolName: string;
  count: number;
  finalized: number;
  totalScore: number;
};

export default function SchoolAnalysisPage() {
  const { academicYear, loaded } = useAcademicYear();
  const [schools, setSchools] = useState<SchoolStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("count"); 

  useEffect(() => {
    if (!loaded) return;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) setSchools(json.data.bySchool || []);
      } catch (err) {
        toast.error("Failed to load school data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [academicYear, loaded]);

  const filteredAndSorted = useMemo(() => {
    let result = schools.filter(s => s.schoolName.toLowerCase().includes(search.toLowerCase()));
    
    result.sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      if (sortBy === "finalized") return b.finalized - a.finalized;
      if (sortBy === "score") return (b.totalScore / (b.finalized || 1)) - (a.totalScore / (a.finalized || 1));
      return 0;
    });

    return result;
  }, [schools, search, sortBy]);

  const exportCSV = () => {
    if (schools.length === 0) return;
    const headers = ["School Name", "Submissions", "Finalized", "Avg Score"];
    const rows = schools.map(s => [
      s.schoolName, 
      s.count, 
      s.finalized, 
      (s.totalScore / (s.finalized || 1)).toFixed(1)
    ]);
    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `School_Stats_${academicYear}.csv`;
    link.click();
    toast.success("School stats exported");
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#f8fafc]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Performance Benchmarking</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">School Analysis</h1>
          <p className="text-[13px] text-slate-500 font-medium">Comparing institutions across <span className="text-[#00a859] font-bold">{schools.length} Schools</span></p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button 
            onClick={() => window.open(`/director/reports/print?academicYear=${academicYear}`, '_blank')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-[12px] font-bold shadow-sm transition-all hover:bg-slate-800"
          >
            <Printer size={14} />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-[#00a859] transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search school name..." 
            className="flex-1 text-[13px] font-bold outline-none bg-transparent placeholder:text-slate-500" 
          />
        </div>
        
        <CustomSelect
          options={[
            { value: "count", label: "Sort by Submissions" },
            { value: "finalized", label: "Sort by Completion" },
            { value: "score", label: "Sort by Avg Score" },
          ]}
          value={sortBy}
          onChange={setSortBy}
          icon={ArrowUpDown}
          className="w-full lg:w-64"
        />
      </div>

      {/* School Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-[180px] bg-white rounded-2xl animate-pulse" />)
        ) : filteredAndSorted.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold">No results found.</div>
        ) : (
          filteredAndSorted.map((school, idx) => {
            const avgScore = school.finalized > 0 ? (school.totalScore / school.finalized).toFixed(1) : 0;
            const completionPct = Math.round((school.finalized / (school.count || 1)) * 100);

            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:border-[#00a859] hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-[#00a859] group-hover:text-white transition-all">
                      <School size={22} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-black text-slate-800 leading-tight mb-1">{school.schoolName}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Rank #{idx + 1}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/director/reports?school=${encodeURIComponent(school.schoolName)}`}
                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#00a859] hover:bg-emerald-50 transition-all flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Submissions</p>
                    <p className="text-[15px] font-black text-slate-700">{school.count}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Finalized</p>
                    <p className="text-[15px] font-black text-[#00a859]">{school.finalized}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Avg Score</p>
                    <p className="text-[15px] font-black text-amber-500">{avgScore}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                    <p className="text-[11px] font-black text-slate-800">{completionPct}%</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-[#00a859] rounded-full transition-all duration-1000" 
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
