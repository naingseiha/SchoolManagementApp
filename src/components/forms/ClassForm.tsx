"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { Save, X, GraduationCap, UserCheck, Hash, Loader2 } from "lucide-react";
import type { Class } from "@/lib/api/classes";

interface ClassFormProps {
  classData?: Class;
  onSave: (classData: Class) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ClassForm({
  classData,
  onSave,
  onCancel,
  isSubmitting = false,
}: ClassFormProps) {
  const { teachers } = useData();

  const [formData, setFormData] = useState<Partial<Class>>(
    classData || {
      name: "",
      grade: "",
      section: "",
      teacherId: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || formData.name.trim() === "") {
      alert("Class name is required / ឈ្មោះថ្នាក់ត្រូវតែបំពេញ");
      return;
    }

    if (!formData.grade || formData.grade.trim() === "") {
      alert("Grade is required / កម្រិតថ្នាក់ត្រូវតែបំពេញ");
      return;
    }

    const classDataToSave: Class = {
      id: classData?.id || `c${Date.now()}`,
      name: formData.name.trim(),
      grade: formData.grade.trim(),
      section: formData.section?.trim() || undefined,
      teacherId:
        formData.teacherId && formData.teacherId.trim() !== ""
          ? formData.teacherId
          : undefined,
    };

    console.log("✅ Saving class data:", classDataToSave);
    onSave(classDataToSave);
  };

  // Generate class name suggestions based on grade and section
  const generateClassName = () => {
    if (formData.grade) {
      const gradeName = `Grade ${formData.grade}`;
      const sectionName = formData.section ? ` ${formData.section}` : "";
      return `${gradeName}${sectionName}`;
    }
    return "";
  };

  const handleAutoGenerateName = () => {
    const generated = generateClassName();
    if (generated) {
      setFormData({ ...formData, name: generated });
    }
  };

  const teacherOptions = [
    { value: "", label: "មិនទាន់កំណត់ • Not assigned (Optional)" },
    ...teachers.map((t) => ({
      value: t.id,
      label: `${t.name} - ${t.subject || "General"}`,
    })),
  ];

  const gradeOptions = [
    { value: "", label: "ជ្រើសរើសកម្រិតថ្នាក់ • Select grade" },
    { value: "1", label: "Grade 1 • ថ្នាក់ទី១" },
    { value: "2", label: "Grade 2 • ថ្នាក់ទី២" },
    { value: "3", label: "Grade 3 • ថ្នាក់ទី៣" },
    { value: "4", label: "Grade 4 • ថ្នាក់ទី៤" },
    { value: "5", label: "Grade 5 • ថ្នាក់ទី៥" },
    { value: "6", label: "Grade 6 • ថ្នាក់ទី៦" },
    { value: "7", label: "Grade 7 • ថ្នាក់ទី៧" },
    { value: "8", label: "Grade 8 • ថ្នាក់ទី៨" },
    { value: "9", label: "Grade 9 • ថ្នាក់ទី៩" },
    { value: "10", label: "Grade 10 • ថ្នាក់ទី១០" },
    { value: "11", label: "Grade 11 • ថ្នាក់ទី១១" },
    { value: "12", label: "Grade 12 • ថ្នាក់ទី១២" },
  ];

  const sectionOptions = [
    { value: "", label: "គ្មាន • None (Optional)" },
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" },
    { value: "D", label: "Section D" },
    { value: "E", label: "Section E" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Class Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានថ្នាក់ • Class Information
          </h3>
        </div>

        <div className="space-y-4">
          {/* Grade and Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="កម្រិតថ្នាក់ • Grade *"
              value={formData.grade || ""}
              onChange={(e) => {
                setFormData({ ...formData, grade: e.target.value });
              }}
              options={gradeOptions}
              required
            />
            <Select
              label="ផ្នែក • Section (Optional)"
              value={formData.section || ""}
              onChange={(e) =>
                setFormData({ ...formData, section: e.target.value })
              }
              options={sectionOptions}
            />
          </div>

          {/* Class Name with Auto-generate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                ឈ្មោះថ្នាក់ • Class Name *
              </label>
              {formData.grade && (
                <button
                  type="button"
                  onClick={handleAutoGenerateName}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  🪄 បង្កើតស្វ័យប្រវត្តិ Auto-generate
                </button>
              )}
            </div>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Grade 7A, ថ្នាក់ទី៧ A"
              required
            />
            {formData.grade && !formData.name && (
              <p className="text-xs text-gray-500 mt-1">
                💡 ណែនាំ: {generateClassName()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Assignment Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            គ្រូប្រចាំថ្នាក់ • Class Teacher
          </h3>
        </div>

        <Select
          label="ជ្រើសរើសគ្រូប្រចាំថ្នាក់ • Select Class Teacher (Optional)"
          value={formData.teacherId || ""}
          onChange={(e) =>
            setFormData({ ...formData, teacherId: e.target.value })
          }
          options={teacherOptions}
        />

        <p className="text-xs text-gray-500 mt-2">
          💡 អ្នកអាចកំណត់គ្រូប្រចាំថ្នាក់នៅពេលក្រោយបាន
          <br />
          You can assign a class teacher later.
        </p>
      </div>

      {/* Preview Section */}
      {formData.name && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            👁️ ការមើលជាមុន • Preview:
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">ឈ្មោះថ្នាក់:</span>{" "}
              <span className="text-gray-900">{formData.name}</span>
            </p>
            <p>
              <span className="font-medium">កម្រិត:</span>{" "}
              <span className="text-gray-900">Grade {formData.grade}</span>
              {formData.section && (
                <span className="text-gray-900">
                  {" "}
                  • Section {formData.section}
                </span>
              )}
            </p>
            <p>
              <span className="font-medium">គ្រូប្រចាំថ្នាក់:</span>{" "}
              <span className="text-gray-900 english-modern">
                {formData.teacherId
                  ? teachers.find((t) => t.id === formData.teacherId)?.name ||
                    "Unknown"
                  : "មិនទាន់កំណត់ Not assigned"}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Debug Info (Remove in production) */}
      <div className="bg-gray-50 p-3 rounded text-xs">
        <strong>Debug Info:</strong>
        <pre className="mt-1 text-[10px] overflow-auto">
          {JSON.stringify(
            {
              name: formData.name,
              grade: formData.grade,
              section: formData.section,
              teacherId: formData.teacherId,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
          <span>បោះបង់ Cancel</span>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{classData ? "រក្សាទុក Update" : "បង្កើត Create"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
