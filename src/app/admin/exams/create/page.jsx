
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, FilePlus2, CalendarDays } from "lucide-react";
import { examRequest, schoolRequest, extractList } from "@/lib/examApi";

export default function CreateExamPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "Final Exam",
    classId: "",
    sectionId: "",
    startDate: "",
    endDate: "",
    status: "Upcoming",
    instructions: "",
  });

  useEffect(() => {
    schoolRequest("classes")
      .then(data => setClasses(extractList(data, ["classes", "data"])))
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!form.classId) {
      setSections([]);
      return;
    }

    schoolRequest(`sections?classId=${form.classId}`)
      .then(data => setSections(extractList(data, ["sections", "data"])))
      .catch(e => setError(e.message));
  }, [form.classId]);

  function update(key, value) {
    setForm(old => ({
      ...old,
      [key]: value,
      ...(key === "classId" ? { sectionId: "" } : {}),
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    try {
      await examRequest("/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          sectionId: form.sectionId || null,
        }),
      });

      router.push("/admin/exams");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const field = "mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Create New Exam</h1>
        <p className="mt-2 text-sm text-slate-500">Add examination details and schedule.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-600">
            Exam Name *
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-3">
              <FilePlus2 size={18} className="text-slate-400" />
              <input required value={form.name}
                onChange={e => update("name", e.target.value)}
                placeholder="Annual Examination 2026"
                className="w-full py-3 outline-none" />
            </div>
          </label>

          <label className="text-sm font-bold text-slate-600">
            Exam Type *
            <select className={field} value={form.type}
              onChange={e => update("type", e.target.value)}>
              {["Final Exam", "Half Yearly", "Monthly Test", "Unit Test", "Quarterly", "Other"].map(x =>
                <option key={x}>{x}</option>
              )}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-600">
            Class *
            <select required className={field} value={form.classId}
              onChange={e => update("classId", e.target.value)}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-600">
            Section
            <select className={field} value={form.sectionId}
              onChange={e => update("sectionId", e.target.value)}>
              <option value="">All sections</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-600">
            Start Date *
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-3">
              <CalendarDays size={18} className="text-slate-400" />
              <input required type="date" value={form.startDate}
                onChange={e => update("startDate", e.target.value)}
                className="w-full py-3 outline-none" />
            </div>
          </label>

          <label className="text-sm font-bold text-slate-600">
            End Date *
            <input required type="date" min={form.startDate || undefined}
              value={form.endDate} onChange={e => update("endDate", e.target.value)}
              className={field} />
          </label>

          <label className="text-sm font-bold text-slate-600">
            Status
            <select className={field} value={form.status}
              onChange={e => update("status", e.target.value)}>
              {["Upcoming", "Ongoing", "Completed", "Cancelled"].map(x =>
                <option key={x}>{x}</option>
              )}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-600 md:col-span-2">
            Instructions
            <textarea rows={3} className={field} value={form.instructions}
              onChange={e => update("instructions", e.target.value)}
              placeholder="Exam instructions (optional)" />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()}
            className="rounded-xl border px-5 py-3 font-bold text-slate-600">
            Cancel
          </button>
          <button disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:opacity-60">
            <Save size={18} /> {loading ? "Saving..." : "Save Exam"}
          </button>
        </div>
      </form>
    </div>
  );
}
