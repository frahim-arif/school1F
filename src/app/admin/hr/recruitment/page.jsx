"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Plus,
  Search,
  Users,
  Clock3,
  CheckCircle2,
  X,
  MapPin,
  CalendarDays,
} from "lucide-react";

const initialJobs = [];

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    department: "",
    vacancies: "1",
    location: "",
    deadline: "",
    description: "",
  });

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch = [
        job.title,
        job.department,
        job.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const openJobs = jobs.filter((job) => job.status === "Open").length;
  const closedJobs = jobs.filter((job) => job.status === "Closed").length;
  const totalVacancies = jobs.reduce(
    (total, job) => total + Number(job.vacancies || 0),
    0
  );

  function handleSubmit(event) {
    event.preventDefault();

    const newJob = {
      ...form,
      id: `${Date.now()}`,
      vacancies: Number(form.vacancies),
      status: "Open",
      applicants: 0,
      createdAt: new Date().toISOString(),
    };

    setJobs((current) => [newJob, ...current]);
    setForm({
      title: "",
      department: "",
      vacancies: "1",
      location: "",
      deadline: "",
      description: "",
    });
    setShowForm(false);
    setMessage(
      "Vacancy temporary list mein add hui hai. Permanent saving ke liye backend API connect karein."
    );
  }

  function updateStatus(id, status) {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, status } : job))
    );
  }

  return (
    <main className="space-y-6 text-slate-800">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/hr"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0b302a]"
          >
            <ArrowLeft size={16} />
            Back to HR Dashboard
          </Link>

          <h1 className="text-3xl font-black">Recruitment</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage school vacancies and recruitment activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-[#0b302a] px-5 py-3 text-sm font-bold text-white hover:bg-[#155342]"
        >
          <Plus size={18} />
          Add Vacancy
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {message}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Vacancies" value={jobs.length} icon={BriefcaseBusiness} />
        <StatCard title="Open Positions" value={openJobs} icon={CheckCircle2} />
        <StatCard title="Total Applicants" value={jobs.reduce((n, job) => n + Number(job.applicants || 0), 0)} icon={Users} />
        <StatCard title="Positions Available" value={totalVacancies} icon={Clock3} />
      </section>

      <section className="border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Job Openings</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredJobs.length} vacancy record(s)
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 border border-slate-200 px-3 py-2">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vacancies..."
                aria-label="Search vacancies"
                className="min-w-0 text-sm outline-none sm:w-48"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter vacancy status"
              className="border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-slate-50 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="font-extrabold">Create Vacancy</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="p-1 text-slate-500 hover:bg-slate-200"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Job Title" required>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mathematics Teacher"
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>

              <FormField label="Department" required>
                <input
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Teaching"
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>

              <FormField label="Number of Vacancies" required>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.vacancies}
                  onChange={(e) => setForm({ ...form, vacancies: e.target.value })}
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>

              <FormField label="Location">
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="School campus"
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>

              <FormField label="Application Deadline">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>

              <FormField label="Job Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Responsibilities and requirements..."
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b302a]"
                />
              </FormField>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[#0b302a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#155342]"
              >
                Add Vacancy
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Position</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Vacancies</th>
                <th className="px-5 py-4">Applicants</th>
                <th className="px-5 py-4">Deadline</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <BriefcaseBusiness className="mx-auto mb-3 text-slate-300" size={36} />
                    <p className="font-bold text-slate-700">No vacancies found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add Vacancy se apni pehli vacancy create karein.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-bold">{job.title}</p>
                      {job.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} /> {job.location}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{job.department}</td>
                    <td className="px-5 py-4 text-sm">{job.vacancies}</td>
                    <td className="px-5 py-4 text-sm">{job.applicants}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {job.deadline ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} /> {job.deadline}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold ${
                        job.status === "Open"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => updateStatus(job.id, job.status === "Open" ? "Closed" : "Open")}
                        className="text-xs font-bold text-[#0b302a] underline"
                      >
                        {job.status === "Open" ? "Close vacancy" : "Reopen"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Note: This page currently uses temporary browser state. Vacancies will not
        survive a page refresh until the existing backend API and database are connected.
      </p>
    </main>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <Icon size={21} className="text-[#0b302a]" />
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </article>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}