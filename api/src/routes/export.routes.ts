import { Router } from "express";
import {
  exportStudentsByClass,
  downloadImportTemplate,
  getAvailableTemplates,
  previewExport,
} from "../controllers/export.controller";

const router = Router();

/**
 * Export Routes
 */

// Get available templates
router.get("/templates", getAvailableTemplates);

// Preview export settings
router.get("/preview/:classId", previewExport);

// Export students by class
router.post("/students/class/:classId", exportStudentsByClass);

// Download import template
router.get("/template/import", downloadImportTemplate);

export default router;
