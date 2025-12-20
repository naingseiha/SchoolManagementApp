"use client";

import { useState } from "react";
import {
  seedDefaultSubjects,
  clearAllSubjects,
  SeedResult,
} from "@/lib/seedSubjects";
import {
  getAvailableGrades,
  getSubjectsCountByGrade,
} from "@/data/defaultSubjects";
import Button from "@/components/ui/Button";
import {
  Database,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function SeedSubjectsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const grades = getAvailableGrades();

  const handleSeed = async () => {
    if (
      !confirm(
        "តើអ្នកចង់បង្កើតមុខវិជ្ជាស្តង់ដារទាំងអស់មែនទេ?\n\nThis will create all default subjects based on Ministry standards!"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setResult(null);

    const res = await seedDefaultSubjects();
    setResult(res);
    setIsSeeding(false);
  };

  const handleClear = async () => {
    if (
      !confirm(
        "⚠️ បញ្ជាក់ការលុប!\n\nតើអ្នកពិតជាចង់លុបមុខវិជ្ជាទាំងអស់មែនទេ?\n\nThis action CANNOT be undone!"
      )
    ) {
      return;
    }

    const confirm2 = prompt('សូមវាយ "DELETE" ដើម្បីបញ្ជាក់:');
    if (confirm2 !== "DELETE") {
      alert("Cancelled.");
      return;
    }

    setIsClearing(true);
    await clearAllSubjects();
    setIsClearing(false);
    alert("✅ All subjects have been deleted!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          បង្កើតមុខវិជ្ជាស្តង់ដារ
        </h1>
        <p className="text-gray-600">
          Seed Default Subjects Based on Ministry of Education Standards
        </p>
      </div>

      {/* Subject Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          ព័ត៌មានមុខវិជ្ជា • Subjects Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {grades.map((grade) => (
            <div key={grade} className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">ថ្នាក់ទី {grade}</div>
              <div className="text-2xl font-bold text-blue-600">
                {getSubjectsCountByGrade(grade)}
              </div>
              <div className="text-xs text-gray-500">មុខវិជ្ជា</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>សំខាន់:</strong> ថ្នាក់ ១១-១២ មានពីរផ្លូវ៖ វិទ្យាសាស្ត្រ និង
            សង្គម
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">សកម្មភាព • Actions</h2>

        <div className="space-y-4">
          <Button
            onClick={handleSeed}
            disabled={isSeeding || isClearing}
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Database className="w-5 h-5" />
            {isSeeding
              ? "កំពុងបង្កើត... • Seeding..."
              : "បង្កើតមុខវិជ្ជា • Seed Subjects"}
          </Button>

          <Button
            onClick={handleClear}
            disabled={isSeeding || isClearing}
            variant="danger"
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            {isClearing
              ? "កំពុងលុប... • Clearing..."
              : "លុបមុខវិជ្ជាទាំងអស់ • Clear All Subjects"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">លទ្ធផល • Results</h2>

          <div className="space-y-3">
            {/* Success/Failure Status */}
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <div>
                <div className="font-semibold">
                  {result.success ? "✅ បញ្ចប់ដោយជោគជ័យ!" : "❌ មានបញ្ហា!"}
                </div>
                <div className="text-sm">
                  បង្កើតបាន: {result.created} | បរាជ័យ: {result.failed}
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">
                    កំហុស ({result.errors.length})
                  </span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1 ml-7">
                  {result.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
