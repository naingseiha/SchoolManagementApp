"use client";

import React, { useState } from "react";
import { Teacher } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface TeacherFormProps {
  teacher?: Teacher;
  onSave: (teacher: Teacher) => void;
  onCancel: () => void;
}

export default function TeacherForm({
  teacher,
  onSave,
  onCancel,
}: TeacherFormProps) {
  const [formData, setFormData] = useState<Teacher>(
    teacher || {
      id: "",
      name: "",
      phone: "",
      email: "",
      subjects: [],
      classes: [],
      isClassTeacher: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher = {
      ...formData,
      id: teacher?.id || `t${Date.now()}`,
    };
    onSave(newTeacher);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="ឈ្មោះគ្រូបង្រៀន Teacher Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="លេខទូរស័ព្ទ Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="អ៊ីមែល Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isClassTeacher"
          checked={formData.isClassTeacher}
          onChange={(e) =>
            setFormData({ ...formData, isClassTeacher: e.target.checked })
          }
          className="w-4 h-4 text-blue-600"
        />
        <label
          htmlFor="isClassTeacher"
          className="text-sm font-medium text-gray-700"
        >
          គ្រូបង្រៀនថ្នាក់ Class Teacher
        </label>
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
