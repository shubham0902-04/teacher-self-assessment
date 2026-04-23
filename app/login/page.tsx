"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!form.email.trim()) return toast.error("Please enter your email address.");
    if (!form.password.trim()) return toast.error("Please enter your password.");

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Token is set as an httpOnly cookie by the server
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome, ${data.user.name}!`);

      const from = searchParams.get("from");
      if (from) {
        router.push(from);
        return;
      }

      const role = data.user.role;
      if (role === "Admin") router.push("/admin");
      else if (role === "Faculty") router.push("/faculty");
      else if (role === "HOD") router.push("/hod");
      else if (role === "Principal") router.push("/principal");
      else if (role === "Chairman") router.push("/director");
      else router.push("/admin/dashboard");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-[#ca1f23]/5 blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-[#ca1f23]/5 blur-3xl" />
        <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-slate-200/50 blur-3xl" />
      </div>

      <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden relative z-10 border border-slate-100">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#ca1f23] to-[#a31519] p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg mb-8">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Teacher <br />
              Self-Assessment <br />
              Portal
            </h1>
            <p className="text-red-100 font-medium text-[15px] leading-relaxed max-w-sm">
              Empowering educators through data-driven insights and streamlined evaluation workflows.
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <ShieldCheck className="text-red-200" size={24} />
              <div>
                <p className="text-[13px] font-bold text-white">Secure Portal</p>
                <p className="text-[11px] text-red-200">Authorized personnel only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-10 lg:p-14 flex flex-col justify-center bg-white relative">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Welcome back</h2>
              <p className="text-[14px] font-medium text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="admin@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-[14px] text-slate-800 outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/20 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-12 text-[14px] text-slate-800 outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/20 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ca1f23] text-white py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#b01b1e] transition-all disabled:opacity-50 shadow-lg shadow-[#ca1f23]/25 mt-4 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-[12px] font-medium text-slate-400">
          Teacher Self-Assessment System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
