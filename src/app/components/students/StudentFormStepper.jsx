"use client";

import {
  User,
  Users,
  GraduationCap,
  MapPin,
  FileText,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Personal",
    icon: User,
  },
  {
    id: 2,
    title: "Parents",
    icon: Users,
  },
  {
    id: 3,
    title: "Academic",
    icon: GraduationCap,
  },
  {
    id: 4,
    title: "Address",
    icon: MapPin,
  },
  {
    id: 5,
    title: "Documents",
    icon: FileText,
  },
  {
    id: 6,
    title: "Review",
    icon: CheckCircle2,
  },
];

export default function StudentFormStepper({
  currentStep = 1,
}) {
  return (
    <div className="mb-10 overflow-x-auto">
      <div className="flex min-w-max items-center">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const active = currentStep === step.id;
          const completed = currentStep > step.id;

          return (
            <div
              key={step.id}
              className="flex items-center"
            >
              <div className="flex flex-col items-center">

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition

                  ${
                    completed
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  <Icon size={24} />
                </div>

                <p
                  className={`mt-2 text-sm font-semibold

                  ${
                    active || completed
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`mx-4 h-1 w-20 rounded

                  ${
                    completed
                      ? "bg-emerald-600"
                      : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}