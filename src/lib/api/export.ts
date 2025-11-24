import { apiClient } from "./client";

export interface ExportOptions {
  schoolName?: string;
  provinceName?: string;
  academicYear?: string;
  directorDetails?: string;
  instructorDetails?: string;
  classInstructor?: string;
  examSession?: string;
  examCode?: string;
  showExamInfo?: boolean;
  showPhoneNumber?: boolean;
  showAddress?: boolean;
  showStudentId?: boolean;
}

export interface ExportPreview {
  className: string;
  grade: string;
  section?: string;
  academicYear: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  classInstructor: string;
  suggestedFilename: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const exportApi = {
  /**
   * ✅ Export students by class to Excel
   */
  async exportStudentsByClass(
    classId: string,
    options: ExportOptions
  ): Promise<Blob> {
    try {
      // ✅ Construct URL correctly (no double /api)
      const url = `${API_BASE_URL}/export/students/class/${classId}`;

      console.log("📤 Exporting to URL:", url);
      console.log("📦 Options:", options);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        let errorMessage = "Export failed";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      console.log("✅ Export successful, blob size:", blob.size);
      return blob;
    } catch (error: any) {
      console.error("❌ Export error:", error);
      throw error;
    }
  },

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("✅ File download triggered:", filename);
  },

  async getExportPreview(classId: string): Promise<ExportPreview> {
    try {
      console.log("👁️ Getting export preview for class:", classId);

      const response = await apiClient.get<{
        success: boolean;
        data: ExportPreview;
      }>(`/export/preview/${classId}`);

      console.log("✅ Preview received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Preview error:", error);
      throw error;
    }
  },

  async downloadImportTemplate(): Promise<void> {
    try {
      console.log("📥 Downloading import template...");

      const url = `${API_BASE_URL}/export/template/import`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      this.downloadFile(blob, "Student_Import_Template.xlsx");
    } catch (error: any) {
      console.error("❌ Template download error:", error);
      throw error;
    }
  },

  async getAvailableTemplates(): Promise<string[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: string[];
      }>("/export/templates");
      return response.data;
    } catch (error: any) {
      console.error("❌ Get templates error:", error);
      return [];
    }
  },
};
