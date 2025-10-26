"use client";

import React, { useState } from "react";
import { Student } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";

interface StudentFormProps {
  student?: Student;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentForm({
  student,
  onSave,
  onCancel,
}: StudentFormProps) {
  const { classes } = useData();
  const [formData, setFormData] = useState<Student>(
    student || {
      id: "",
      firstName: "",
      lastName: "",
      gender: "male",
      dateOfBirth: "",
      classId: "",
      phone: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent = {
      ...formData,
      id: student?.id || `s${Date.now()}`,
    };
    onSave(newStudent);
  };

  const classOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ - Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const genderOptions = [
    { value: "male", label: "ប្រុស - Male" },
    { value: "female", label: "ស្រី - Female" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="គោត្តនាម Last Name"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
        />
        <Input
          label="នាម First Name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="ភេទ Gender"
          value={formData.gender}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as "male" | "female",
            })
          }
          options={genderOptions}
        />
        <Input
          label="ថ្ងៃខែឆ្នាំកំណើត Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
          required
        />
      </div>

      <Select
        label="ថ្នាក់រៀន Class"
        value={formData.classId}
        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
        options={classOptions}
        required
      />

      <Input
        label="លេខទូរស័ព្ទ Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      <Input
        label="អាសយដ្ឋាន Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ឈ្មោះអាណាព្យាបាល Guardian Name"
          value={formData.guardianName}
          onChange={(e) =>
            setFormData({ ...formData, guardianName: e.target.value })
          }
        />
        <Input
          label="លេខទូរស័ព្ទអាណាព្យាបាល Guardian Phone"
          value={formData.guardianPhone}
          onChange={(e) =>
            setFormData({ ...formData, guardianPhone: e.target.value })
          }
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          បោះបង់ Cancel
        </Button>
        <Button type="submit">រក្សាទុក Save</Button>
      </div>
    </form>
  );
}
