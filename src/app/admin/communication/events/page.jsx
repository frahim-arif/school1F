"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  MapPin,
  CalendarCheck,
} from "lucide-react";

const STORAGE_KEY = "school1_communication_events";

const initialEvents = [
  {
    id: "1",
    title: "Annual Day Celebration",
    category: "School Event",
    date: "2026-11-15",
    endDate: "2026-11-15",
    startTime: "10:00",
    endTime: "14:00",
    location: "School Auditorium",
    description: "Annual school celebration and student performances.",
    status: "Upcoming",
  },
  {
    id: "2",
    title: "Parent Teacher Meeting",
    category: "Meeting",
    date: "2026-11-08",
    endDate: "2026-11-08",
    startTime: "09:00",
    endTime: "12:00",
    location: "School Campus",
    description: "Discussion of student progress with parents.",
    status: "Upcoming",
  },
  {
    id: "3",
    title: "Winter Vacation",
    category: "Holiday",
    date: "2026-12-25",
    endDate: "2026-12-31",
    startTime: "",
    endTime: "",
    location: "School",
    description: "Winter vacation.",
    status: "Upcoming",
  },
];

const emptyForm = {
  title: "",
  category: "School Event",
  date: "",
  endDate: "",
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  description: "",
  status: "Upcoming",
};

