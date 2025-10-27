import { Router } from 'express';
import {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByStudent,
  getAttendanceByClass,
  getAttendanceByDate,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllAttendance);
router.get('/:id', authenticate, getAttendanceById);
router.get('/student/:studentId', authenticate, getAttendanceByStudent);
router.get('/class/:classId', authenticate, getAttendanceByClass);
router.get('/date/:date', authenticate, getAttendanceByDate);
router.post('/', authenticate, authorize('ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'), createAttendance);
router.put('/:id', authenticate, authorize('ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'), updateAttendance);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAttendance);

export default router;
