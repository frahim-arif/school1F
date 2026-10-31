
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FilePlus, BookOpen, CalendarDays, Upload, Save,
  AlertCircle, CheckCircle2
} from "lucide-react";
import { homeworkApi, fetchOptions } from "@/lib/homeworkApi";

export default function CreateHomeworkPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    classId: "",
    sectionId: "",
    dueDate: "",
    description: "",
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [classData, sectionData, subjectData] = await Promise.all([
          fetchOptions("classes"),
          fetchOptions("sections"),
          fetchOptions("subjects"),
        ]);

        setClasses(classData);
        setSections(sectionData);
        setSubjects(subjectData);
      } catch (err) {
        setError(
          `Class/Section/Subject load nahi hue: ${err.message}. API response check karein.`
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function change(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function getId(item) {
    return item._id || item.id || "";
  }

  function getName(item) {
    return item.name || item.title || item.className ||
      item.subjectName || item.sectionName || "Unnamed";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Homework title required hai.");
      return;
    }

    if (!form.classId || !form.sectionId || !form.subjectId) {
      setError("Class, section aur subject select karein.");
      return;
    }

    if (!form.dueDate) {
      setError("Submission date select karein.");
      return;
    }

  
let attachment = { url: "", name: "" };

if (file) {
  const uploadResult = await homeworkApi.upload(file);
  attachment = uploadResult.data;
}

await homeworkApi.create({
  ...form,
  title: form.title.trim(),
  assignedDate: new Date().toISOString(),
  attachment: {
    url: attachment.url,
    name: attachment.name,
  },
});


    setSaving(true);

    try {
      await homeworkApi.create({
        ...form,
        title: form.title.trim(),
        assignedDate: new Date().toISOString(),
        attachment: { url: "", name: "" },
      });

      setSuccess("Homework successfully assign ho gaya.");
      setTimeout(() => router.push("/admin/homework"), 800);
    } catch (err) {
      setError(err.message || "Homework save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800">
          Create Homework
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Assign homework to students and manage submissions.
        </p>
      </div>

      {(error || success) && (
        <div className={`flex items-start gap-2 rounded-xl p-4 text-sm ${
          error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-600">
              Homework Title
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-4">
              <FilePlus size={18} className="text-indigo-600" />
              <input
                required
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
                placeholder="Chapter 5 Exercise"
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Subject</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-4">
              <BookOpen size={18} className="text-purple-600" />
              <select
                required
                value={form.subjectId}
                onChange={(e) => change("subjectId", e.target.value)}
                className="w-full py-3 outline-none"
              >
                <option value="">
                  {loadingOptions ? "Loading subjects..." : "Select Subject"}
                </option>
                {subjects.map((item) => (
                  <option key={getId(item)} value={getId(item)}>
                    {getName(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Class</label>
            <select
              required
              value={form.classId}
              onChange={(e) => change("classId", e.target.value)}
              className={inputClass}
            >
              <option value="">
                {loadingOptions ? "Loading classes..." : "Select Class"}
              </option>
              {classes.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getName(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Section</label>
            <select
              required
              value={form.sectionId}
              onChange={(e) => change("sectionId", e.target.value)}
              className={inputClass}
            >
              <option value="">
                {loadingOptions ? "Loading sections..." : "Select Section"}
              </option>
              {sections.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getName(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">
              Submission Date
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-4">
              <CalendarDays size={18} className="text-green-600" />
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.dueDate}
                onChange={(e) => change("dueDate", e.target.value)}
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">
              Attachment
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm text-slate-500">
              <Upload size={18} />
              {file ? file.name : "Select file (upload API pending)"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-bold text-slate-600">
            Homework Description
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => change("description", e.target.value)}
            placeholder="Write homework details..."
            className="mt-2 w-full rounded-xl border p-4 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving || loadingOptions}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Assign Homework"}
          </button>
        </div>
      </form>
    </div>
  );
}
