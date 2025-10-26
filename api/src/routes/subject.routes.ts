import { Router } from 'express';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subject.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllSubjects);
router.get('/:id', authenticate, getSubjectById);
router.post('/', authenticate, authorize('ADMIN', 'CLASS_TEACHER'), createSubject);
router.put('/:id', authenticate, authorize('ADMIN', 'CLASS_TEACHER'), updateSubject);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSubject);

export default router;