import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface GradeImportDialogProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  onSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  totalStudents: number;
  importedStudents: number;
  errorStudents: number;
  errors: Array<{
    row: number;
    studentName: string;
    error: string;
  }>;
  summary: {
    month: string;
    year: number;
    classId: string;
    className: string;
  };
}

export default function GradeImportDialog({
  open,
  onClose,
  classId,
  className,
  onSuccess,
}: GradeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("សូមជ្រើសរើសឯកសារ Excel");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `http://localhost:5001/api/grades/import/${classId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);

      if (response.data.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.response?.data?.message || "មានបញ្ហាក្នុងការនាំចូលពិន្ទុ");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            នាំចូលពិន្ទុ • Import Grades
          </DialogTitle>
          <DialogDescription>
            នាំចូលពិន្ទុសិស្សពី Excel សម្រាប់ {className}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="grade-file">ជ្រើសរើសឯកសារ Excel</Label>
            <div className="flex gap-2">
              <Input
                id="grade-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={loading}
                >
                  Clear
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-gray-600">
                ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success/Result Alert */}
          {result && (
            <div className="space-y-4">
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={result.success ? "border-green-500 bg-green-50" : ""}
              >
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="font-medium mb-2">
                    {result.success
                      ? "✅ នាំចូលពិន្ទុជោគជ័យ!"
                      : "⚠️ នាំចូលពិន្ទុមានបញ្ហា"}
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      📅 ខែ: {result.summary.month} {result.summary.year}
                    </p>
                    <p>👥 សិស្សសរុប: {result.totalStudents} នាក់</p>
                    <p className="text-green-600">
                      ✓ ជោគជ័យ: {result.importedStudents} នាក់
                    </p>
                    {result.errorStudents > 0 && (
                      <p className="text-red-600">
                        ✗ មានកំហុស: {result.errorStudents} នាក់
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold mb-2 text-red-600">
                    បញ្ជីកំហុស:
                  </h4>
                  <div className="space-y-2">
                    {result.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="text-sm p-2 bg-red-50 rounded border border-red-200"
                      >
                        <span className="font-medium">
                          Row {err.row}: {err.studentName}
                        </span>
                        <p className="text-red-700 mt-1">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-900">
                📋 មគ្គុទ្ទេសក៍:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>ឯកសារត្រូវតែជា Excel format (.xlsx, .xls)</li>
                <li>ឯកសារត្រូវមានទម្រង់តាមគំរូដែលកំណត់</li>
                <li>ពិន្ទុត្រូវតែជាលេខ និងស្ថិតក្នុងដែនកំណត់</li>
                <li>ឈ្មោះសិស្សត្រូវតែត្រូវគ្នាជាមួយក្នុង database</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              បិទ
            </Button>
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  កំពុងនាំចូល...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  នាំចូល Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
