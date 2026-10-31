"use client";

import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  BookCheck,
  ArrowUpRight,
} from "lucide-react";

const modules = [
  {
    title: "Classes",
    description: "Create and manage school classes.",
    href: "/admin/academic-setup/classes",
    icon: GraduationCap,
    countLabel: "Class Management",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Sections",
    description: "Manage sections class-wise, such as A, B and C.",
    href: "/admin/academic-setup/sections",
    icon: Users,
    countLabel: "Section Management",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Subjects",
    description: "Create subjects and maintain subject codes.",
    href: "/admin/academic-setup/subjects",
    icon: BookOpen,
    countLabel: "Subject Management",
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Class–Subject Assignment",
    description: "Assign subjects to the relevant classes.",
    href: "/admin/academic-setup/class-subjects",
    icon: BookCheck,
    countLabel: "Academic Mapping",
    color: "bg-purple-100 text-purple-700",
  },
];

export default function AcademicSetupPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            SCHOOL ADMINISTRATION
          </p>
          <h1 className="text-3xl font-bold">Academic Setup</h1>
          <p className="mt-2 text-slate-500">
            Manage classes, sections, subjects and academic assignments.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className={`rounded-xl p-3 ${module.color}`}>
                    <Icon size={25} />
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-slate-400 transition group-hover:text-emerald-700"
                  />
                </div>

                <h2 className="text-lg font-bold">{module.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {module.description}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {module.countLabel}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h2 className="font-bold text-emerald-900">How it works</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            First create classes, then add sections and subjects. After that,
            use Class–Subject Assignment to connect each subject to its class.
            Student registration, attendance and examinations can then use
            this academic information.
          </p>
        </div>
      </div>
    </main>
  );
}