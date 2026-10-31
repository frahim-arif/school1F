
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Library,
  CheckCircle,
  BookMarked,
  Settings,
} from "lucide-react";
import { libraryApi } from "@/lib/libraryApi";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    available: 0,
    issued: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await libraryApi.getBooks(search);

      setBooks(data.books || []);
      setStats(
        data.stats || {
          totalBooks: 0,
          available: 0,
          issued: 0,
        }
      );
    } catch (err) {
      setError(err.message || "Books load nahi ho sakin.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const statCards = [
    {
      label: "Total Copies",
      value: stats.totalBooks,
      icon: Library,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Available",
      value: stats.available,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Issued",
      value: stats.issued,
      icon: BookMarked,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Library size={17} />
              <span>Admin</span>
              <span>/</span>
              <span className="text-emerald-700">Library</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Library Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage books, track availability and monitor issued copies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/library/issue"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100"
            >
              <BookOpen size={17} />
              Issue Books
            </Link>

            <Link
              href="/admin/library/create"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Plus size={18} />
              Add Book
            </Link>

            <Link
              href="/admin/library/return"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100"
            >
              <Settings size={17} />
              Returns
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <section className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`p-3 ${color}`}>
                <Icon size={24} />
              </div>

              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold">
                  {loading ? "—" : value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Book Inventory */}
        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Book Inventory</h2>
              <p className="mt-1 text-xs text-slate-500">
                Search and review your library collection.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex min-w-0 items-center gap-2 border border-slate-300 px-3 focus-within:border-emerald-600">
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, author, ISBN..."
                  aria-label="Search books"
                  className="w-full min-w-0 py-2 text-sm outline-none sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={loadBooks}
                disabled={loading}
                title="Refresh books"
                aria-label="Refresh books"
                className="inline-flex items-center justify-center border border-slate-300 px-3 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-4 flex flex-col gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={loadBooks}
                className="self-start font-semibold underline sm:self-auto"
              >
                Try again
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Book Name</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Copies</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500"
                    >
                      Loading books...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500"
                    >
                      {search
                        ? "No books match your search."
                        : "No books found. Add your first book to get started."}
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr
                      key={book._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {book.bookName}
                      </td>

                      <td className="px-5 py-4">
                        {book.author || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {book.category || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {book.availableQuantity ?? 0} / {book.quantity ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold ${
                            (book.availableQuantity ?? 0) > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {(book.availableQuantity ?? 0) > 0
                            ? "Available"
                            : "All Issued"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Showing {loading ? "—" : books.length} book records
          </div>
        </section>
      </div>
    </main>
  );
}
