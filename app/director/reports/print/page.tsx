"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PrintReportContent() {
  const searchParams = useSearchParams();
  const academicYear = searchParams.get("academicYear");
  const school = searchParams.get("school");
  const dept = searchParams.get("dept");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/evaluations/stats?academicYear=${academicYear}`);
        const json = await res.json();
        if (json.success) {
          let list = json.data.topPerformers || [];
          if (school) list = list.filter((r: any) => r.school === school);
          if (dept) list = list.filter((r: any) => r.dept === dept);
          
          setData({
            list,
            stats: {
              total: json.data.total,
              finalized: json.data.finalized,
              avgScore: json.data.avgScore
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        // Automatically trigger print after loading
        setTimeout(() => window.print(), 1000);
      }
    }
    fetchData();
  }, [academicYear, school, dept]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
      <span className="ml-3 font-bold text-slate-600">Generating Official Report...</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-10 font-serif text-slate-900 printable-document">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 2cm; }
        }
        .printable-document {
          max-width: 1000px;
          margin: 0 auto;
        }
      `}</style>

      {/* Institutional Letterhead */}
      <div className="border-b-4 border-emerald-600 pb-6 mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800">FACULTY EVALUATE</h1>
          <p className="text-sm font-bold text-emerald-600 tracking-widest uppercase mt-1">Institutional Performance Division</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Serial</p>
          <p className="text-lg font-black text-slate-700">#REP-{new Date().getTime().toString().slice(-6)}</p>
        </div>
      </div>

      {/* Report Title */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Performance Summary Report</h2>
        <div className="flex gap-10 mt-4 text-sm font-medium text-slate-500">
          <p>Academic Session: <span className="text-slate-800 font-bold">{academicYear}</span></p>
          <p>Generated On: <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
        </div>
      </div>

      {/* Scope Details */}
      {(school || dept) && (
        <div className="bg-slate-50 p-6 rounded-2xl mb-10 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Scope</p>
          <div className="grid grid-cols-2 gap-8">
            {school && (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase">School / Institution</p>
                <p className="text-md font-black text-slate-800">{school}</p>
              </div>
            )}
            {dept && (
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase">Department / Unit</p>
                <p className="text-md font-black text-slate-800">{dept}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="border-2 border-slate-100 p-6 rounded-3xl text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Evaluations</p>
          <p className="text-3xl font-black text-slate-800">{data.stats.total}</p>
        </div>
        <div className="border-2 border-slate-100 p-6 rounded-3xl text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completed Forms</p>
          <p className="text-3xl font-black text-emerald-600">{data.stats.finalized}</p>
        </div>
        <div className="border-2 border-slate-100 p-6 rounded-3xl text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Score</p>
          <p className="text-3xl font-black text-amber-500">{data.stats.avgScore}</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mb-16">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b pb-2">Detailed Faculty Performance</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th className="p-4 border-b">Faculty Name</th>
              <th className="p-4 border-b">Department</th>
              <th className="p-4 border-b">School</th>
              <th className="p-4 border-b text-center">Final Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.list.map((row: any, idx: number) => (
              <tr key={idx} className="text-[13px]">
                <td className="p-4 font-bold text-slate-800">{row.name}</td>
                <td className="p-4 font-medium text-slate-600">{row.dept}</td>
                <td className="p-4 font-medium text-slate-600">{row.school}</td>
                <td className="p-4 text-center font-black text-slate-900">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      <div className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-2 gap-20">
        <div className="text-center">
          <div className="w-48 h-px bg-slate-300 mx-auto mb-3" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
          <p className="text-xs font-bold text-slate-700 mt-1">Dean / Principal</p>
        </div>
        <div className="text-center">
          <div className="w-48 h-px bg-slate-300 mx-auto mb-3" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Verification</p>
          <p className="text-xs font-bold text-slate-700 mt-1">Institutional Director</p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Confidential - Internal Use Only</p>
      </div>

      <button 
        onClick={() => window.print()}
        className="no-print fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-2"
      >
        <Printer size={18} /> Print Now
      </button>
    </div>
  );
}

function Printer({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}

export default function DirectorPrintReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintReportContent />
    </Suspense>
  );
}
