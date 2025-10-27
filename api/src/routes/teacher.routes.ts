import { Router } from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllTeachers);
router.get('/:id', authenticate, getTeacherById);
router.post('/', authenticate, authorize('ADMIN'), createTeacher);
router.put('/:id', authenticate, authorize('ADMIN'), updateTeacher);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTeacher);

export default router;
