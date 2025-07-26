import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from 'request-ip';
import { getCache, setCache } from './cache';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Max requests per IP per window
const RATE_LIMIT_KEY_PREFIX = 'rate-limit:';

export interface RateLimitOptions {
  key?: string;
  maxRequests?: number;
}

export interface RateLimitOptions {
  key?: string;
  maxRequests?: number;
}

interface RateLimitResult {
  isRateLimited: boolean;
  remaining: number;
  resetTime: Date;
}

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  req: NextRequest,
  key: string = 'global',
  maxRequests: number = MAX_REQUESTS_PER_WINDOW
): Promise<RateLimitResult> {
  // In development, skip rate limiting
  if (process.env.NODE_ENV === 'development') {
    return {
      isRateLimited: false,
      remaining: Number.POSITIVE_INFINITY,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  // Convert NextRequest to a plain object for getClientIp
  const plainReq = {
    ...req,
    headers: Object.fromEntries(req.headers.entries())
  };
  
  const clientIp = getClientIp(plainReq);
  if (!clientIp) {
    // If we can't determine the IP, be permissive but log it
    console.warn('Could not determine client IP for rate limiting');
    return {
      isRateLimited: false,
      remaining: Number.POSITIVE_INFINITY,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  const cacheKey = `${RATE_LIMIT_KEY_PREFIX}${key}:${clientIp}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get or initialize the request timestamps for this IP and key
  const cachedData = await getCache(cacheKey);
  let requestTimestamps: number[] = [];
  
  if (cachedData) {
    try {
      requestTimestamps = JSON.parse(cachedData);
    } catch (e) {
      console.error('Error parsing rate limit cache:', e);
    }
  }

  // Filter out old requests outside the current window
  const recentRequests = requestTimestamps.filter(time => time > windowStart);
  const requestCount = recentRequests.length;
  
  // Check if rate limit is exceeded
  const isRateLimited = requestCount >= maxRequests;
  
  // Add current request to the window
  recentRequests.push(now);
  
  // Update the cache with the new request count
  await setCache(
    cacheKey, 
    JSON.stringify(recentRequests), 
    Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) // TTL in seconds
  );

  return {
    isRateLimited,
    remaining: Math.max(0, maxRequests - requestCount - 1),
    resetTime: new Date(now + RATE_LIMIT_WINDOW_MS),
  };
}

/**
 * Middleware to apply rate limiting to API routes
 */
export async function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions = {}
): Promise<(req: NextRequest, ...args: any[]) => Promise<NextResponse>> {
  return async (req: NextRequest, ...args: any[]) => {
    const rateLimit = await checkRateLimit(
      req, 
      options.key || 'global',
      options.maxRequests || MAX_REQUESTS_PER_WINDOW
    );

    // Set rate limit headers for all responses
    const headers = new Headers();
    headers.set('Retry-After', Math.ceil(rateLimit.resetTime.getTime() / 1000).toString());
    headers.set('X-RateLimit-Limit', (options.maxRequests || MAX_REQUESTS_PER_WINDOW).toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime.getTime() / 1000).toString());

    if (rateLimit.isRateLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests, please try again later',
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Call the handler and add rate limit headers to the response
    try {
      const response = await handler(req, ...args);
      
      // Create a new response with the original body and status, plus rate limit headers
      const responseBody = await response.clone().json().catch(() => ({}));
      
      return NextResponse.json(responseBody, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...Object.fromEntries(headers.entries())
        }
      });
    } catch (error) {
      // Create error response with rate limit headers
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'An error occurred while processing your request.',
        },
        {
          status: 500,
          headers: Object.fromEntries(headers.entries())
        }
      );
      
      return errorResponse;
    }
  };
}
