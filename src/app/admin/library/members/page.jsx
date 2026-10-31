
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Search, Users } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function LibraryMembersPage() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await libraryApi.getIssues(search);
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || "Member records load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const members = useMemo(() => {
    const map = new Map();

    issues.forEach((issue) => {
      const student = issue.student;
      const name = issue.studentName || student?.name || "";
      const id = student?._id || issue.studentId || name;

      if (!name && !issue.studentId && !student?._id) return;

      if (!map.has(String(id))) {
        map.set(String(id), {
          id: String(id),
          name: name || "Student",
          studentId: student?.studentId || issue.studentId || "—",
          email: student?.email || issue.studentEmail || "—",
          phone: student?.phone || student?.mobile || issue.studentPhone || "—",
          issued: 0,
          pending: 0,
        });
      }

      const member = map.get(String(id));
      member.issued += 1;

      if (
        !issue.returned &&
        issue.status !== "Returned" &&
        !issue.returnDate
      ) {
        member.pending += 1;
      }
    });

    return Array.from(map.values());
  }, [issues]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link href="/admin/library" className="mb-3 inline-flex items-center gap-2 text-sm text-emerald-700">
            <ArrowLeft size={17} /> Back to Library
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">Library Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Students found in library issue records.
          </p>
        </div>

        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Users size={20} className="mt-0.5 shrink-0" />
          <p>
            This list is built from book issue history. To show every registered
            library member, the backend needs a dedicated members endpoint.
          </p>
        </div>

        {error && <div role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">Member Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? "Loading..." : `${members.length} unique members found`}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 border px-3">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full py-2 text-sm outline-none sm:w-56"
                />
              </div>
              <button onClick={loadMembers} disabled={loading} aria-label="Refresh members" className="border px-3 hover:bg-slate-50">
                <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Issue Records</th>
                  <th className="px-5 py-3">Books Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center">Loading members...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No members found in issue records.</td></tr>
                ) : members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold">{member.name}</td>
                    <td className="px-5 py-4">{member.studentId}</td>
                    <td className="px-5 py-4">{member.email}</td>
                    <td className="px-5 py-4">{member.phone}</td>
                    <td className="px-5 py-4">{member.issued}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold ${member.pending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {member.pending}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
