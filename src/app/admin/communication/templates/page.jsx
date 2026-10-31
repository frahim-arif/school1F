
"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineEnvelope,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";

const defaultTemplates = [
  {
    id: 1,
    name: "Fee Reminder",
    channel: "SMS",
    subject: "Fee Payment Reminder",
    message:
      "Dear Parent, this is a reminder to pay the pending school fee for {{student_name}}. Thank you.",
  },
  {
    id: 2,
    name: "Holiday Announcement",
    channel: "Email",
    subject: "School Holiday Notice",
    message:
      "Dear Parents, the school will remain closed on {{date}} due to {{reason}}. Regards, School Administration.",
  },
  {
    id: 3,
    name: "Attendance Alert",
    channel: "SMS",
    subject: "Student Attendance",
    message:
      "Dear Parent, {{student_name}} was marked absent on {{date}}. Please contact the school for details.",
  },
  {
    id: 4,
    name: "Exam Announcement",
    channel: "Email",
    subject: "Examination Schedule",
    message:
      "Dear Students and Parents, examinations will begin on {{date}}. Please contact the school office for the detailed schedule.",
  },
];

const emptyForm = {
  name: "",
  channel: "SMS",
  subject: "",
  message: "",
};

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase());

      return (
        matchesSearch &&
        (channelFilter === "All" || item.channel === channelFilter)
      );
    });
  }, [templates, search, channelFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      channel: item.channel,
      subject: item.subject,
      message: item.message,
    });
    setShowForm(true);
  };

  const saveTemplate = (e) => {
    e.preventDefault();

    const item = {
      id: editingId ?? Date.now(),
      ...form,
      name: form.name.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (editingId !== null) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingId ? item : template
        )
      );
    } else {
      setTemplates((prev) => [item, ...prev]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteTemplate = (id) => {
    if (!window.confirm("Delete this template?")) return;
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  const smsCount = templates.filter((item) => item.channel === "SMS").length;
  const emailCount = templates.filter(
    (item) => item.channel === "Email"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-slate-500">
              Communication / Message Templates
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Message Templates
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create reusable templates for school communications.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Templates",
              value: templates.length,
              icon: HiOutlineDocumentText,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "SMS Templates",
              value: smsCount,
              icon: HiOutlineDevicePhoneMobile,
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Email Templates",
              value: emailCount,
              icon: HiOutlineEnvelope,
              color: "bg-purple-50 text-purple-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center justify-between border border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Templates are currently managed in page state. Connect a backend API
          to retain changes after refresh and share templates across users.
          Variables such as {"{{student_name}}"} are placeholders for later
          integration.
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"
            >
              <option value="All">All Channels</option>
              <option value="SMS">SMS</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            {filteredTemplates.map((item) => (
              <article
                key={item.id}
                className="border border-slate-200 p-5 transition hover:border-emerald-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 p-3 text-emerald-800">
                      {item.channel === "SMS" ? (
                        <HiOutlineDevicePhoneMobile className="h-5 w-5" />
                      ) : (
                        <HiOutlineEnvelope className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        {item.name}
                      </h2>
                      <span className="mt-2 inline-block bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {item.channel}
                      </span>
                    </div>
                  </div>
                </div>

                {item.subject && (
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Subject: {item.subject}
                  </p>
                )}

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                  {item.message.length > 180
                    ? `${item.message.slice(0, 180)}...`
                    : item.message}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setPreview(item)}
                    className="flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <HiOutlineEye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1 border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <HiOutlinePencilSquare className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(item.id)}
                    className="flex items-center gap-1 border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500 lg:col-span-2">
                No templates found. Create a new template to get started.
              </div>
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <form
            onSubmit={saveTemplate}
            className="my-auto w-full max-w-xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId !== null ? "Edit Template" : "Create Template"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Template Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  maxLength={100}
                  className="w-full border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700"
                  placeholder="e.g. Fee Reminder"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Channel *
                </label>
                <select
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                  className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="SMS">SMS</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              {form.channel === "Email" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    maxLength={150}
                    className="w-full border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700"
                    placeholder="Enter subject"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Message Content *
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={6}
                  maxLength={5000}
                  className="w-full border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-700"
                  placeholder="Write your message..."
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.message.length}/5000
                </p>
              </div>

              <p className="bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Available placeholder example: {"{{student_name}}"},{" "}
                {"{{date}}"}, {"{{reason}}"}.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-300 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                {editingId !== null ? "Update Template" : "Save Template"}
              </button>
            </div>
          </form>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs uppercase text-slate-500">Preview</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {preview.name}
                </h2>
              </div>
              <button
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="p-2 hover:bg-slate-100"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-slate-500">
                Channel: {preview.channel}
              </p>
              {preview.subject && (
                <p className="text-sm font-semibold text-slate-800">
                  Subject: {preview.subject}
                </p>
              )}
              <div className="whitespace-pre-wrap border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {preview.message}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                onClick={() => setPreview(null)}
                className="bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
