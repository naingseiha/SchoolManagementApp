"use client";

import React, { useState } from "react";
import { Class } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";

interface ClassFormProps {
  classData?: Class;
  onSave: (classData: Class) => void;
  onCancel: () => void;
}

export default function ClassForm({
  classData,
  onSave,
  onCancel,
}: ClassFormProps) {
  const { teachers } = useData();
  const [formData, setFormData] = useState<Class>(
    classData || {
      id: "",
      name: "",
      grade: 7,
      section: "",
      year: new Date().getFullYear(),
      level: "អនុវិទ្យាល័យ",
      classTeacherId: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass = {
      ...formData,
      id: classData?.id || `c${Date.now()}`,
    };
    onSave(newClass);
  };

  const teacherOptions = [
    { value: "", label: "ជ្រើសរើសគ្រូបង្រៀនថ្នាក់ - Select Class Teacher" },
    ...teachers
      .filter((t) => t.isClassTeacher)
      .map((t) => ({ value: t.id, label: t.name })),
  ];

  const levelOptions = [
    { value: "អនុវិទ្យាល័យ", label: "អនុវិទ្យាល័យ - Lower Secondary" },
    { value: "វិទ្យាល័យ", label: "វិទ្យាល័យ - Upper Secondary" },
  ];

  const gradeOptions = Array.from({ length: 6 }, (_, i) => ({
    value: String(i + 7),
    label: `ថ្នាក់ទី${i + 7} - Grade ${i + 7}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="ឈ្មោះថ្នាក់ Class Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="ថ្នាក់ទី៧ A"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="កម្រិតថ្នាក់ Level"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          options={levelOptions}
        />
        <Select
          label="ថ្នាក់ Grade"
          value={String(formData.grade)}
          onChange={(e) =>
            setFormData({ ...formData, grade: Number(e.target.value) })
          }
          options={gradeOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ផ្នែក Section"
          value={formData.section}
          onChange={(e) =>
            setFormData({ ...formData, section: e.target.value })
          }
          placeholder="A"
          required
        />
        <Input
          label="ឆ្នាំសិក្សា Academic Year"
          type="number"
          value={formData.year}
          onChange={(e) =>
            setFormData({ ...formData, year: Number(e.target.value) })
          }
          required
        />
      </div>

      <Select
        label="គ្រូបង្រៀនថ្នាក់ Class Teacher"
        value={formData.classTeacherId || ""}
        onChange={(e) =>
          setFormData({ ...formData, classTeacherId: e.target.value })
        }
        options={teacherOptions}
      />

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          បោះបង់ Cancel
        </Button>
        <Button type="submit">រក្សាទុក Save</Button>
      </div>
    </form>
  );
}
