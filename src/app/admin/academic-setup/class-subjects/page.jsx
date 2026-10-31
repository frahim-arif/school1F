"use client";

import AcademicCrud from "../AcademicCrud";

const fields = [
  {
    name: "classId",
    label: "Class",
    type: "select",
    required: true,
    optionsFrom: "classes",
    optionsKey: "classes",
    labelKey: "className",
  },
  {
    name: "subjectId",
    label: "Subject",
    type: "select",
    required: true,
    optionsFrom: "subjects",
    optionsKey: "subjects",
    labelKey: "name",
  },
  {
    name: "subjectType",
    label: "Assignment Type",
    type: "select",
    required: true,
    options: [
      { _id: "Compulsory", name: "Compulsory" },
      { _id: "Optional", name: "Optional" },
    ],
  },
];

export default function ClassSubjectsPage() {
  return (
    <AcademicCrud
      title="Class–Subject Assignment"
      description="Assign subjects to classes and specify whether each subject is compulsory or optional."
      resource="class-subjects"
      fields={fields}
      listKeys={["assignments", "classSubjects"]}
    />
  );
}