"use client";

import { useEffect, useState } from "react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  School as SchoolIcon,
  Users2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Evaluation = {
  _id: string;
  status: string;
  departmentId: { _id: string; departmentName: string };
  schoolId?: { _id: string; schoolName: string };
  categoriesData: any[];
};

type User = {
  _id: string;
  role: string;
};

export default function PrincipalDashboard() {
  const { academicYear, loaded } = useAcademicYear();
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded) return;
    async function loadData() {
      try {
        const [evalRes, userRes] = await Promise.all([
          fetch(`/api/evaluations?academicYear=${academicYear}`),
          fetch("/api/users"),
        ]);
        
        const evalJson = await evalRes.json();
        const userJson = await userRes.json();

        if (evalJson.success) {
          setEvals(evalJson.data);
          const school = evalJson.data[0]?.schoolId?.schoolName;
          if (school) localStorage.setItem("principalSchoolName", school);
        }
        if (userJson.success) setUsers(userJson.data);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [academicYear, loaded]);

  // Calculations
  const stats = {
    totalEvaluations: evals.length,
    pendingReviews: evals.filter(e => e.status === "SUBMITTED_TO_PRINCIPAL").length,
    finalized: evals.filter(e => e.status === "FINALIZED").length,
    totalFaculty: users.filter(u => u.role === "Faculty").length,
    totalHODs: users.filter(u => u.role === "HOD").length,
  };

  // Chart Data: Status Distribution
  const statusData = [
    { name: "Finalized", value: stats.finalized, color: "#10b981" },
    { name: "Pending Principal", value: stats.pendingReviews, color: "#6366f1" },
    { name: "With HOD", value: evals.filter(e => e.status === "SUBMITTED_TO_HOD").length, color: "#f59e0b" },
    { name: "Draft/Returned", value: evals.filter(e => ["DRAFT", "RETURNED_BY_HOD", "RETURNED_BY_PRINCIPAL"].includes(e.status)).length, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  // Chart Data: Dept wise average score (HOD assessed)
  const deptPerformance = Array.from(new Set(evals.map(e => e.departmentId?.departmentName)))
    .filter(Boolean)
    .map(deptName => {
      const deptEvals = evals.filter(e => e.departmentId?.departmentName === deptName);
      const avgScore = deptEvals.reduce((acc: number, curr: any) => {
        const score = curr.categoriesData?.reduce((s: number, cat: any) => 
          s + (cat.parameters?.reduce((ps: number, p: any) => 
            ps + (p.entries?.reduce((es: number, e: any) => 
              es + (e.fields?.reduce((fs: number, f: any) => fs + (Number(f.marks?.hod) || 0), 0) || 0)
            , 0) || 0)
          , 0) || 0)
        , 0) || 0;
        return acc + score;
      }, 0) / (deptEvals.length || 1);
      
      return { name: deptName as string, average: Math.round(avgScore) };
    })
    .sort((a, b) => b.average - a.average);

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-5 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">School Overview</h1>
              <p className="text-[14px] text-slate-500 font-medium">Performance and evaluation analytics</p>
            </div>
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#00a859]">{academicYear}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Pending Your Review" value={stats.pendingReviews} icon={Clock} color="green" />
            <StatCard label="Finalized Forms" value={stats.finalized} icon={CheckCircle2} color="emerald" />
            <StatCard label="Total Faculty" value={stats.totalFaculty} icon={Users} color="blue" />
            <StatCard label="Total HODs" value={stats.totalHODs} icon={SchoolIcon} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dept Performance Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#00a859]" />
                  Dept-wise Average Score
                </h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptPerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="average" fill="#00a859" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#00a859]" />
                  Evaluation Pipeline
                </h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Users2 size={16} className="text-slate-400" />
              <h3 className="text-[14px] font-bold text-slate-800">Quick Department Breakdown</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {deptPerformance.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-[13px]">No department data available yet.</div>
              ) : (
                deptPerformance.map((dept) => (
                  <div key={dept.name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <span className="text-[13px] font-semibold text-slate-700">{dept.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00a859] rounded-full" style={{ width: `${Math.min(100, (dept.average / 500) * 100)}%` }} />
                      </div>
                      <span className="text-[13px] font-bold text-[#00a859]">{dept.average} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
    </main>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}