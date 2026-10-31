
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const SCHOOL_NAME = "Adarsha Markaz Academy";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success || !data.token) {
        throw new Error(
          data.message || "Login failed. Please check your details."
        );
      }

      // Save authentication token
      localStorage.setItem("token", data.token);

      // Save logged-in user details
      if (data.user) {
        const userData = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status,
        };

        localStorage.setItem("user", JSON.stringify(userData));
      }

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Backend connection nahi ho raha. Backend server aur API URL check karein."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#f4f7f4] text-slate-800">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />

      {/* Left school branding panel */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#062f27] via-[#084b3b] to-[#0b6650] p-10 text-white lg:flex xl:p-14">
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-20 top-32 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur">
            <School size={30} />
          </div>

          <div>
            <p className="text-lg font-extrabold tracking-wide">
              {SCHOOL_NAME}
            </p>
            <p className="mt-1 text-xs tracking-[0.2em] text-emerald-100/80">
              SCHOOL PORTAL
            </p>
          </div>
        </div>

        <div className="relative z-10 my-12 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-100">
            <ShieldCheck size={15} />
            OFFICIAL SCHOOL PORTAL
          </span>

          <h1 className="mt-7 text-4xl font-black leading-tight xl:text-5xl">
            Empowering
            <span className="block text-emerald-300">
              Young Minds.
            </span>
            Building Futures.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-emerald-50/80 xl:text-lg">
            A smarter way to manage school activities, connect teachers and
            students, and keep your school community organised.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              {
                icon: GraduationCap,
                title: "Students",
                subtitle: "Student records",
              },
              {
                icon: Users,
                title: "Teachers",
                subtitle: "Staff management",
              },
              {
                icon: BookOpen,
                title: "Academics",
                subtitle: "Learning records",
              },
            ].map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"
              >
                <Icon size={23} className="text-emerald-300" />
                <p className="mt-4 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                  {subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-emerald-100/70">
          <span>Learning • Excellence • Success</span>
          <span>Secure Access</span>
        </div>
      </section>

      {/* Login panel */}
      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-md">
          {/* Mobile school branding */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg">
              <School size={27} />
            </div>

            <div>
              <p className="font-extrabold text-slate-800">
                {SCHOOL_NAME}
              </p>
              <p className="mt-0.5 text-xs tracking-widest text-emerald-700">
                SCHOOL PORTAL
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_70px_-25px_rgba(6,78,59,0.20)] sm:p-10">
            <div className="mb-8">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Lock size={27} />
              </div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                Welcome Back
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your account details to access your school portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-600/10">
                  <Mail
                    size={19}
                    className="ml-4 shrink-0 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-4 text-sm outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 transition focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-600/10">
                  <Lock
                    size={19}
                    className="ml-4 shrink-0 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-w-0 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="mr-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 py-4 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to your account"}

                {!loading && (
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>Protected school account access</span>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            © {new Date().getFullYear()} {SCHOOL_NAME}.
            <span className="block">All rights reserved.</span>
          </p>
        </div>
      </section>
    </main>
  );
}
