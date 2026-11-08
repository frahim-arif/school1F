
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

const SCHOOL_NAME = "Adarsha Markaz Academy";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_ROOT}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(
        err.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6ef] px-4 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden border border-emerald-950/10 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102c23] via-[#174737] to-[#0b211b] p-12 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-2xl" />

          <div className="relative">
            <div className="mb-10 flex h-16 w-16 items-center justify-center border border-amber-300/30 bg-white/10">
              <GraduationCap size={35} className="text-amber-300" />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
              School Administration
            </p>

            <h1 className="max-w-md font-serif text-4xl font-bold leading-tight">
              Welcome to Your School Management Portal
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-emerald-50/75">
              Manage students, attendance, academics and school
              activities through one secure administration system.
            </p>
          </div>

          <div className="relative space-y-5">
            <div className="flex items-center gap-4 border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="shrink-0 text-amber-300" size={27} />
              <div>
                <p className="font-semibold">Secure Administration</p>
                <p className="mt-1 text-xs text-emerald-50/60">
                  Protected access for authorized staff.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-white/10 bg-white/5 p-4">
              <BookOpen className="shrink-0 text-amber-300" size={27} />
              <div>
                <p className="font-semibold">Complete School Management</p>
                <p className="mt-1 text-xs text-emerald-50/60">
                  Organized school administration in one place.
                </p>
              </div>
            </div>

            <p className="pt-4 text-xs text-emerald-50/50">
              © {new Date().getFullYear()} {SCHOOL_NAME}
            </p>
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-9 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#153d30]">
                <GraduationCap size={36} className="text-amber-300" />
              </div>

              <h1 className="font-serif text-xl font-bold text-[#173c30]">
                {SCHOOL_NAME}
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Laharighat, Morigaon, Assam
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-5 hidden h-1 w-14 bg-amber-500 lg:block" />

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                Administration Portal
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-[#17372c]">
                Admin Login
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Sign in with your authorized administrator account
                to continue.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your admin email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 bg-[#fafbf8] py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 bg-[#fafbf8] py-3.5 pl-12 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-800"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 bg-[#173d30] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 transition hover:bg-[#0d2d22] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight
                      size={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={15} className="text-emerald-700" />
                Secure Admin Authentication
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-400">
                This portal is intended for authorized school
                administrators only.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
