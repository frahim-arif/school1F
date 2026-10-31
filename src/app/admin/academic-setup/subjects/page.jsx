
"use client";

import AcademicCrud from "../AcademicCrud";

const fields = [
  {
    name: "name",
    label: "Subject Name",
    required: true,
    placeholder: "e.g. Mathematics",
  },
  {
    name: "code",
    label: "Subject Code",
    required: true,
    placeholder: "e.g. MATH101",
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
  {
    name: "type",
    label: "Subject Type",
    type: "select",
    required: true,
    options: [
      { _id: "Theory", name: "Theory" },
      { _id: "Practical", name: "Practical" },
    ],
  },
];

export default function SubjectsPage() {
  return (
    <AcademicCrud
      title="Subjects"
      description="Create and maintain class-wise school subjects."
      resource="subjects"
      fields={fields}
      listKeys={["subjects"]}
    />
  );
}
