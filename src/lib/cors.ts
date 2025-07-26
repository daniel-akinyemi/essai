import { NextRequest, NextResponse } from 'next/server';

export type CorsOptions = {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposeHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  optionsSuccessStatus?: number;
};

const DEFAULT_OPTIONS: Required<CorsOptions> = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposeHeaders: [],
  maxAge: 86400, // 24 hours
  credentials: false,
  optionsSuccessStatus: 204,
};

export function withCors(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CorsOptions = {}
) {
  const corsOptions = { ...DEFAULT_OPTIONS, ...options };
  const allowedMethods = corsOptions.allowedMethods.join(', ');
  const allowedHeaders = corsOptions.allowedHeaders.join(', ');
  const exposeHeaders = corsOptions.exposeHeaders.join(', ');

  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, {
        status: corsOptions.optionsSuccessStatus,
      });

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Methods', allowedMethods);
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders);
      response.headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());

      if (corsOptions.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      // Handle allowed origins
      const origin = req.headers.get('origin');
      if (origin && (corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (corsOptions.allowedOrigins.length > 0) {
        // If we have specific origins and none match, use the first one as default
        response.headers.set('Access-Control-Allow-Origin', corsOptions.allowedOrigins[0]);
      }

      return response;
    }

    // Handle actual requests
    try {
      const response = await handler(req);

      // Add CORS headers to the response
      const origin = req.headers.get('origin');
      if (origin && (corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (corsOptions.allowedOrigins.length > 0) {
        // If we have specific origins and none match, use the first one as default
        response.headers.set('Access-Control-Allow-Origin', corsOptions.allowedOrigins[0]);
      }

      if (corsOptions.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (corsOptions.exposeHeaders.length > 0) {
        response.headers.set('Access-Control-Expose-Headers', exposeHeaders);
      }

      return response;
    } catch (error) {
      // Ensure CORS headers are added to error responses
      const response = new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const origin = req.headers.get('origin');
      if (origin && (corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (corsOptions.allowedOrigins.length > 0) {
        response.headers.set('Access-Control-Allow-Origin', corsOptions.allowedOrigins[0]);
      }

      if (corsOptions.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
    }
  };
}

export function createCorsHeaders(req: NextRequest, options: CorsOptions = {}): Headers {
  const corsOptions = { ...DEFAULT_OPTIONS, ...options };
  const headers = new Headers();
  const origin = req.headers.get('origin');

  if (origin && (corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin))) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (corsOptions.allowedOrigins.length > 0) {
    headers.set('Access-Control-Allow-Origin', corsOptions.allowedOrigins[0]);
  }

  if (corsOptions.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (corsOptions.exposeHeaders.length > 0) {
    headers.set('Access-Control-Expose-Headers', corsOptions.exposeHeaders.join(', '));
  }

  return headers;
}

// Helper function to be used in Next.js middleware
export function corsMiddleware(req: NextRequest) {
  const response = new NextResponse(null, {
    status: 204, // No content
  });

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}
