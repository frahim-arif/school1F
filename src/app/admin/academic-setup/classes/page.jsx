
"use client";

import AcademicCrud from "../AcademicCrud";

const fields = [
  {
    name: "name",
    label: "Class Name",
    required: true,
    placeholder: "e.g. Class 1",
  },
];

export default function ClassesPage() {
  return (
    <AcademicCrud
      title="Classes"
      description="Add and manage classes offered by your school."
      resource="classes"
      fields={fields}
      listKeys={["classes"]}
    />
  );
}
