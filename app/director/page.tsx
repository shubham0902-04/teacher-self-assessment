"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { 
  GraduationCap, 
  Users, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Search,
  School,
  FileText,
  ChevronRight,
  Target,
  Printer,
  Download
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

type Stats = {
  total: number;
  finalized: number;
  avgScore: number | string;
  bySchool: { schoolName: string; count: number; finalized: number; totalScore: number }[];
  topPerformers: { name: string; dept: string; school: string; score: number }[];
  recentSubmissions: { _id: string; facultyName: string; departmentName: string; status: string; submittedAt: string }[];
};

export default function DirectorOverview() {
  const { academicYear, loaded } = useAcademicYear();
  const { userName } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [academicYear, loaded]);

  const barData = (stats?.bySchool || []).map(s => ({
    name: s.schoolName.split(" ").map(w => w[0]).join(""), 
    fullName: s.schoolName,
    Total: s.count,
    Finalized: s.finalized
  }));

  const handlePrint = () => {
    window.open(`/director/reports/print?academicYear=${academicYear}`, '_blank');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#f8fafc] print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          aside, header, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-full-width {
            width: 100% !important;
            grid-column: span 12 / span 12 !important;
          }
          .card {
            border: 1px solid #eee !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">System Overview</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Institutional Analytics</h1>
          <p className="text-[13px] text-slate-500 font-medium">Performance tracking for <span className="text-[#00a859] font-bold">{academicYear}</span></p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={handlePrint}
            className="no-print hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={16} />
            Generate PDF
          </button>
          
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="px-3 py-1 text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Session</p>
              <p className="text-[12px] font-bold text-slate-700 leading-none">{academicYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Evaluations" 
          value={loading ? "..." : stats?.total || 0} 
          icon={FileText} 
          trend="+12%" 
          color="blue"
        />
        <StatCard 
          label="Finalized Forms" 
          value={loading ? "..." : stats?.finalized || 0} 
          icon={CheckCircle2} 
          trend={`${stats ? Math.round((stats.finalized/(stats.total || 1))*100) : 0}% Rate`} 
          color="emerald"
        />
        <StatCard 
          label="Avg Score" 
          value={loading ? "..." : stats?.avgScore || 0} 
          icon={TrendingUp} 
          trend="Top 5%" 
          color="amber"
        />
        <StatCard 
          label="Active Schools" 
          value={loading ? "..." : stats?.bySchool?.length || 0} 
          icon={School} 
          trend="All Active" 
          color="indigo"
        />
      </div>

      {/* Main Charts & Leaderboard Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* School Performance Chart */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-black text-slate-800">School Performance</h3>
              <p className="text-[12px] text-slate-500 font-medium">Submission vs finalization comparison</p>
            </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /> <span className="text-slate-600">Total</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-slate-600">Finalized</span></div>
          </div>
          </div>
          
          <div className="h-[250px] w-full">
            {loading ? (
              <div className="h-full w-full bg-slate-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-white/10">
                            <p className="text-[9px] font-bold text-emerald-400 uppercase mb-0.5">{payload[0].payload.fullName}</p>
                            <p className="text-[12px] font-black">{payload[0].value} Submissions</p>
                            <p className="text-[11px] font-bold text-emerald-400">{payload[1].value} Finalized</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Finalized" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-md font-black text-slate-800">Top Performers</h3>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {loading ? (
              [1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)
            ) : (stats?.topPerformers || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Users size={24} className="text-slate-200 mb-2" />
                <p className="text-slate-400 text-[12px] font-bold">No finalized evaluations</p>
              </div>
            ) : (
              stats?.topPerformers.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black group-hover:bg-emerald-500 transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800 leading-tight">{p.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{p.dept}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black text-[#00a859] leading-none">{p.score}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link href="/director/faculty" className="w-full mt-5 py-2.5 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all uppercase tracking-widest text-center">
            View Ranking System
          </Link>
        </div>
      </div>

      {/* Bottom Section: Recent Submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-md font-black text-slate-800">Recent Activity</h3>
            <p className="text-[12px] text-slate-500 font-medium">Real-time institutional submission feed</p>
          </div>
          <Link href="/director/reports" className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#00a859] hover:bg-emerald-50 transition-all no-print">
            <Search size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Faculty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dept</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-3 text-right no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}><td colSpan={5} className="px-6 py-3"><div className="h-10 bg-slate-50 rounded-lg animate-pulse" /></td></tr>
                ))
              ) : (stats?.recentSubmissions || []).length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">No activity</td></tr>
              ) : (
                stats?.recentSubmissions.map((s) => (
                  <tr key={s._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black border border-emerald-100">
                          {s.facultyName.charAt(0)}
                        </div>
                        <p className="text-[13px] font-bold text-slate-700">{s.facultyName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12px] font-medium text-slate-500">{s.departmentName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        s.status === 'FINALIZED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        s.status.includes('SUBMITTED') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] font-medium text-slate-400">{new Date(s.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-6 py-4 text-right no-print">
                      <Link href={`/director/reports`} className="p-1.5 rounded-md bg-slate-100 text-slate-400 hover:bg-[#00a859] hover:text-white transition-all inline-block">
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between no-print">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Auto-sync active</p>
          <Link href="/director/reports" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View Analytics Feed →</Link>
        </div>
      </div>

    </main>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          <Icon size={18} />
        </div>
        <div className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[8px] font-black text-slate-400 flex items-center gap-0.5 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
          <ArrowUpRight size={8} />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}