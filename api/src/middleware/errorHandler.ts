import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom Error Interface
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

// Global Error Handler
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
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
  if (err instanceof Prisma.PrismaClientValidationError) {
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

// Not Found Handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async Handler Wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};