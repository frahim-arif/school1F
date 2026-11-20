
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://school1b.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

export default function StudentLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_ROOT}/student-auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid username or password.");
      }

      if (!data.token || !data.student) {
        throw new Error("Invalid server response. Please try again.");
      }

      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentUser", JSON.stringify(data.student));

      router.replace("/student/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8ef] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e6e1d2] bg-white shadow-xl">
        <div className="grid md:grid-cols-2">

          {/* Left Panel */}
          <div className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden bg-[#102c25] p-10 text-white md:flex">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#c8ae6a]/20" />
            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-[#c8ae6a]/20" />

            <div className="relative z-10">
              <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-xl bg-[#c8ae6a] text-[#102c25]">
                <GraduationCap size={32} />
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-[#c8ae6a]">
                Student Portal
              </p>

              <h1 className="max-w-sm text-4xl font-bold leading-tight">
                Welcome to Your Learning Journey
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                Access your academic information, attendance, examination
                results, fee details and important school updates in one place.
              </p>
            </div>

            <div className="relative z-10 space-y-5">
              {[
                "View your academic records",
                "Check attendance and results",
                "Stay updated with school notices",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <ShieldCheck className="shrink-0 text-[#c8ae6a]" size={20} />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}

              <div className="border-t border-white/15 pt-6 text-xs text-white/50">
                Adarsha Markaz Academy Laharighat
                <br />
                Laharighat, Morigaon, Assam
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="flex min-h-[590px] flex-col justify-center px-6 py-12 sm:px-12">
            <div className="mx-auto w-full max-w-md">

              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-[#edf2ed] text-[#173b30]">
                <BookOpen size={29} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[2px] text-[#a38b4e]">
                Student Account
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#172d27]">
                Student Login
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter the login credentials provided by your school administrator.
              </p>

              <form onSubmit={handleLogin} className="mt-9 space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#263b32]">
                    Username
                  </label>

                  <div className="flex items-center rounded-lg border border-gray-200 bg-[#fcfcfa] px-4 focus-within:border-[#456c58]">
                    <User size={19} className="text-gray-400" />

                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="h-13 w-full bg-transparent px-3 text-sm text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#263b32]">
                    Password
                  </label>

                  <div className="flex items-center rounded-lg border border-gray-200 bg-[#fcfcfa] px-4 focus-within:border-[#456c58]">
                    <Lock size={19} className="text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-13 w-full bg-transparent px-3 text-sm text-gray-800 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-[#173b30]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#173b30] px-5 font-semibold text-white transition hover:bg-[#0e2b23] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Login to Student Portal"}
                  {!loading && <ArrowRight size={19} />}
                </button>
              </form>

              <div className="mt-8 rounded-lg bg-[#f6f5ef] p-4">
                <p className="text-center text-xs leading-6 text-gray-600">
                  <ShieldCheck
                    size={15}
                    className="mr-1 inline-block text-[#456c58]"
                  />
                  Your login credentials are provided by the school
                  administrator. For login assistance, please contact your school office.
                </p>
              </div>

              <p className="mt-8 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Adarsha Markaz Academy Laharighat
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
