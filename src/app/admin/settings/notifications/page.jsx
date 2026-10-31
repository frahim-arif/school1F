
"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Save, Megaphone } from "lucide-react";

const STORAGE_KEY = "school_notification_settings";

const defaults = [
  { id: "newAdmission", title: "New Admission", desc: "Notify when a new student is admitted.", email: true, sms: false, dashboard: true },
  { id: "feePayment", title: "Fee Payment", desc: "Notify when a student fee payment is recorded.", email: true, sms: true, dashboard: true },
  { id: "attendance", title: "Attendance", desc: "Notify about student attendance updates.", email: false, sms: false, dashboard: true },
  { id: "examination", title: "Examination", desc: "Notify about examination and result updates.", email: true, sms: false, dashboard: true },
  { id: "notices", title: "School Notices", desc: "Notify users about new school notices.", email: true, sms: true, dashboard: true },
  { id: "events", title: "School Events", desc: "Notify users about upcoming school events.", email: false, sms: false, dashboard: true },
];

export default function NotificationsPage() {
  const [items, setItems] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(defaults.map((item) => ({
          ...item,
          ...(parsed.find((savedItem) => savedItem.id === item.id) || {}),
        })));
      }
    } catch (error) {
      console.error("Notification settings load error:", error);
    }
  }, []);

  const toggle = (id, channel) => {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, [channel]: !item[channel] } : item
    ));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setSaved(true);
  };

  const channels = [
    { id: "dashboard", title: "Dashboard", icon: Bell },
    { id: "email", title: "Email", icon: Mail },
    { id: "sms", title: "SMS", icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Communication</p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">Notifications</h1>
        <p className="mt-2 text-sm text-slate-500">Choose which school events should have notification preferences enabled.</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Note:</strong> These are notification preferences only. Actual email and SMS delivery will work after connecting an email/SMS service in the backend.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><Megaphone size={23} /></div>
          <div>
            <h2 className="font-black text-slate-800">Notification Preferences</h2>
            <p className="text-sm text-slate-500">Enable or disable each notification channel.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-3 py-4">Notification Event</th>
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <th key={channel.id} className="px-3 py-4 text-center">
                      <span className="inline-flex items-center gap-2"><Icon size={16} />{channel.title}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-4">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                  </td>
                  {channels.map((channel) => (
                    <td key={channel.id} className="px-3 py-4 text-center">
                      <input type="checkbox" checked={Boolean(item[channel.id])}
                        onChange={() => toggle(item.id, channel.id)}
                        aria-label={`${item.title} ${channel.title}`}
                        className="h-5 w-5 cursor-pointer accent-emerald-700" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Changes are saved locally in this browser.</p>
          <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">
            <Save size={18} /> Save Preferences
          </button>
        </div>

        {saved && <p className="mt-3 text-right text-sm font-semibold text-emerald-700">Notification preferences saved.</p>}
      </div>
    </div>
  );
}
