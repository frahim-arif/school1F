
"use client";

import Link from "next/link";
import {
  Settings,
  School,
  UsersRound,
  DatabaseBackup,
  ShieldCheck,
  Bell,
  ChevronRight,
  GraduationCap,
  SlidersHorizontal,
  LockKeyhole,
} from "lucide-react";

export default function SettingsPage() {
  const settings = [
    {
      title: "General Settings",
      desc: "Manage general school system configuration",
      icon: Settings,
      link: "/admin/settings",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "School Profile",
      desc: "Manage school information and details",
      icon: School,
      link: "/admin/settings/profile",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Academic Settings",
      desc: "Manage sessions, classes, sections and subjects",
      icon: GraduationCap,
      link: "/admin/settings/academic",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Users & Roles",
      desc: "Manage admin, teachers and staff accounts",
      icon: UsersRound,
      link: "/admin/settings/roles",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Permissions",
      desc: "Control access to dashboard modules",
      icon: LockKeyhole,
      link: "/admin/settings/permissions",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Notifications",
      desc: "Manage school alerts and notifications",
      icon: Bell,
      link: "/admin/settings/notifications",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Backup & Restore",
      desc: "Create and restore database backups",
      icon: DatabaseBackup,
      link: "/admin/settings/backup",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-800">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your school ERP configuration and preferences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "System",
            desc: "ERP configuration",
            icon: Settings,
            color: "text-indigo-600",
          },
          {
            title: "Academics",
            desc: "Academic year and classes",
            icon: GraduationCap,
            color: "text-emerald-600",
          },
          {
            title: "Security",
            desc: "Access and permissions",
            icon: ShieldCheck,
            color: "text-purple-600",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Icon size={27} className={item.color} />
              <h2 className="mt-4 font-black text-slate-800">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-black text-slate-800">
            Configuration
          </h2>
          <p className="text-sm text-slate-500">
            Select a section to manage its settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {settings.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                href={item.link}
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                      <Icon size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-800">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={21}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