const categories = ["School Event", "Holiday", "Meeting", "Exam", "Sports", "Other"];
const statuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const categoryStyles = {
  "School Event": "bg-blue-50 text-blue-700 border-blue-200",
  Holiday: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Meeting: "bg-violet-50 text-violet-700 border-violet-200",
  Exam: "bg-amber-50 text-amber-700 border-amber-200",
  Sports: "bg-orange-50 text-orange-700 border-orange-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function EventsCalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setEvents(saved ? JSON.parse(saved) : initialEvents);
    } catch {
      setEvents(initialEvents);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, ready]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesSearch =
          !query ||
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === "All" || event.category === categoryFilter;
        const matchesStatus =
          statusFilter === "All" || event.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, search, categoryFilter, statusFilter]);

  const monthEvents = useMemo(
    () => filteredEvents.filter((event) => monthKey(new Date(`${event.date}T00:00:00`)) === monthKey(currentMonth)),
    [filteredEvents, currentMonth]
  );

  const upcomingCount = events.filter((event) => event.status === "Upcoming").length;
  const holidayCount = events.filter((event) => event.category === "Holiday").length;
  const meetingCount = events.filter((event) => event.category === "Meeting").length;

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarCells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function eventsOnDay(day) {
    if (!day) return [];
    const key = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return filteredEvents.filter((event) => event.date <= key && event.endDate >= key);
  }

  function openCreate(date = "") {
    setEditingId(null);
    setForm({ ...emptyForm, date, endDate: date });
    setSelectedDate(date);
    setError("");
    setModalOpen(true);
  }

  function openEdit(event) {
    setEditingId(event.id);
    setForm({ ...emptyForm, ...event });
    setError("");
    setModalOpen(true);
  }

  function saveEvent(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.date || !form.endDate) {
      setError("Event title, start date aur end date required hain.");
      return;
    }

    if (form.endDate < form.date) {
      setError("End date, start date se pehle nahi ho sakti.");
      return;
    }

    if (form.startTime && form.endTime && form.date === form.endDate && form.endTime < form.startTime) {
      setError("End time, start time se pehle nahi ho sakta.");
      return;
    }

    if (editingId) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingId ? { ...form, id: editingId } : event
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        { ...form, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ]);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function deleteEvent(id) {
    if (!window.confirm("Kya aap is event ko delete karna chahte hain?")) return;
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }

  function changeMonth(delta) {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  }

  const todayKey = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  })();

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays size={16} />
              Communication / Events & Calendar
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Events & Calendar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              School events, holidays, meetings aur exam dates manage karein.
            </p>
          </div>
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center justify-center gap-2 bg-[#123c70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2d57]"
          >
            <Plus size={18} /> Add Event
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Events", value: events.length, icon: CalendarDays, color: "text-blue-700 bg-blue-50" },
            { label: "Upcoming", value: upcomingCount, icon: CalendarCheck, color: "text-emerald-700 bg-emerald-50" },
            { label: "Holidays", value: holidayCount, icon: Clock, color: "text-amber-700 bg-amber-50" },
            { label: "Meetings", value: meetingCount, icon: MapPin, color: "text-violet-700 bg-violet-50" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center ${item.color}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(350px,0.9fr)]">
          <div className="border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-slate-900">School Calendar</h2>
                <p className="mt-1 text-sm text-slate-500">Date par click karke event add karein.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => changeMonth(-1)} className="border border-slate-200 p-2 hover:bg-slate-50" aria-label="Previous month">
                  <ChevronLeft size={18} />
                </button>
                <span className="min-w-36 text-center font-semibold">
                  {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </span>
                <button onClick={() => changeMonth(1)} className="border border-slate-200 p-2 hover:bg-slate-50" aria-label="Next month">
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => setCurrentMonth(new Date())} className="border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                  Today
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="grid grid-cols-7 border-b border-slate-200 pb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarCells.map((day, index) => {
                  const dayEvents = eventsOnDay(day);
                  const key = day
                    ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    : "";
                  return (
                    <button
                      key={`${day || "blank"}-${index}`}
                      disabled={!day}
                      onClick={() => openCreate(key)}
                      className={`min-h-[90px] border-b border-r border-slate-100 p-1.5 text-left transition sm:min-h-[112px] sm:p-2 ${
                        !day ? "bg-slate-50/60" : "hover:bg-blue-50/60"
                      } ${key === todayKey ? "bg-blue-50/70" : ""}`}
                    >
                      {day && (
                        <>
                          <span className={`inline-flex h-7 w-7 items-center justify-center text-sm ${key === todayKey ? "bg-[#123c70] font-bold text-white" : "text-slate-700"}`}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                title={event.title}
                                className={`truncate border px-1 py-0.5 text-[10px] sm:text-xs ${categoryStyles[event.category] || categoryStyles.Other}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <p className="text-[10px] text-slate-500">+{dayEvents.length - 2} more</p>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">Events This Month</h2>
              <p className="mt-1 text-sm text-slate-500">
                {monthEvents.length} event(s) in this calendar month
              </p>
            </div>
            <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
              {monthEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarDays className="mx-auto text-slate-300" size={38} />
                  <p className="mt-3 font-medium text-slate-700">No events found</p>
                  <p className="mt-1 text-sm text-slate-500">Add an event or change your filters.</p>
                </div>
              ) : (
                monthEvents.map((event) => (
                  <article key={event.id} className="border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`inline-flex border px-2 py-1 text-xs font-medium ${categoryStyles[event.category] || categoryStyles.Other}`}>
                          {event.category}
                        </span>
                        <h3 className="mt-2 break-words font-semibold text-slate-900">{event.title}</h3>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => openEdit(event)} className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" aria-label="Edit event">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteEvent(event.id)} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Delete event">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      <p className="flex items-center gap-2"><CalendarDays size={15} /> {formatDate(event.date)}{event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}</p>
                      {event.startTime && <p className="flex items-center gap-2"><Clock size={15} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</p>}
                      {event.location && <p className="flex items-center gap-2"><MapPin size={15} /> {event.location}</p>}
                    </div>
                    {event.description && <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-slate-500">Status: </span>
                      <span className={`text-xs font-semibold ${event.status === "Completed" ? "text-emerald-700" : event.status === "Cancelled" ? "text-red-600" : event.status === "Ongoing" ? "text-blue-700" : "text-amber-700"}`}>
                        {event.status}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">All Events</h2>
              <p className="mt-1 text-sm text-slate-500">Search, filter aur manage school events.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="All">All categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="All">All statuses</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Event</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{event.title}</p>
                      {event.description && <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{event.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex border px-2 py-1 text-xs ${categoryStyles[event.category] || categoryStyles.Other}`}>{event.category}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(event.date)}
                      {event.endDate !== event.date && <p className="mt-1 text-xs text-slate-500">to {formatDate(event.endDate)}</p>}
                    </td>
                    <td className="px-5 py-4">{event.location || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex border border-slate-200 px-2 py-1 text-xs">{event.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(event)} className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" aria-label="Edit event"><Pencil size={16} /></button>
                        <button onClick={() => deleteEvent(event.id)} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Delete event"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No matching events found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Event" : "Create Event"}</h2>
                <p className="mt-1 text-sm text-slate-500">Event details fill karein.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal"><X size={20} /></button>
            </div>
            <form onSubmit={saveEvent} className="space-y-5 p-5 sm:p-6">
              {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Event Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} placeholder="e.g. Annual Day Celebration" className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, endDate: form.endDate && form.endDate < e.target.value ? e.target.value : form.endDate })} required className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Date *</label>
                  <input type="date" min={form.date || undefined} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={180} placeholder="School auditorium / classroom" className="w-full border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={2000} placeholder="Event details..." className="w-full resize-y border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button type="button" onClick={() => setModalOpen(false)} className="border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-[#123c70] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2d57]">{editingId ? "Save Changes" : "Create Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}