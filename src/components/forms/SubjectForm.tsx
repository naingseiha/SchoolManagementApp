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
} from "lucide-react";
import type { Subject } from "@/lib/api/subjects";

interface SubjectFormProps {
  subject?: Subject;
  onSave: (subject: Subject) => void;
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
      category: "core",
      weeklyHours: 0,
      annualHours: 0,
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Form submitted with:", formData);

    // Validate required fields
    if (!formData.name || formData.name.trim() === "") {
      alert("Subject name is required / ឈ្មោះមុខវិជ្ជាត្រូវតែបំពេញ");
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

    const subjectData: Subject = {
      id: subject?.id || `s${Date.now()}`,
      name: formData.name.trim(),
      nameKh: formData.nameKh?.trim() || undefined,
      nameEn: formData.nameEn?.trim() || undefined,
      code: formData.code.trim(),
      description: formData.description?.trim() || undefined,
      grade: formData.grade.trim(),
      track: formData.track?.trim() || undefined,
      category: formData.category || "core",
      weeklyHours: parseFloat(String(formData.weeklyHours)) || 0,
      annualHours: parseInt(String(formData.annualHours)) || 0,
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
    { value: "", label: "មិនមានផ្លូវ • No Track" },
    { value: "science", label: "វិទ្យាសាស្ត្រ • Science Track" },
    { value: "social", label: "សង្គមវិទ្យា • Social Track" },
  ];

  const categoryOptions = [
    { value: "core", label: "មូលដ្ឋាន • Core" },
    { value: "science", label: "វិទ្យាសាស្ត្រ • Science" },
    { value: "social", label: "សង្គម • Social Studies" },
    { value: "arts", label: "សិល្បៈ • Arts" },
    { value: "technology", label: "បច្ចេកវិទ្យា • Technology" },
    { value: "other", label: "ផ្សេងៗ • Other" },
  ];

  // Show track selection only for grades 10-12
  const showTrack =
    formData.grade && ["10", "11", "12"].includes(formData.grade);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានមូលដ្ឋាន • Basic Information
          </h3>
        </div>

        <div className="space-y-4">
          {/* Subject Name (Combined) */}
          <div className="relative group">
            <Input
              label="ឈ្មោះមុខវិជ្ជា (ខ្មែរ • អង់គ្លេស) • Subject Name *"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., គណិតវិទ្យា • Mathematics"
              required
              className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Optional: Separate Khmer and English names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <Input
                label="ឈ្មោះជាភាសាខ្មែរ • Khmer Name (Optional)"
                value={formData.nameKh || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nameKh: e.target.value })
                }
                placeholder="គណិតវិទ្យា"
                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative group">
              <Input
                label="ឈ្មោះជាភាសាអង់គ្លេស • English Name (Optional)"
                value={formData.nameEn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                placeholder="Mathematics"
                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 english-modern"
              />
            </div>
          </div>

          {/* Code */}
          <div className="relative group">
            <div className="absolute left-3 top-9 z-10">
              <Hash className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
            </div>
            <Input
              label="លេខកូដមុខវិជ្ជា • Subject Code *"
              value={formData.code || ""}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="e.g., G7-MATH-001"
              required
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Description */}
          <div className="relative group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ការពិពណ៌នា • Description (Optional)
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter subject description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Grade and Category Section */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ថ្នាក់ និងប្រភេទ • Grade & Category
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="ថ្នាក់ • Grade *"
              value={formData.grade || ""}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              options={gradeOptions}
              required
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />

            <Select
              label="ប្រភេទ • Category"
              value={formData.category || "core"}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={categoryOptions}
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Track (only for grades 10-12) */}
          {showTrack && (
            <Select
              label="ផ្លូវសិក្សា • Academic Track (Grade 10-12 only)"
              value={formData.track || ""}
              onChange={(e) =>
                setFormData({ ...formData, track: e.target.value })
              }
              options={trackOptions}
              className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Hours Section */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ម៉ោងសិក្សា • Study Hours
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute left-3 top-9 z-10">
              <Clock className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
            </div>
            <Input
              label="ម៉ោង/សប្តាហ៍ • Weekly Hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.weeklyHours || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyHours: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 6"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-3 top-9 z-10">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
            </div>
            <Input
              label="ម៉ោង/ឆ្នាំ • Annual Hours"
              type="number"
              min="0"
              value={formData.annualHours || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  annualHours: parseInt(e.target.value) || 0,
                })
              }
              placeholder="e.g., 192"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive !== false}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              សកម្ម • Active Subject
            </span>
            <p className="text-xs text-gray-600">
              ធីកប្រអប់នេះ ប្រសិនបើមុខវិជ្ជានេះកំពុងប្រើប្រាស់
            </p>
          </div>
        </label>
      </div>

      {/* Preview Section */}
      {formData.name && formData.code && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 p-4 border-2 border-purple-200 shadow-inner">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full opacity-20 -ml-12 -mb-12"></div>

          <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <span className="text-lg">👁️</span>
            ការមើលជាមុន • Preview
          </h4>
          <div className="space-y-2 text-sm relative z-10">
            <div className="flex items-start gap-2">
              <span className="font-medium text-purple-700 min-w-[120px]">
                ឈ្មោះ:
              </span>
              <span className="text-gray-900 font-semibold">
                {formData.name}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-purple-700 min-w-[120px]">
                លេខកូដ:
              </span>
              <span className="text-gray-900 font-mono">{formData.code}</span>
            </div>
            {formData.grade && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-700 min-w-[120px]">
                  ថ្នាក់:
                </span>
                <span className="text-gray-900">
                  ថ្នាក់ទី {formData.grade}
                  {formData.track &&
                    ` • ${
                      formData.track === "science"
                        ? "វិទ្យាសាស្ត្រ"
                        : "សង្គមវិទ្យា"
                    }`}
                </span>
              </div>
            )}
            {formData.category && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-700 min-w-[120px]">
                  ប្រភេទ:
                </span>
                <span className="text-gray-900">
                  {
                    categoryOptions.find((c) => c.value === formData.category)
                      ?.label
                  }
                </span>
              </div>
            )}
            {(formData.weeklyHours || formData.annualHours) && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-700 min-w-[120px]">
                  ម៉ោង:
                </span>
                <span className="text-gray-900">
                  {formData.weeklyHours}h/សប្តាហ៍ • {formData.annualHours}
                  h/ឆ្នាំ
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <details className="bg-gray-50 rounded-lg p-3 text-xs">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
          🐛 Debug Info (Developer Only)
        </summary>
        <pre className="mt-2 text-[10px] overflow-auto bg-white p-2 rounded border border-gray-200">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="group hover:scale-105 transition-transform duration-300"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>បោះបង់ Cancel</span>
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="group hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>{subject ? "រក្សាទុក Update" : "បង្កើត Create"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
