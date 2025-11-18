/**
 * Centralized error handling utilities
 * Provides consistent error responses and categorization
 */

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// Convenience error creators
export const createBadRequestError = (message: string, details?: any) =>
  new AppError(ErrorCode.BAD_REQUEST, message, 400, details);

export const createNotFoundError = (resource: string, id?: string) =>
  new AppError(
    ErrorCode.NOT_FOUND,
    `${resource}${id ? ` with id '${id}'` : ''} not found`,
    404
  );

export const createValidationError = (message: string, details?: any) =>
  new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);

export const createConflictError = (message: string, details?: any) =>
  new AppError(ErrorCode.CONFLICT, message, 409, details);

export const createInternalError = (message: string = 'Internal server error') =>
  new AppError(ErrorCode.INTERNAL_ERROR, message, 500);

export const createDatabaseError = (message: string = 'Database operation failed') =>
  new AppError(ErrorCode.DATABASE_ERROR, message, 500);

// Error response formatter
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: error.toJSON(),
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      status: 400,
      body: {
        error: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: (error as any).issues,
      },
    };
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return {
        status: 409,
        body: {
          error: ErrorCode.CONFLICT,
          message: 'A record with this value already exists',
          details: prismaError.meta,
        },
      };
    }
    if (prismaError.code === 'P2025') {
      return {
        status: 404,
        body: {
          error: ErrorCode.NOT_FOUND,
          message: 'Record not found',
        },
      };
    }
  }

  // Default error response
  return {
    status: 500,
    body: {
      error: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  };
}
