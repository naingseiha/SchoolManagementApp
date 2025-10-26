import { Router } from 'express';
import {
  getAllGrades,
  getGradeById,
  getGradesByStudent,
  getGradesByClass,
  getGradesBySubject,
  createGrade,
  updateGrade,
  deleteGrade,
} from '../controllers/grade.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllGrades);
router.get('/:id', authenticate, getGradeById);
router.get('/student/:studentId', authenticate, getGradesByStudent);
router.get('/class/:classId', authenticate, getGradesByClass);
router.get('/subject/:subjectId', authenticate, getGradesBySubject);
router.post('/', authenticate, authorize('ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'), createGrade);
router.put('/:id', authenticate, authorize('ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'), updateGrade);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteGrade);

export default router;