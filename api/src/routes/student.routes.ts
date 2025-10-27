import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorize('ADMIN'), createStudent);
router.put('/:id', authenticate, authorize('ADMIN'), updateStudent);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStudent);

export default router;
