import { NextResponse } from 'next/server';
import { handleError } from './error-handler';

type SuccessResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
  cache?: {
    maxAge?: number;
    swr?: number;
    tags?: string[];
  };
};

export function successResponse<T = any>(
  data: T,
  options: SuccessResponseOptions = {}
) {
  const {
    status = 200,
    headers = {},
    cache = { maxAge: 60, swr: 300 },
  } = options;

  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  // Add cache headers if caching is enabled
  if (cache) {
    const cacheControl = [
      'public',
      cache.maxAge && `s-maxage=${cache.maxAge}`,
      cache.swr && `stale-while-revalidate=${cache.swr}`,
    ]
      .filter(Boolean)
      .join(', ');

    if (cacheControl) {
      responseHeaders.set('Cache-Control', cacheControl);
    }

    if (cache.tags?.length) {
      responseHeaders.set('Cache-Tag', cache.tags.join(','));
    }
  }

  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: Object.fromEntries(responseHeaders.entries()),
    }
  );
}

export function errorResponse(
  error: unknown,
  status: number = 500,
  headers: Record<string, string> = {}
) {
  const errorResponse = handleError(error);
  
  return NextResponse.json(
    errorResponse,
    {
      status: errorResponse.error?.status || status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(new Error(message), 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(new Error(message), 401);
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(new Error(message), 403);
}

export function validationErrorResponse(
  message: string = 'Validation error',
  details?: any
) {
  return errorResponse(
    {
      message,
      details,
      code: 'VALIDATION_ERROR',
    },
    400
  );
}
