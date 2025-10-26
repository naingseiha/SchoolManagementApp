"use client";

import React, { useState } from "react";
import { Teacher } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Save, X, User, Phone, Mail, Award } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានផ្ទាល់ខ្លួន • Personal Information
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            label="ឈ្មោះគ្រូបង្រៀន • Teacher Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter teacher name"
            required
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានទំនាក់ទំនង • Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="លេខទូរស័ព្ទ • Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="012 345 678"
          />
          <Input
            label="អ៊ីមែល • Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="teacher@school.com"
          />
        </div>
      </div>

      {/* Teacher Type Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ប្រភេទគ្រូបង្រៀន • Teacher Type
          </h3>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="isClassTeacher"
                checked={formData.isClassTeacher}
                onChange={(e) =>
                  setFormData({ ...formData, isClassTeacher: e.target.checked })
                }
                className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 cursor-pointer transition-all duration-200"
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                គ្រូបង្រៀនថ្នាក់ • Class Teacher
              </span>
              <p className="text-xs text-gray-600 mt-1">
                ជ្រើសរើសប្រសិនបើគ្រូនេះជាគ្រូបង្រៀនថ្នាក់ • Check if this
                teacher is a class teacher
              </p>
            </div>
            {formData.isClassTeacher && (
              <div className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full animate-scaleIn">
                Active
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <X className="w-5 h-5" />
          <span>បោះបង់ Cancel</span>
        </Button>
        <Button type="submit">
          <Save className="w-5 h-5" />
          <span>រក្សាទុក Save</span>
        </Button>
      </div>
    </form>
  );
}
