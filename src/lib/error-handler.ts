import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export const handleError = (error: unknown) => {
  // Log error to Sentry
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      Sentry.captureException(error, {
        level: 'error',
        tags: { type: 'application_error' },
      });
    }
  } else if (error instanceof Error) {
    Sentry.captureException(error, {
      level: 'error',
      tags: { type: 'unhandled_error' },
    });
  } else {
    Sentry.captureException(new Error('Unknown error occurred'), {
      level: 'error',
      extra: { error },
      tags: { type: 'unknown_error' },
    });
  }

  // Return a user-friendly error response
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        ...(error.details && { details: error.details }),
      },
    };
  }

  // For unhandled errors, return a generic error message
  return {
    success: false,
    error: {
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
  };
};

export const withErrorHandling = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
};
