"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  FileBarChart, 
  Download, 
  Filter, 
  Calendar,
  School,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { useAcademicYear } from "@/app/hooks/useAcademicYear";
import { toast } from "sonner";
import CustomSelect from "@/app/components/ui/CustomSelect";

type ReportData = {
  facultyName: string;
  schoolName: string;
  departmentName: string;
  status: string;
  score: number;
};

export default function PerformanceReportsPage() {
  const { academicYear, loaded } = useAcademicYear();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [schools, setSchools] = useState<string[]>([]);
  const [depts, setDepts] = useState<string[]>([]);

  useEffect(() => {
    if (!loaded) return;
    async function loadFilters() {
      try {
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) {
          setSchools(json.data.bySchool.map((s: any) => s.schoolName));
          setDepts(json.data.byDepartment.map((d: any) => d.departmentName));
        }
      } catch (err) {}
    }
    loadFilters();
  }, [academicYear, loaded]);

  async function generateReport() {
    try {
      setLoading(true);
      const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
      const json = await res.json();
      
      if (json.success) {
        let mapped = (json.data.topPerformers || []).map((p: any) => ({
          facultyName: p.name,
          schoolName: p.school,
          departmentName: p.dept,
          status: "FINALIZED",
          score: p.score
        }));

        if (schoolFilter) mapped = mapped.filter((r: any) => r.schoolName === schoolFilter);
        if (deptFilter) mapped = mapped.filter((r: any) => r.departmentName === deptFilter);

        setData(mapped);
        if (mapped.length > 0) toast.success(`${mapped.length} records compiled`);
        else toast.info("No records match your criteria");
      }
    } catch (err) {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (data.length === 0) return;
    const headers = ["Faculty Name", "School", "Department", "Status", "Score"];
    const rows = data.map(r => [r.facultyName, r.schoolName, r.departmentName, r.status, r.score]);
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Institutional_Report_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Downloaded");
  }

  const handlePrintPDF = () => {
    const url = `/director/reports/print?academicYear=${academicYear}&school=${encodeURIComponent(schoolFilter)}&dept=${encodeURIComponent(deptFilter)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Documentation</h2>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Performance Reports</h1>
          <p className="text-[13px] text-slate-500 font-medium">Generate comprehensive institutional performance sheets</p>
        </div>
      </div>

      {/* Generator Tool */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden report-container">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-md font-black text-slate-800 mb-5 flex items-center gap-2">
            <Filter size={18} className="text-[#00a859]" />
            Report Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider ml-1">Academic Year</label>
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600">
                <Calendar size={14} className="text-slate-400" />
                {academicYear}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider ml-1">Select School</label>
              <CustomSelect
                options={[{ value: "", label: "All Schools" }, ...schools.map(s => ({ value: s, label: s }))]}
                value={schoolFilter}
                onChange={setSchoolFilter}
                icon={School}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider ml-1">Select Department</label>
              <CustomSelect
                options={[{ value: "", label: "All Departments" }, ...depts.map(d => ({ value: d, label: d }))]}
                value={deptFilter}
                onChange={setDeptFilter}
                icon={Building2}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-3 bg-[#00a859] text-white rounded-xl font-black text-[14px] shadow-lg shadow-emerald-500/10 hover:bg-[#008f4c] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileBarChart size={16} />}
              Generate Custom Report
            </button>
          </div>
        </div>

        {/* Results Preview */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-black text-slate-800">Generated Data Preview</h3>
            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrintPDF}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 transition-all"
                >
                  <Printer size={14} />
                  Print Official PDF
                </button>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  Download CSV
                </button>
              </div>
            )}
          </div>

          {data.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                <FileText size={24} className="text-slate-200" />
              </div>
              <p className="text-slate-500 text-[12px] font-bold">Configure filters and generate to view data</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Faculty</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">School</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Department</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-600 uppercase text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-[12px] font-bold text-slate-700">{row.facultyName}</td>
                      <td className="px-5 py-3 text-[11px] font-medium text-slate-500">{row.schoolName}</td>
                      <td className="px-5 py-3 text-[11px] font-medium text-slate-500">{row.departmentName}</td>
                      <td className="px-5 py-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase border border-emerald-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-[13px] font-black text-slate-800">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
