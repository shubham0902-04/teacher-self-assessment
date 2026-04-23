"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#00a859]/20 selection:text-[#00a859]">
      {/* ─── NAVBAR ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00a859] to-[#008f4c] flex items-center justify-center shadow-lg shadow-[#00a859]/20">
              <BarChart3 className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Faculty<span className="text-[#00a859]">Evaluate</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 text-[14px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-[#00a859] text-[14px] font-bold text-white shadow-sm shadow-[#00a859]/20 hover:bg-[#008f4c] hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#00a859]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[#00a859]" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-600">
              Modern Evaluation Platform
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Empowering Faculty <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a859] to-[#008f4c]">
              Through Data & Insights
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-500 mb-10 leading-relaxed font-medium">
            A comprehensive self-assessment and evaluation portal designed to streamline academic appraisals, foster growth, and provide actionable analytics for educational institutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00a859] text-white font-bold text-[16px] shadow-lg shadow-[#00a859]/25 hover:bg-[#008f4c] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Access Portal <ArrowRight size={18} />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200/60 text-slate-700 font-bold text-[16px] hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Everything you need for seamless evaluations
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Built specifically for academic institutions to manage, track, and analyze faculty performance with unparalleled ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-[#00a859]" size={24} />}
              title="Streamlined Workflows"
              description="Automate the entire evaluation process from self-assessment submissions to HOD reviews."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-indigo-500" size={24} />}
              title="Secure & Transparent"
              description="Role-based access ensures data privacy while maintaining transparency throughout the appraisal cycle."
            />
            <FeatureCard
              icon={<BarChart3 className="text-blue-500" size={24} />}
              title="Data-Driven Insights"
              description="Generate comprehensive reports and analytics to make informed decisions about faculty development."
            />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#00a859]/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatBox number="100%" label="Digital Process" />
            <StatBox number="3x" label="Faster Evaluations" />
            <StatBox number="24/7" label="Secure Access" />
            <StatBox number="Zero" label="Paper Waste" />
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#00a859] to-[#008f4c] p-10 lg:p-16 text-center shadow-2xl shadow-[#00a859]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 relative z-10 tracking-tight">
              Ready to transform your evaluation process?
            </h2>
            <p className="text-emerald-100 text-lg mb-10 relative z-10 max-w-2xl mx-auto font-medium">
              Join the academic institutions already using our platform to modernize their faculty appraisals.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#00a859] font-bold text-[16px] hover:bg-slate-50 hover:-translate-y-1 transition-all relative z-10 shadow-lg"
            >
              Login to Portal <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white py-12 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00a859]/10 flex items-center justify-center">
              <BarChart3 className="text-[#00a859]" size={16} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              Faculty<span className="text-[#00a859]">Evaluate</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Faculty Evaluation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#f8fafc] border border-slate-200/60 hover:border-[#00a859]/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl lg:text-5xl font-extrabold text-white mb-2">{number}</span>
      <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">{label}</span>
    </div>
  );
}
