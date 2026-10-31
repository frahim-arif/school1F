
"use client";

import AcademicCrud from "../AcademicCrud";

const fields = [
  {
    name: "name",
    label: "Section Name",
    required: true,
    placeholder: "e.g. A",
  },
  {
    name: "classId",
    label: "Class",
    type: "select",
    required: true,
    optionsFrom: "classes",
    optionsKey: "classes",
    labelKey: "name",
  },
];

export default function SectionsPage() {
  return (
    <AcademicCrud
      title="Sections"
      description="Create class-wise sections, for example A, B and C."
      resource="sections"
      fields={fields}
      listKeys={["sections"]}
    />
  );
}
