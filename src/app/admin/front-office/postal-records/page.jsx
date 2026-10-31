
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";

export default function PostalRecordsPage() {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("All");

  return (
    <main className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/front-office"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#9a5260] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Front Office
          </Link>

          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
            Postal / Dispatch Records
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage incoming and outgoing letters, parcels and dispatches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setDirection("All");
          }}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Reset Filters
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
            <Mail size={25} />
          </div>

          <div>
            <h2 className="font-extrabold text-slate-800">
              Postal Register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and filter postal records.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Records
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, sender or recipient..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Record Type
            </label>

            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#9a5260]"
            >
              <option value="All">All Records</option>
              <option value="Inward">Inward / Received</option>
              <option value="Outward">Outward / Dispatched</option>
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
          <Mail size={35} className="mx-auto text-slate-400" />

          <h3 className="mt-4 font-bold text-slate-700">
            Postal Records Module
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            The page is ready. Records will appear here after the postal
            records API and database integration are connected.
          </p>

          {(search || direction !== "All") && (
            <p className="mt-3 text-xs text-slate-500">
              Current filters: {direction}
              {search ? ` · Search: ${search}` : ""}
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/front-office"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Front Office Dashboard
        </Link>
      </div>
    </main>
  );
}
