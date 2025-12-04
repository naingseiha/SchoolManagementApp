import React from "react";
import { Users, UserPlus, Upload, Trash2 } from "lucide-react";
import { Student } from "@/lib/api/classes";
import Button from "@/components/ui/Button";

interface StudentListTabProps {
  students: Student[];
  classId: string;
  loading?: boolean;
  onAddStudent: () => void;
  onImportStudents: () => void;
  onRemoveStudent: (studentId: string) => void;
}

export default function StudentListTab({
  students,
  classId,
  loading = false,
  onAddStudent,
  onImportStudents,
  onRemoveStudent,
}: StudentListTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">
          បញ្ជីសិស្សសរុប: {students.length} នាក់
        </h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            size="small"
            onClick={onImportStudents}
          >
            នាំចូលសិស្ស
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            size="small"
            onClick={onAddStudent}
          >
            បន្ថែមសិស្ស
          </Button>
        </div>
      </div>

      {/* Student Table */}
      {students.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  លេខសម្គាល់
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  ឈ្មោះ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  ភេទ
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  ថ្ងៃកំណើត
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  ទំនាក់ទំនង
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                  សកម្មភាព
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className={`hover:bg-purple-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-bold text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {student.studentId || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {student.khmerName ||
                        `${student.firstName} ${student.lastName}`}
                    </div>
                    {student.email && (
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        student.gender === "MALE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {student.gender === "MALE" ? "ប្រុស" : "ស្រី"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "km-KH"
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {student.phoneNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `តើអ្នកចង់ដកសិស្ស "${
                              student.khmerName || student.firstName
                            }" ចេញពីថ្នាក់នេះមែនទេ?`
                          )
                        ) {
                          onRemoveStudent(student.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="ដកចេញពីថ្នាក់"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">
            មិនទាន់មានសិស្សក្នុងថ្នាក់នេះ
          </p>
          <p className="text-gray-500 text-sm mt-2">
            ចុចប៊ូតុង "បន្ថែមសិស្ស" ឬ "នាំចូលសិស្ស" ដើម្បីបន្ថែមសិស្ស
          </p>
        </div>
      )}
    </div>
  );
}
