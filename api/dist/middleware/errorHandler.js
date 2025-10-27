"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
// Global Error Handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Prisma Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                statusCode = 400;
                message = `Duplicate value for ${err.meta?.target || 'field'}`;
                break;
            case 'P2014':
                // Invalid ID
                statusCode = 400;
                message = 'Invalid ID provided';
                break;
            case 'P2003':
                // Foreign key constraint violation
                statusCode = 400;
                message = 'Related record not found';
                break;
            case 'P2025':
                // Record not found
                statusCode = 404;
                message = 'Record not found';
                break;
            default:
                statusCode = 500;
                message = 'Database error occurred';
        }
    }
    // Prisma Validation Error
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Validation error in request data';
    }
    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack,
        }),
    });
};
exports.errorHandler = errorHandler;
// Not Found Handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
// Async Handler Wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
