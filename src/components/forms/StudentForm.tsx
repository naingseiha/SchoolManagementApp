"use client";

import React, { useState } from "react";
import { Student } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { Save, X, User, Calendar, Phone, MapPin, Users } from "lucide-react";

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
    { value: "", label: "ជ្រើសរើសថ្នាក់ • Select Class" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const genderOptions = [
    { value: "male", label: "ប្រុស • Male" },
    { value: "female", label: "ស្រី • Female" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានផ្ទាល់ខ្លួន • Personal Information
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="គោត្តនាម • Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Enter last name"
              required
            />
            <Input
              label="នាម • First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="ភេទ • Gender"
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
              label="ថ្ងៃខែឆ្នាំកំណើត • Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានសិក្សា • Academic Information
          </h3>
        </div>

        <Select
          label="ថ្នាក់រៀន • Class"
          value={formData.classId}
          onChange={(e) =>
            setFormData({ ...formData, classId: e.target.value })
          }
          options={classOptions}
          required
        />
      </div>

      {/* Contact Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានទំនាក់ទំនង • Contact Information
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            label="លេខទូរស័ព្ទ • Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="012 345 678"
          />

          <Input
            label="អាសយដ្ឋាន • Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Enter address"
          />
        </div>
      </div>

      {/* Guardian Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ព័ត៌មានអាណាព្យាបាល • Guardian Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ឈ្មោះអាណាព្យាបាល • Guardian Name"
            value={formData.guardianName}
            onChange={(e) =>
              setFormData({ ...formData, guardianName: e.target.value })
            }
            placeholder="Enter guardian name"
          />
          <Input
            label="លេខទូរស័ព្ទអាណាព្យាបាល • Guardian Phone"
            value={formData.guardianPhone}
            onChange={(e) =>
              setFormData({ ...formData, guardianPhone: e.target.value })
            }
            placeholder="012 345 678"
          />
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
