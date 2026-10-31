"use client";

import { useMemo, useState } from "react";
import {
  HiOutlineEnvelope,
  HiOutlineMagnifyingGlass,
  HiOutlinePaperAirplane,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineEye,
} from "react-icons/hi2";

const initialEmails = [];

export default function EmailMessagesPage() {
  const [emails, setEmails] = useState(initialEmails);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [form, setForm] = useState({
    subject: "",
    audience: "All Parents",
    recipient: "",
    message: "",
  });

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        email.subject.toLowerCase().includes(search.toLowerCase()) ||
        email.audience.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || email.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [emails, search, statusFilter]);

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const saveDraft = () => {
    if (!form.subject.trim() || !form.message.trim()) {
      alert("Please enter the email subject and message.");
      return;
    }

    const newEmail = {
      id: Date.now(),
      subject: form.subject.trim(),
      audience:
        form.audience === "Specific Email"
          ? form.recipient.trim()
          : form.audience,
      message: form.message.trim(),
      status: "Draft",
      date: new Date().toLocaleString(),
    };

    setEmails((previous) => [newEmail, ...previous]);
    setShowCompose(false);
    setForm({
      subject: "",
      audience: "All Parents",
      recipient: "",
      message: "",
    });
  };

  const closeCompose = () => {
    setShowCompose(false);
    setForm({
      subject: "",
      audience: "All Parents",
      recipient: "",
      message: "",
    });
  };

  const stats = [
    {
      title: "Total Emails",
      value: emails.length,
      icon: HiOutlineEnvelope,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Drafts",
      value: emails.filter((email) => email.status === "Draft").length,
      icon: HiOutlineDocumentText,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Sent Emails",
      value: emails.filter((email) => email.status === "Sent").length,
      icon: HiOutlineCheckCircle,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Scheduled",
      value: emails.filter((email) => email.status === "Scheduled").length,
      icon: HiOutlineClock,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <HiOutlineEnvelope className="h-4 w-4" />
              Communication
              <span>/</span>
              <span className="text-emerald-700">Email Messages</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Email Messages
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Compose emails and manage your communication drafts.
            </p>
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Compose Email
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className={`p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Information */}
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4">
          <HiOutlineEnvelope className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Email service connection required
            </p>
            <p className="mt-1 text-sm text-amber-800">
              This page currently saves drafts in the page state only. Actual
              email delivery requires a backend API and a configured email
              provider.
            </p>
          </div>
        </div>

        {/* Email History */}
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Email History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage your email drafts.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search emails..."
                    className="w-full border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-700 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="All">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-semibold">Email Subject</th>
                  <th className="px-5 py-4 font-semibold">Audience</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {email.subject}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {email.audience}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {email.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold ${
                          email.status === "Sent"
                            ? "bg-green-100 text-green-700"
                            : email.status === "Scheduled"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {email.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        title="View email"
                        className="inline-flex items-center gap-1 border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-emerald-700 hover:text-emerald-800"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEmails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-slate-100 text-slate-400">
                        <HiOutlineEnvelope className="h-7 w-7" />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-800">
                        No emails found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Compose an email to create your first draft.
                      </p>

                      <button
                        onClick={() => setShowCompose(true)}
                        className="mt-4 text-sm font-semibold text-emerald-800 hover:underline"
                      >
                        Compose your first email
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            Showing {filteredEmails.length} of {emails.length} emails
          </div>
        </section>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Compose Email
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create an email draft for your audience.
                </p>
              </div>

              <button
                onClick={closeCompose}
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close compose email"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => updateForm("subject", e.target.value)}
                  placeholder="Enter email subject"
                  maxLength={150}
                  className="w-full border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recipient Group *
                </label>
                <select
                  value={form.audience}
                  onChange={(e) => updateForm("audience", e.target.value)}
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
                >
                  <option>All Parents</option>
                  <option>All Students</option>
                  <option>All Teachers</option>
                  <option>All Staff</option>
                  <option>Specific Email</option>
                </select>
              </div>

              {form.audience === "Specific Email" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.recipient}
                    onChange={(e) => updateForm("recipient", e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                  />
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Email Message *
                  </label>
                  <span className="text-xs text-slate-400">
                    {form.message.length} characters
                  </span>
                </div>

                <textarea
                  value={form.message}
                  onChange={(e) => updateForm("message", e.target.value)}
                  placeholder="Write your email message here..."
                  rows={7}
                  maxLength={10000}
                  className="w-full resize-y border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex items-start gap-2 bg-slate-50 p-3 text-sm text-slate-600">
                <HiOutlineUsers className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
                <p>
                  This page creates a draft only. No recipient list is fetched
                  and no email is sent until a backend email service is
                  connected.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 p-5 sm:flex-row">
              <button
                onClick={closeCompose}
                className="border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveDraft}
                className="inline-flex items-center justify-center gap-2 bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                <HiOutlineDocumentText className="h-5 w-5" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Email Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Email Details
              </h2>
              <button
                onClick={() => setSelectedEmail(null)}
                aria-label="Close email details"
                className="p-2 text-slate-500 hover:bg-slate-100"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedEmail.subject}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Audience
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedEmail.audience}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {selectedEmail.message}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">{selectedEmail.date}</span>
                <span className="bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {selectedEmail.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                onClick={() => setSelectedEmail(null)}
                className="bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
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