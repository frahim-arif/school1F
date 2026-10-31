
"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap, Plus, Trash2, Save, BookOpen,
  CalendarDays, Layers3, X
} from "lucide-react";

const STORAGE_KEY = "school_academic_settings";

const defaults = {
  session: "2026-2027",
  startDate: "",
  endDate: "",
  classes: ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"],
  sections: ["A", "B"],
  subjects: ["English", "Mathematics", "Science", "Social Science", "Assamese", "Hindi", "Computer"],
};

export default function AcademicSettingsPage() {
  const [data, setData] = useState(defaults);
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData({ ...defaults, ...JSON.parse(stored) });
    } catch (error) {
      console.error("Academic settings load error:", error);
    }
  }, []);

  const update = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addItem = (key, value, setter) => {
    const clean = value.trim();
    if (!clean || data[key].some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    update(key, [...data[key], clean]);
    setter("");
  };

  const removeItem = (key, value) => {
    update(key, data[key].filter((item) => item !== value));
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
  };

  const sections = [
    { title: "Classes", key: "classes", value: newClass, setter: setNewClass, icon: GraduationCap, placeholder: "Enter class name" },
    { title: "Sections", key: "sections", value: newSection, setter: setNewSection, icon: Layers3, placeholder: "Enter section" },
    { title: "Subjects", key: "subjects", value: newSubject, setter: setNewSubject, icon: BookOpen, placeholder: "Enter subject name" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">School Configuration</p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">Academic Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage academic sessions, classes, sections and subjects.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><CalendarDays size={23} /></div>
          <div>
            <h2 className="font-black text-slate-800">Academic Session</h2>
            <p className="text-sm text-slate-500">Set the current school session.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-600">
            Session Name
            <input value={data.session} onChange={(e) => update("session", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500" placeholder="2026-2027" />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Start Date
            <input type="date" value={data.startDate} onChange={(e) => update("startDate", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            End Date
            <input type="date" value={data.endDate} onChange={(e) => update("endDate", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500" />
          </label>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><Icon size={22} /></div>
                <h2 className="font-black text-slate-800">{section.title}</h2>
              </div>

              <div className="flex gap-2">
                <input value={section.value} onChange={(e) => section.setter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(section.key, section.value, section.setter)}
                  placeholder={section.placeholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                <button onClick={() => addItem(section.key, section.value, section.setter)}
                  className="rounded-xl bg-emerald-700 px-3 text-white hover:bg-emerald-800"><Plus size={19} /></button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {data[section.key].map((item) => (
                  <span key={item} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {item}
                    <button onClick={() => removeItem(section.key, item)} className="text-red-500 hover:text-red-700"><X size={15} /></button>
                  </span>
                ))}
                {data[section.key].length === 0 && <p className="text-sm text-slate-400">No items added.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Save your academic configuration.</p>
        <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
          <Save size={18} /> Save Settings
        </button>
      </div>

      {saved && <p className="text-sm font-semibold text-emerald-700">Academic settings saved in this browser.</p>}
    </div>
  );
}
