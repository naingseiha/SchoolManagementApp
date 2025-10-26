"use client";

import React, { useState } from "react";
import { Subject } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface SubjectFormProps {
  subject?: Subject;
  onSave: (subject: Subject) => void;
  onCancel: () => void;
}

export default function SubjectForm({
  subject,
  onSave,
  onCancel,
}: SubjectFormProps) {
  const [formData, setFormData] = useState<Subject>(
    subject || {
      id: "",
      name: "",
      nameEn: "",
      level: "both",
      maxScore: {
        "7": 100,
        "8": 100,
        "9": 100,
        "10": 100,
        "11": 100,
        "12": 100,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubject = {
      ...formData,
      id: subject?.id || `sub${Date.now()}`,
    };
    onSave(newSubject);
  };

  const levelOptions = [
    { value: "both", label: "ទាំងអស់ - Both Levels" },
    { value: "អនុវិទ្យាល័យ", label: "អនុវិទ្យាល័យ - Lower Secondary" },
    { value: "វិទ្យាល័យ", label: "វិទ្យាល័យ - Upper Secondary" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ឈ្មោះមុខវិជ្ជា Subject Name (Khmer)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="គណិតវិទ្យា"
          required
        />
        <Input
          label="Subject Name (English)"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          placeholder="Mathematics"
          required
        />
      </div>

      <Select
        label="កម្រិត Level"
        value={formData.level}
        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
        options={levelOptions}
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
