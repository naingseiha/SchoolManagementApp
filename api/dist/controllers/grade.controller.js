"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGrade = exports.updateGrade = exports.createGrade = exports.getGradesBySubject = exports.getGradesByClass = exports.getGradesByStudent = exports.getGradeById = exports.getAllGrades = exports.GradeController = void 0;
const client_1 = require("@prisma/client");
const grade_import_service_1 = require("../services/grade-import.service");
const grade_calculation_service_1 = require("../services/grade-calculation.service");
const multer_1 = __importDefault(require("multer"));
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
// Configure multer for file upload
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
class GradeController {
    /**
     * Upload and import grades from Excel
     */
    static async importGrades(req, res) {
        try {
            const { classId } = req.params;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }
            console.log(`📤 Importing grades for class: ${classId}`);
            const result = await grade_import_service_1.GradeImportService.importGrades(classId, req.file.buffer);
            return res.status(result.success ? 200 : 207).json(result);
        }
        catch (error) {
            console.error("❌ Grade import error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to import grades",
            });
        }
    }
    /**
     * Get grades by month
     */
    static async getGradesByMonth(req, res) {
        try {
            const { classId } = req.params;
            const { month, year } = req.query;
            const grades = await prisma.grade.findMany({
                where: {
                    classId,
                    month: month,
                    year: parseInt(year),
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            khmerName: true,
                            firstName: true,
                            lastName: true,
                            gender: true,
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            nameKh: true,
                            nameEn: true,
                            code: true,
                            maxScore: true,
                            coefficient: true,
                        },
                    },
                },
                orderBy: [{ student: { khmerName: "asc" } }],
            });
            return res.json({
                success: true,
                data: grades,
            });
        }
        catch (error) {
            console.error("❌ Get grades error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get grades",
            });
        }
    }
    /**
     * Get monthly summary for a class
     */
    static async getMonthlySummary(req, res) {
        try {
            const { classId } = req.params;
            const { month, year } = req.query;
            const summaries = await prisma.studentMonthlySummary.findMany({
                where: {
                    classId,
                    month: month,
                    year: parseInt(year),
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            khmerName: true,
                            firstName: true,
                            lastName: true,
                            gender: true,
                        },
                    },
                },
                orderBy: [{ classRank: "asc" }],
            });
            return res.json({
                success: true,
                data: summaries,
            });
        }
        catch (error) {
            console.error("❌ Get summary error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get summary",
            });
        }
    }
    // ==================== NEW: GRID DATA & BULK SAVE ====================
    /**
     * Get grades in grid format for Excel-like editing
     */
    // Update the getGradesGrid method in GradeController class
    /**
     * Get grades in grid format for Excel-like editing
     */
    // Update getSubjectOrder function in getGradesGrid method
    // Update getGradesGrid method - Calculate Total Coefficients from ALL subjects
    // Update getGradesGrid method in GradeController class
    static async getGradesGrid(req, res) {
        try {
            const { classId } = req.params;
            const { month, year } = req.query;
            // Get class with students
            const classData = await prisma.class.findUnique({
                where: { id: classId },
                include: {
                    students: {
                        orderBy: { khmerName: "asc" },
                    },
                },
            });
            if (!classData) {
                return res.status(404).json({
                    success: false,
                    message: "Class not found",
                });
            }
            // Define subject order and codes by grade
            const getSubjectOrder = (grade) => {
                const gradeNum = parseInt(grade);
                // Grades 7, 8
                if (gradeNum === 7 || gradeNum === 8) {
                    return {
                        WRITER: { order: 1, shortCode: "W" },
                        WRITING: { order: 2, shortCode: "R" },
                        DICTATION: { order: 3, shortCode: "D" },
                        MATH: { order: 4, shortCode: "M" },
                        PHY: { order: 5, shortCode: "P" },
                        CHEM: { order: 6, shortCode: "C" },
                        BIO: { order: 7, shortCode: "B" },
                        EARTH: { order: 8, shortCode: "Es" },
                        MORAL: { order: 9, shortCode: "Mo" },
                        GEO: { order: 10, shortCode: "G" },
                        HIST: { order: 11, shortCode: "H" },
                        ENG: { order: 12, shortCode: "E" },
                        HE: { order: 13, shortCode: "He" },
                        HLTH: { order: 14, shortCode: "Hl" },
                        SPORTS: { order: 15, shortCode: "S" },
                        AGRI: { order: 16, shortCode: "Ag" },
                        ICT: { order: 17, shortCode: "IT" },
                    };
                }
                // Grade 9
                if (gradeNum === 9) {
                    return {
                        WRITER: { order: 1, shortCode: "W" },
                        WRITING: { order: 2, shortCode: "R" },
                        DICTATION: { order: 3, shortCode: "D" },
                        MATH: { order: 4, shortCode: "M" },
                        PHY: { order: 5, shortCode: "P" },
                        CHEM: { order: 6, shortCode: "C" },
                        BIO: { order: 7, shortCode: "B" },
                        EARTH: { order: 8, shortCode: "Es" },
                        MORAL: { order: 9, shortCode: "Mo" },
                        GEO: { order: 10, shortCode: "G" },
                        HIST: { order: 11, shortCode: "H" },
                        ENG: { order: 12, shortCode: "E" },
                        KHM: { order: 13, shortCode: "K" },
                        ECON: { order: 14, shortCode: "Ec" },
                        HLTH: { order: 15, shortCode: "Hl" },
                        HE: { order: 16, shortCode: "He" },
                        SPORTS: { order: 17, shortCode: "S" },
                        AGRI: { order: 18, shortCode: "Ag" },
                        ICT: { order: 19, shortCode: "IT" },
                    };
                }
                // Grades 10, 11, 12
                return {
                    KHM: { order: 1, shortCode: "K" },
                    MATH: { order: 2, shortCode: "M" },
                    PHY: { order: 3, shortCode: "P" },
                    CHEM: { order: 4, shortCode: "C" },
                    BIO: { order: 5, shortCode: "B" },
                    EARTH: { order: 6, shortCode: "Es" },
                    MORAL: { order: 7, shortCode: "Mo" },
                    GEO: { order: 8, shortCode: "G" },
                    HIST: { order: 9, shortCode: "H" },
                    ENG: { order: 10, shortCode: "E" },
                    ECON: { order: 11, shortCode: "Ec" },
                    HLTH: { order: 12, shortCode: "Hl" },
                    SPORTS: { order: 13, shortCode: "S" },
                    AGRI: { order: 14, shortCode: "Ag" },
                    ICT: { order: 15, shortCode: "IT" },
                };
            };
            const subjectOrder = getSubjectOrder(classData.grade);
            // ✅ FIXED: Filter subjects by grade AND track
            const whereClause = {
                grade: classData.grade,
                isActive: true,
            };
            // ✅ For Grade 11 & 12, filter by track
            const gradeNum = parseInt(classData.grade);
            if ((gradeNum === 11 || gradeNum === 12) && classData.track) {
                whereClause.OR = [
                    { track: classData.track }, // Subjects specific to this track
                    { track: null }, // Common subjects (for both tracks)
                    { track: "common" }, // Common subjects (explicit)
                ];
                console.log(`📚 Filtering subjects for Grade ${classData.grade} - Track: ${classData.track}`);
            }
            const subjects = await prisma.subject.findMany({
                where: whereClause,
            });
            console.log(`✅ Found ${subjects.length} subjects for grade ${classData.grade}${classData.track ? ` (${classData.track})` : ""}`);
            // Sort subjects by order
            const sortedSubjects = subjects
                .map((subject) => {
                const baseCode = subject.code.split("-")[0];
                const orderInfo = subjectOrder[baseCode] || {
                    order: 999,
                    shortCode: subject.code,
                };
                return {
                    ...subject,
                    displayOrder: orderInfo.order,
                    shortCode: orderInfo.shortCode,
                };
            })
                .sort((a, b) => a.displayOrder - b.displayOrder);
            // ✅ CALCULATE TOTAL COEFFICIENTS FROM ALL SUBJECTS
            const totalCoefficientForClass = sortedSubjects.reduce((sum, subject) => sum + subject.coefficient, 0);
            // Get existing grades
            const existingGrades = await prisma.grade.findMany({
                where: {
                    classId,
                    month: month,
                    year: parseInt(year),
                },
            });
            // Build grid data with calculations
            const gridData = classData.students.map((student) => {
                const studentGrades = {};
                let totalScore = 0;
                let totalMaxScore = 0;
                sortedSubjects.forEach((subject) => {
                    const grade = existingGrades.find((g) => g.studentId === student.id && g.subjectId === subject.id);
                    const score = grade?.score || null;
                    if (score !== null) {
                        totalScore += score;
                        totalMaxScore += subject.maxScore;
                    }
                    studentGrades[subject.id] = {
                        id: grade?.id || null,
                        score,
                        maxScore: subject.maxScore,
                        coefficient: subject.coefficient,
                        isSaved: !!grade,
                    };
                });
                const average = totalCoefficientForClass > 0
                    ? totalScore / totalCoefficientForClass
                    : 0;
                let gradeLevel = "F";
                if (average >= 90)
                    gradeLevel = "A";
                else if (average >= 80)
                    gradeLevel = "B+";
                else if (average >= 70)
                    gradeLevel = "B";
                else if (average >= 60)
                    gradeLevel = "C";
                else if (average >= 50)
                    gradeLevel = "D";
                else if (average >= 40)
                    gradeLevel = "E";
                return {
                    studentId: student.id,
                    studentName: student.khmerName || `${student.lastName} ${student.firstName}`,
                    gender: student.gender,
                    grades: studentGrades,
                    totalScore: totalScore.toFixed(2),
                    totalMaxScore,
                    totalCoefficient: totalCoefficientForClass.toFixed(2),
                    average: average.toFixed(2),
                    gradeLevel,
                    absent: 0,
                    permission: 0,
                };
            });
            // Calculate ranks
            const rankedData = gridData
                .slice()
                .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
                .map((student, index) => ({
                ...student,
                rank: index + 1,
            }));
            // Restore original order with ranks
            const finalData = gridData.map((student) => {
                const ranked = rankedData.find((r) => r.studentId === student.studentId);
                return { ...student, rank: ranked?.rank || 0 };
            });
            return res.json({
                success: true,
                data: {
                    classId: classData.id,
                    className: classData.name,
                    grade: classData.grade,
                    track: classData.track || null, // ✅ Include track in response
                    month: month,
                    year: parseInt(year),
                    totalCoefficient: totalCoefficientForClass,
                    subjects: sortedSubjects.map((s) => ({
                        id: s.id,
                        nameKh: s.nameKh,
                        nameEn: s.nameEn,
                        code: s.code,
                        shortCode: s.shortCode,
                        maxScore: s.maxScore,
                        coefficient: s.coefficient,
                        order: s.displayOrder,
                    })),
                    students: finalData,
                },
            });
        }
        catch (error) {
            console.error("❌ Get grid error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get grid data",
            });
        }
    }
    /**
     * 🚀 OPTIMIZED: Bulk save/update grades
     * @description Save multiple grades efficiently with proper connection management
     */
    static async bulkSaveGrades(req, res) {
        try {
            const { classId, month, year, grades } = req.body;
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("🎯 Bulk Save Grades Started");
            console.log("📊 Class:", classId);
            console.log("📅 Period:", month, year);
            console.log("📝 Total items:", grades.length);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            if (!Array.isArray(grades) || grades.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No grades provided",
                });
            }
            // ✅ Fetch subjects with maxScore
            console.time("📚 Fetch Subjects");
            const subjects = await prisma.subject.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    maxScore: true, // ✅ Include maxScore
                },
            });
            console.timeEnd("📚 Fetch Subjects");
            console.log(`✅ Found ${subjects.length} subjects\n`);
            const subjectMap = new Map(subjects.map((s) => [s.id, s]));
            // ✅ Validate
            console.time("🔨 Validate Data");
            const validData = [];
            const errors = [];
            for (const item of grades) {
                if (!item.studentId || !item.subjectId || item.score === undefined) {
                    errors.push({ item, reason: "Missing required fields" });
                    continue;
                }
                const subject = subjectMap.get(item.subjectId);
                if (!subject) {
                    errors.push({ item, reason: "Invalid subject ID" });
                    continue;
                }
                if (item.score !== null &&
                    (item.score < 0 || item.score > subject.maxScore)) {
                    errors.push({
                        item,
                        reason: `Score out of range (0-${subject.maxScore})`,
                    });
                    continue;
                }
                validData.push(item);
            }
            console.timeEnd("🔨 Validate Data");
            console.log(`✅ Validated: ${validData.length} valid, ${errors.length} errors\n`);
            if (validData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No valid grades to save",
                    errors,
                });
            }
            // ✅ Fetch existing grades
            console.time("🔍 Fetch Existing Grades");
            const existingGrades = await prisma.grade.findMany({
                where: {
                    classId: classId,
                    year: year,
                    month: month,
                    OR: validData.map((item) => ({
                        studentId: item.studentId,
                        subjectId: item.subjectId,
                    })),
                },
                select: {
                    id: true,
                    studentId: true,
                    subjectId: true,
                    score: true,
                },
            });
            console.timeEnd("🔍 Fetch Existing Grades");
            console.log(`✅ Found ${existingGrades.length} existing grades\n`);
            // ✅ Build lookup map
            const existingMap = new Map(existingGrades.map((g) => [`${g.studentId}_${g.subjectId}`, g]));
            // ✅ Separate creates and updates
            const toCreate = [];
            const toUpdate = [];
            validData.forEach((item) => {
                const key = `${item.studentId}_${item.subjectId}`;
                const existing = existingMap.get(key);
                // ✅ Get subject maxScore
                const subject = subjectMap.get(item.subjectId);
                if (!subject) {
                    console.warn(`⚠️ Subject not found: ${item.subjectId}`);
                    return;
                }
                if (existing) {
                    // Only update if score changed
                    if (existing.score !== item.score) {
                        toUpdate.push({
                            where: { id: existing.id },
                            data: {
                                score: item.score,
                                maxScore: subject.maxScore, // ✅ Update maxScore too
                                updatedAt: new Date(),
                            },
                        });
                    }
                }
                else {
                    // ✅ Include maxScore, id, and updatedAt in create
                    toCreate.push({
                        id: (0, crypto_1.randomUUID)(), // ✅ FIXED: Generate unique ID
                        studentId: item.studentId,
                        subjectId: item.subjectId,
                        classId: classId,
                        score: item.score,
                        maxScore: subject.maxScore, // ✅ FIXED: Include maxScore
                        year: year,
                        month: month,
                        updatedAt: new Date(), // ✅ FIXED: Add updatedAt timestamp
                    });
                }
            });
            console.log(`📝 Operations: ${toCreate.length} creates, ${toUpdate.length} updates\n`);
            // ✅ Execute bulk operations
            console.time("💾 Database Save");
            let created = 0;
            let updated = 0;
            // Create in bulk
            if (toCreate.length > 0) {
                console.time("  📥 Bulk Create");
                const createResult = await prisma.grade.createMany({
                    data: toCreate,
                    skipDuplicates: true,
                });
                created = createResult.count;
                console.timeEnd("  📥 Bulk Create");
                console.log(`  ✅ Created ${created} records\n`);
            }
            // Update in batches
            if (toUpdate.length > 0) {
                const UPDATE_BATCH = 100;
                const updateBatches = Math.ceil(toUpdate.length / UPDATE_BATCH);
                console.log(`  📤 Updating in ${updateBatches} batches... `);
                console.time("  📤 Bulk Update");
                for (let i = 0; i < toUpdate.length; i += UPDATE_BATCH) {
                    const batch = toUpdate.slice(i, i + UPDATE_BATCH);
                    // ✅ After (correct)
                    await prisma.$transaction(batch.map((update) => prisma.grade.update(update)));
                    updated += batch.length;
                    if (updateBatches > 1) {
                        console.log(`    Progress: ${updated}/${toUpdate.length}`);
                    }
                }
                console.timeEnd("  📤 Bulk Update");
                console.log(`  ✅ Updated ${updated} records\n`);
            }
            console.timeEnd("💾 Database Save");
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ Bulk Save Completed");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`📊 Created: ${created}`);
            console.log(`📊 Updated: ${updated}`);
            console.log(`📊 Skipped: ${validData.length - created - updated}`);
            console.log(`📊 Total: ${created + updated}`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            return res.json({
                success: true,
                message: "Grades saved successfully",
                data: {
                    created,
                    updated,
                    skipped: validData.length - created - updated,
                    total: created + updated,
                    validationErrors: errors,
                },
            });
        }
        catch (error) {
            console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.error("❌ Bulk Save Error");
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to save grades",
            });
        }
    }
}
exports.GradeController = GradeController;
// ==================== FILE UPLOAD ====================
/**
 * Multer middleware for file upload
 */
