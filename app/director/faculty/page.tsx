"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  School,
  Building2,
  Trophy,
  ChevronRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  Printer
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type Performer = {
  evaluationId: string;
  name: string;
  dept: string;
  school: string;
  score: number;
};

export default function FacultyRankingPage() {
  const { academicYear, loaded } = useAcademicYear();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    if (!loaded) return;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) setPerformers(json.data.topPerformers || []);
      } catch (err) {
        toast.error("Failed to load faculty rankings");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [academicYear, loaded]);

  const uniqueSchools = useMemo(() => Array.from(new Set(performers.map(p => p.school))), [performers]);
  const uniqueDepts = useMemo(() => Array.from(new Set(performers.filter(p => !schoolFilter || p.school === schoolFilter).map(p => p.dept))), [performers, schoolFilter]);

  const filtered = useMemo(() => {
    return performers.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (!schoolFilter || p.school === schoolFilter) &&
      (!deptFilter || p.dept === deptFilter)
    );
  }, [performers, search, schoolFilter, deptFilter]);

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#f8fafc]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Leaderboard</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Faculty Ranking</h1>
          <p className="text-[13px] text-slate-500 font-medium">Recognizing excellence across all academic units</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open(`/director/reports/print?academicYear=${academicYear}`, '_blank')}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Printer size={14} />
            Generate Rankings PDF
          </button>
          
          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <Award className="text-[#00a859]" size={20} />
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider leading-none mb-0.5">Top Score</p>
              <p className="text-[16px] font-black text-slate-800 leading-none">{performers[0]?.score || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-[#00a859] transition-all">
          <Search size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search faculty name..." 
            className="flex-1 text-[13px] font-bold outline-none bg-transparent placeholder:text-slate-500" 
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <CustomSelect
            options={[{ value: "", label: "All Schools" }, ...uniqueSchools.map(s => ({ value: s, label: s }))]}
            value={schoolFilter}
            onChange={(val) => { setSchoolFilter(val); setDeptFilter(""); }}
            icon={School}
            className="w-full md:w-52"
          />
          <CustomSelect
            options={[{ value: "", label: "All Departments" }, ...uniqueDepts.map(d => ({ value: d, label: d }))]}
            value={deptFilter}
            onChange={setDeptFilter}
            icon={Building2}
            className="w-full md:w-52"
          />
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {loading ? (
          [1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold">No results found.</div>
        ) : (
          filtered.map((p, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm group hover:border-[#00a859] hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-md font-black transition-all ${
                  idx === 0 ? "bg-amber-100 text-amber-600 border border-amber-200 shadow-sm shadow-amber-200/50" :
                  idx === 1 ? "bg-slate-100 text-slate-500 border border-slate-200" :
                  idx === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" :
                  "bg-slate-50 text-slate-400 border border-slate-100"
                }`}>
                  {idx < 3 ? <Trophy size={18} /> : idx + 1}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1">
                  <div className="min-w-[180px]">
                    <h3 className="text-[14px] font-black text-slate-800 leading-tight group-hover:text-[#00a859] transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp size={10} className="text-emerald-500" />
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Global Rank #{idx + 1}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5">
                      <School size={10} />
                      <span className="text-[9px] font-black uppercase tracking-wider">{p.school}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1.5">
                      <Building2 size={10} />
                      <span className="text-[9px] font-black uppercase tracking-wider">{p.dept}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pl-4 md:border-l border-slate-100">
                <div className="text-center min-w-[60px]">
                  <p className="text-[20px] font-black text-slate-800 leading-none">{p.score}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-wider">Score</p>
                </div>
                <Link 
                  href={`/director/faculty/view/${p.evaluationId}`}
                  className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-white hover:bg-[#00a859] transition-all flex items-center justify-center"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
