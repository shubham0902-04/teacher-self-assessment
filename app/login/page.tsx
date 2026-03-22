"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!form.email.trim()) return toast.error("Email daalo");
    if (!form.password.trim()) return toast.error("Password daalo");

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

      // Token cookie mein save karo (middleware isko read kar sakta hai)
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      // Backup ke liye localStorage mein bhi
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome, ${data.user.name}!`);

      // "from" param se redirect karo — ya role ke hisaab se
      const from = searchParams.get("from");
      if (from) {
        router.push(from);
        return;
      }

      const role = data.user.role;
      if (role === "Admin") router.push("/admin/dashboard");
      else if (role === "Faculty") router.push("/faculty");
      else if (role === "HOD") router.push("/hod");
      else if (role === "Principal") router.push("/principal");
      else if (role === "Chairman") router.push("/director");
      else router.push("/admin/dashboard");

    } catch {
      toast.error("Network error — dobara try karo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Top red bar */}
          <div className="h-1.5 bg-[#ca1f23]" />

          <div className="px-8 py-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#ca1f23] flex items-center justify-center shadow-lg shadow-red-200 mb-4">
                <GraduationCap size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#111] text-center leading-tight">
                Teacher Self-Assessment
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Sign in to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#111] text-sm outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/10 transition placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-[#111] text-sm outline-none focus:border-[#ca1f23] focus:ring-2 focus:ring-[#ca1f23]/10 transition placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ca1f23] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Teacher Self-Assessment System &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}