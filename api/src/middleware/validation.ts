import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Validation Error Handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Student Validations
export const validateStudentCreate = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date is required'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Valid gender is required'),
  body('address').optional().trim(),
  body('phone').optional().trim(),
  body('classId').optional().isUUID().withMessage('Valid class ID required'),
  handleValidationErrors,
];

export const validateStudentUpdate = [
  param('id').isUUID().withMessage('Valid student ID required'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('classId').optional().isUUID(),
  handleValidationErrors,
];

// Teacher Validations
export const validateTeacherCreate = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  body('employeeId').optional().trim(),
  handleValidationErrors,
];

export const validateTeacherUpdate = [
  param('id').isUUID().withMessage('Valid teacher ID required'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  handleValidationErrors,
];

// Class Validations
export const validateClassCreate = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('grade').trim().notEmpty().withMessage('Grade is required'),
  body('section').optional().trim(),
  body('teacherId').optional().isUUID().withMessage('Valid teacher ID required'),
  handleValidationErrors,
];

export const validateClassUpdate = [
  param('id').isUUID().withMessage('Valid class ID required'),
  body('name').optional().trim().notEmpty(),
  body('grade').optional().trim().notEmpty(),
  body('section').optional().trim(),
  body('teacherId').optional().isUUID(),
  handleValidationErrors,
];

// Subject Validations
export const validateSubjectCreate = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('description').optional().trim(),
  body('classId').isUUID().withMessage('Valid class ID required'),
  handleValidationErrors,
];

export const validateSubjectUpdate = [
  param('id').isUUID().withMessage('Valid subject ID required'),
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('classId').optional().isUUID(),
  handleValidationErrors,
];

// Grade Validations
export const validateGradeCreate = [
  body('studentId').isUUID().withMessage('Valid student ID required'),
  body('subjectId').isUUID().withMessage('Valid subject ID required'),
  body('score').isFloat({ min: 0 }).withMessage('Valid score is required'),
  body('maxScore').isFloat({ min: 0 }).withMessage('Valid max score is required'),
  body('remarks').optional().trim(),
  handleValidationErrors,
];

export const validateGradeUpdate = [
  param('id').isUUID().withMessage('Valid grade ID required'),
  body('score').optional().isFloat({ min: 0 }),
  body('maxScore').optional().isFloat({ min: 0 }),
  body('remarks').optional().trim(),
  handleValidationErrors,
];

// Attendance Validations
export const validateAttendanceCreate = [
  body('studentId').isUUID().withMessage('Valid student ID required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status')
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
    .withMessage('Valid status is required'),
  body('remarks').optional().trim(),
  handleValidationErrors,
];

export const validateAttendanceUpdate = [
  param('id').isUUID().withMessage('Valid attendance ID required'),
  body('status')
    .optional()
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  body('remarks').optional().trim(),
  handleValidationErrors,
];

// Auth Validations
export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'])
    .withMessage('Valid role required'),
  handleValidationErrors,
];

// ID Param Validation
export const validateId = [
  param('id').isUUID().withMessage('Valid ID required'),
  handleValidationErrors,
];