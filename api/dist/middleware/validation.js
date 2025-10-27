"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = exports.validateRegister = exports.validateLogin = exports.validateAttendanceUpdate = exports.validateAttendanceCreate = exports.validateGradeUpdate = exports.validateGradeCreate = exports.validateSubjectUpdate = exports.validateSubjectCreate = exports.validateClassUpdate = exports.validateClassCreate = exports.validateTeacherUpdate = exports.validateTeacherCreate = exports.validateStudentUpdate = exports.validateStudentCreate = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Validation Error Handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Student Validations
exports.validateStudentCreate = [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('dateOfBirth').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Valid gender is required'),
    (0, express_validator_1.body)('address').optional().trim(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('classId').optional().isUUID().withMessage('Valid class ID required'),
    exports.handleValidationErrors,
];
exports.validateStudentUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid student ID required'),
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601(),
    (0, express_validator_1.body)('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
    (0, express_validator_1.body)('classId').optional().isUUID(),
    exports.handleValidationErrors,
];
// Teacher Validations
exports.validateTeacherCreate = [
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('subject').optional().trim(),
    (0, express_validator_1.body)('employeeId').optional().trim(),
    exports.handleValidationErrors,
];
exports.validateTeacherUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid teacher ID required'),
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('subject').optional().trim(),
    exports.handleValidationErrors,
];
// Class Validations
exports.validateClassCreate = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Class name is required'),
    (0, express_validator_1.body)('grade').trim().notEmpty().withMessage('Grade is required'),
    (0, express_validator_1.body)('section').optional().trim(),
    (0, express_validator_1.body)('teacherId').optional().isUUID().withMessage('Valid teacher ID required'),
    exports.handleValidationErrors,
];
exports.validateClassUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid class ID required'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('grade').optional().trim().notEmpty(),
    (0, express_validator_1.body)('section').optional().trim(),
    (0, express_validator_1.body)('teacherId').optional().isUUID(),
    exports.handleValidationErrors,
];
// Subject Validations
exports.validateSubjectCreate = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Subject name is required'),
    (0, express_validator_1.body)('code').trim().notEmpty().withMessage('Subject code is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('classId').isUUID().withMessage('Valid class ID required'),
    exports.handleValidationErrors,
];
exports.validateSubjectUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid subject ID required'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('code').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('classId').optional().isUUID(),
    exports.handleValidationErrors,
];
// Grade Validations
exports.validateGradeCreate = [
    (0, express_validator_1.body)('studentId').isUUID().withMessage('Valid student ID required'),
    (0, express_validator_1.body)('subjectId').isUUID().withMessage('Valid subject ID required'),
    (0, express_validator_1.body)('score').isFloat({ min: 0 }).withMessage('Valid score is required'),
    (0, express_validator_1.body)('maxScore').isFloat({ min: 0 }).withMessage('Valid max score is required'),
    (0, express_validator_1.body)('remarks').optional().trim(),
    exports.handleValidationErrors,
];
exports.validateGradeUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid grade ID required'),
    (0, express_validator_1.body)('score').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('maxScore').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('remarks').optional().trim(),
    exports.handleValidationErrors,
];
// Attendance Validations
exports.validateAttendanceCreate = [
    (0, express_validator_1.body)('studentId').isUUID().withMessage('Valid student ID required'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('status')
        .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
        .withMessage('Valid status is required'),
    (0, express_validator_1.body)('remarks').optional().trim(),
    exports.handleValidationErrors,
];
exports.validateAttendanceUpdate = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid attendance ID required'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    (0, express_validator_1.body)('remarks').optional().trim(),
    exports.handleValidationErrors,
];
// Auth Validations
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').trim().notEmpty().withMessage('Password is required'),
    exports.handleValidationErrors,
];
exports.validateRegister = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'])
        .withMessage('Valid role required'),
    exports.handleValidationErrors,
];
// ID Param Validation
exports.validateId = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Valid ID required'),
    exports.handleValidationErrors,
];
