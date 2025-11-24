"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  Save,
  X,
  BookOpen,
  Hash,
  Clock,
  Calendar,
  Loader2,
  Tag,
  FileText,
  Award,
} from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

interface SubjectFormProps {
  subject?: Subject;
  onSave: (subject: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SubjectForm({
  subject,
  onSave,
  onCancel,
  isSubmitting = false,
}: SubjectFormProps) {
  const [formData, setFormData] = useState<Partial<Subject>>(
    subject || {
      name: "",
      nameKh: "",
      nameEn: "",
      code: "",
      description: "",
      grade: "",
      track: "",
      category: "social",
      weeklyHours: 0,
      annualHours: 0,
      maxScore: 100,
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Form submitted with:", formData);

    // Validate required fields
    if (!formData.nameKh || formData.nameKh.trim() === "") {
      alert("Khmer name is required / ឈ្មោះខ្មែរត្រូវតែបំពេញ");
      return;
    }

    if (!formData.code || formData.code.trim() === "") {
      alert("Subject code is required / លេខកូដត្រូវតែបំពេញ");
      return;
    }

    if (!formData.grade || formData.grade.trim() === "") {
      alert("Grade is required / ថ្នាក់ត្រូវតែបំពេញ");
      return;
    }

    const subjectData = {
      name: formData.nameKh.trim(),
      nameKh: formData.nameKh.trim(),
      nameEn: formData.nameEn?.trim() || undefined,
      code: formData.code.trim(),
      description: formData.description?.trim() || undefined,
      grade: formData.grade.trim(),
      track: formData.track?.trim() || undefined,
      category: formData.category || "core",
      weeklyHours: parseFloat(String(formData.weeklyHours)) || 0,
      annualHours: parseInt(String(formData.annualHours)) || 0,
      maxScore: parseInt(String(formData.maxScore)) || 100,
      isActive: formData.isActive !== false,
    };

    console.log("✅ Sending subject data:", subjectData);
    onSave(subjectData);
  };

  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសថ្នាក់ • Select Grade *" },
    { value: "7", label: "ថ្នាក់ទី៧ • Grade 7" },
    { value: "8", label: "ថ្នាក់ទី៨ • Grade 8" },
    { value: "9", label: "ថ្នាក់ទី៩ • Grade 9" },
    { value: "10", label: "ថ្នាក់ទី១០ • Grade 10" },
    { value: "11", label: "ថ្នាក់ទី១១ • Grade 11" },
    { value: "12", label: "ថ្នាក់ទី១២ • Grade 12" },
  ];

  const trackOptions = [
    { value: "", label: "គ្មាន • None" },
    { value: "science", label: "វិទ្យាសាស្ត្រ • Science" },
    { value: "social", label: "សង្គម • Social" },
  ];

  const categoryOptions = [
    { value: "social", label: "សង្គម • Social" },
    { value: "science", label: "វិទ្យាសាស្ត្រ • Science" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ឈ្មោះមុខវិជ្ជា (ខ្មែរ) • Khmer Name *"
          icon={<BookOpen className="w-5 h-5" />}
          value={formData.nameKh || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              nameKh: e.target.value,
              name: e.target.value || formData.name,
            });
          }}
          placeholder="គណិតវិទ្យា"
          required
        />

        <Input
          label="ឈ្មោះមុខវិជ្ជា (អង់គ្លេស) • English Name"
          icon={<BookOpen className="w-5 h-5" />}
          value={formData.nameEn || ""}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          placeholder="Mathematics"
        />
      </div>

      {/* Code and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="លេខកូដ • Subject Code *"
          icon={<Hash className="w-5 h-5" />}
          value={formData.code || ""}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="MATH-G10"
          required
        />

        <Select
          label="ប្រភេទ • Category"
          icon={<Tag className="w-5 h-5" />}
          value={formData.category || "core"}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          options={categoryOptions}
        />
      </div>

      {/* Grade and Track */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="ថ្នាក់ • Grade *"
          icon={<Calendar className="w-5 h-5" />}
          value={formData.grade || ""}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          options={gradeOptions}
          required
        />

        <Select
          label="ផ្លូវសិក្សា • Track (ថ្នាក់ ១១-១២)"
          icon={<FileText className="w-5 h-5" />}
          value={formData.track || ""}
          onChange={(e) => setFormData({ ...formData, track: e.target.value })}
          options={trackOptions}
        />
      </div>

      {/* Max Score and Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="ពិន្ទុអតិបរមា • Max Score *"
          icon={<Award className="w-5 h-5" />}
          type="number"
          value={formData.maxScore || 100}
          onChange={(e) =>
            setFormData({ ...formData, maxScore: parseInt(e.target.value) })
          }
          placeholder="100"
          min={0}
          required
        />

        <Input
          label="ម៉ោង/សប្តាហ៍ • Weekly Hours"
          icon={<Clock className="w-5 h-5" />}
          type="number"
          value={formData.weeklyHours || 0}
          onChange={(e) =>
            setFormData({
              ...formData,
              weeklyHours: parseFloat(e.target.value),
            })
          }
          placeholder="4"
          step="0.5"
          min={0}
        />

        <Input
          label="ម៉ោង/ឆ្នាំ • Annual Hours"
          icon={<Clock className="w-5 h-5" />}
          type="number"
          value={formData.annualHours || 0}
          onChange={(e) =>
            setFormData({ ...formData, annualHours: parseInt(e.target.value) })
          }
          placeholder="120"
          min={0}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ការពណ៌នា • Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="មុខវិជ្ជាគណិតវិទ្យាសម្រាប់ថ្នាក់ទី១០..."
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive !== false}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          ប្រើប្រាស់ • Active Subject
        </label>
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
            : subject
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
