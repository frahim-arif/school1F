
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function LibraryReportsPage() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [bookData, issueData] = await Promise.all([
        libraryApi.getBooks(),
        libraryApi.getIssues(),
      ]);
      setBooks(bookData.books || []);
      setIssues(issueData.issues || []);
    } catch (err) {
      setError(err.message || "Library report load nahi ho saki.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const activeIssues = issues.filter(
    (i) => !i.returned && i.status !== "Returned" && !i.returnDate
  );

  const overdueIssues = activeIssues.filter((i) => {
    if (!i.dueDate) return false;
    const due = new Date(i.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(due.getTime()) && due < today;
  });

  const exportCSV = () => {
    const headers = ["Book", "Student", "Issue Date", "Due Date", "Status"];
    const rows = issues.map((i) => [
      i.book?.bookName || i.bookName || "Book",
      i.studentName || i.student?.name || "",
      i.issueDate ? new Date(i.issueDate).toLocaleDateString() : "",
      i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "",
      i.returned || i.status === "Returned" || i.returnDate ? "Returned" : "Issued",
    ]);

    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "library-reports.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Books", value: books.length },
    { label: "Issue Records", value: issues.length },
    { label: "Currently Issued", value: activeIssues.length },
    { label: "Overdue Books", value: overdueIssues.length },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link href="/admin/library" className="mb-3 inline-flex items-center gap-2 text-sm text-emerald-700">
              <ArrowLeft size={17} /> Back to Library
            </Link>
            <h1 className="text-2xl font-bold sm:text-3xl">Library Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Summary of books and issue records.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadReport} disabled={loading} className="inline-flex items-center gap-2 border bg-white px-4 py-3 text-sm hover:bg-slate-100">
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={exportCSV} disabled={loading} className="inline-flex items-center gap-2 bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900">
              <Download size={17} /> Export CSV
            </button>
          </div>
        </div>

        {error && <div role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="font-bold">Issue History</h2>
            <p className="mt-1 text-sm text-slate-500">Records returned by the library API.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Book</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Issue Date</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Loading report...</td></tr>
                ) : issues.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No issue records found.</td></tr>
                ) : issues.map((i) => {
                  const returned = i.returned || i.status === "Returned" || Boolean(i.returnDate);
                  const overdue = !returned && i.dueDate && new Date(i.dueDate) < new Date();
                  return (
                    <tr key={i._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold">{i.book?.bookName || i.bookName || "Book"}</td>
                      <td className="px-5 py-4">{i.studentName || i.student?.name || "—"}</td>
                      <td className="px-5 py-4">{i.issueDate ? new Date(i.issueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-4">{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold ${returned ? "bg-emerald-50 text-emerald-700" : overdue ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          {returned ? "Returned" : overdue ? "Overdue" : "Issued"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
