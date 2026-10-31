
"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Save } from "lucide-react";

const roles = ["Admin", "Principal", "Teacher", "Accountant", "Staff"];

const modules = [
  "Dashboard",
  "Students",
  "Teachers",
  "Attendance",
  "Fees & Payments",
  "Examinations",
  "Notices",
  "Events",
  "Gallery",
  "Academic Settings",
  "School Profile",
  "Users & Roles",
  "Backup & Restore",
];

const STORAGE_KEY = "school_permissions";

export default function PermissionsPage() {
  const [role, setRole] = useState("Teacher");
  const [permissions, setPermissions] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPermissions(JSON.parse(stored));
    } catch (error) {
      console.error("Permission load error:", error);
    }
  }, []);

  const togglePermission = (module) => {
    if (role === "Admin") return;

    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...(prev[role] || {}),
        [module]: !(prev[role]?.[module] ?? false),
      },
    }));

    setSaved(false);
  };

  const savePermissions = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
    setSaved(true);
  };

  const isEnabled = (module) =>
    role === "Admin" || Boolean(permissions[role]?.[module]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
          Access Control
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">
          Permissions
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage which modules each user role can access.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-bold text-slate-700">
          Select User Role
        </label>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setSaved(false);
          }}
          className="mt-2 w-full max-w-sm rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600"
        >
          {roles.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck size={23} />
          </div>
          <div>
            <h2 className="font-black text-slate-800">
              {role} Access
            </h2>
            <p className="text-sm text-slate-500">
              Enable or disable module access.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((module) => (
            <label
              key={module}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-slate-700">
                {module}
              </span>

              <input
                type="checkbox"
                checked={isEnabled(module)}
                disabled={role === "Admin"}
                onChange={() => togglePermission(module)}
                className="h-5 w-5 accent-emerald-700"
              />
            </label>
          ))}
        </div>

        {role === "Admin" && (
          <p className="mt-4 text-sm text-emerald-700">
            Admin has full access to all modules.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={savePermissions}
            disabled={role === "Admin"}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            <Save size={18} />
            Save Permissions
          </button>
        </div>

        {saved && (
          <p className="mt-3 text-right text-sm font-semibold text-emerald-700">
            Permissions saved successfully.
          </p>
        )}
      </div>
    </div>
  );
}
