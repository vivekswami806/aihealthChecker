import logger from '../config/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Prisma validation error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    err.message = `${field} already exists`;
    err.statusCode = 400;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    err.message = 'Record not found';
    err.statusCode = 404;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = 'Token expired';
    err.statusCode = 401;
  }

  // Validation errors
  if (err.array) {
    const errors = err.array().map((e) => ({
      field: e.param,
      message: e.msg,
    }));
    return ApiResponse.error(
      res,
      'Validation failed',
      422,
      errors
    );
  }

  // Log error
  logger.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return ApiResponse.error(
    res,
    err.message,
    err.statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

export default errorHandler;