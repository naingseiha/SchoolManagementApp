"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Save, X, GraduationCap, Users, Calendar, Loader2 } from "lucide-react";
import type { Class } from "@/lib/api/classes";

interface ClassFormProps {
  classData?: Class;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ClassForm({
  classData,
  onSave,
  onCancel,
  isSubmitting = false,
}: ClassFormProps) {
  const [formData, setFormData] = useState<Partial<Class>>(
    classData || {
      name: "",
      grade: "",
      section: "",
      academicYear: "2024-2025",
      capacity: 45,
      teacherId: null,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.grade || !formData.academicYear) {
      alert("Name, grade, and academic year are required!");
      return;
    }

    const data = {
      classId: formData.classId,
      name: formData.name.trim(),
      grade: formData.grade.trim(),
      section: formData.section?.trim() || null,
      academicYear: formData.academicYear.trim(),
      capacity: formData.capacity ? parseInt(String(formData.capacity)) : null,
      teacherId: formData.teacherId || null,
    };

    console.log("✅ Submitting class data:", data);
    onSave(data);
  };

  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ • Select Grade *" },
    { value: "7", label: "ថ្នាក់ទី៧" },
    { value: "8", label: "ថ្នាក់ទី៨" },
    { value: "9", label: "ថ្នាក់ទី៩" },
    { value: "10", label: "ថ្នាក់ទី១០" },
    { value: "11", label: "ថ្នាក់ទី១១" },
    { value: "12", label: "ថ្នាក់ទី១២" },
  ];

  const sectionOptions = [
    { value: "", label: "គ្មាន • None" },
    { value: "ក", label: "ក" },
    { value: "ខ", label: "ខ" },
    { value: "គ", label: "គ" },
    { value: "ឃ", label: "ឃ" },
    { value: "ង", label: "ង" },
    { value: "ច", label: "ច" },
    { value: "ឆ", label: "ឆ" },
    { value: "ជ", label: "ជ" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Class Name */}
      <Input
        label="ឈ្មោះថ្នាក់ • Class Name *"
        icon={<GraduationCap className="w-5 h-5" />}
        value={formData.name || ""}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="ថ្នាក់ទី៧ក"
        required
      />

      {/* Grade and Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="ថ្នាក់ • Grade *"
          icon={<GraduationCap className="w-5 h-5" />}
          value={formData.grade || ""}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          options={gradeOptions}
          required
        />

        <Select
          label="ផ្នែក • Section"
          value={formData.section || ""}
          onChange={(e) =>
            setFormData({ ...formData, section: e.target.value })
          }
          options={sectionOptions}
        />
      </div>

      {/* Academic Year and Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ឆ្នាំសិក្សា • Academic Year *"
          icon={<Calendar className="w-5 h-5" />}
          value={formData.academicYear || ""}
          onChange={(e) =>
            setFormData({ ...formData, academicYear: e.target.value })
          }
          placeholder="2024-2025"
          required
        />

        <Input
          label="សមត្ថភាព • Capacity"
          icon={<Users className="w-5 h-5" />}
          type="number"
          value={formData.capacity || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              capacity: parseInt(e.target.value) || undefined,
            })
          }
          placeholder="45"
          min={1}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          icon={
            isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )
          }
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting
            ? "កំពុងរក្សាទុក..."
            : classData
            ? "កែប្រែ • Update"
            : "បង្កើត • Create"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          icon={<X className="w-5 h-5" />}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          បោះបង់ • Cancel
        </Button>
      </div>
    </form>
  );
}