GradeController.uploadMiddleware = upload.single("file");
// ==================== EXISTING FUNCTIONS (Keep as is) ====================
// Get all grades
const getAllGrades = async (req, res) => {
    try {
        const grades = await prisma.grade.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching grades",
            error: error.message,
        });
    }
};
exports.getAllGrades = getAllGrades;
// Get grade by ID
const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;
        const grade = await prisma.grade.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Grade not found",
            });
        }
        res.json({
            success: true,
            data: grade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching grade",
            error: error.message,
        });
    }
};
exports.getGradeById = getGradeById;
// Get grades by student
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const grades = await prisma.grade.findMany({
            where: { studentId },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching student grades",
            error: error.message,
        });
    }
};
exports.getGradesByStudent = getGradesByStudent;
// Get grades by class
const getGradesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const grades = await prisma.grade.findMany({
            where: { classId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching class grades",
            error: error.message,
        });
    }
};
exports.getGradesByClass = getGradesByClass;
// Get grades by subject
const getGradesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const grades = await prisma.grade.findMany({
            where: { subjectId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                        class: {
                            select: {
                                name: true,
                                grade: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({
            success: true,
            data: grades,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching subject grades",
            error: error.message,
        });
    }
};
exports.getGradesBySubject = getGradesBySubject;
// Create new grade
// Create new grade
const createGrade = async (req, res) => {
    try {
        const { studentId, subjectId, classId, score, maxScore, remarks, month, year, } = req.body;
        if (!studentId ||
            !subjectId ||
            !classId ||
            score === undefined ||
            !maxScore) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }
        if (score < 0 || score > maxScore) {
            return res.status(400).json({
                success: false,
                message: `Score must be between 0 and ${maxScore}`,
            });
        }
        const newGrade = await prisma.grade.create({
            data: {
                studentId,
                subjectId,
                classId,
                score,
                maxScore,
                remarks,
                month,
                year,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        // Calculate summary if month/year provided
        if (month && year) {
            // FIX: Remove optional chaining on static method
            const monthNumber = grade_calculation_service_1.GradeCalculationService.getMonthNumber(month) || 1;
            await grade_calculation_service_1.GradeCalculationService.calculateMonthlySummary(studentId, classId, month, monthNumber, year);
        }
        res.status(201).json({
            success: true,
            message: "Grade created successfully",
            data: newGrade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating grade",
            error: error.message,
        });
    }
};
exports.createGrade = createGrade;
// Update grade
const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, maxScore, remarks } = req.body;
        const existingGrade = await prisma.grade.findUnique({
            where: { id },
        });
        if (!existingGrade) {
            return res.status(404).json({
                success: false,
                message: "Grade not found",
            });
        }
        const finalMaxScore = maxScore || existingGrade.maxScore;
        if (score !== undefined && (score < 0 || score > finalMaxScore)) {
            return res.status(400).json({
                success: false,
                message: `Score must be between 0 and ${finalMaxScore}`,
            });
        }
        const updatedGrade = await prisma.grade.update({
            where: { id },
            data: {
                score,
                maxScore,
                remarks,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        khmerName: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: "Grade updated successfully",
            data: updatedGrade,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating grade",
            error: error.message,
        });
    }
};
exports.updateGrade = updateGrade;
// Delete grade
const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const existingGrade = await prisma.grade.findUnique({
            where: { id },
        });
        if (!existingGrade) {
            return res.status(404).json({
                success: false,
                message: "Grade not found",
            });
        }
        await prisma.grade.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: "Grade deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting grade",
            error: error.message,
        });
    }
};
exports.deleteGrade = deleteGrade;
