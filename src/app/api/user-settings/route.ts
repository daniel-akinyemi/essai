import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { withPerformanceMonitoring } from '@/lib/api-performance';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { getCache, setCache, deleteCache } from '@/lib/cache';
import { withCors } from '@/lib/cors';
import { withRateLimit } from '@/lib/rate-limit';

type RateLimitOptions = {
  key?: string;
  maxRequests?: number;
};

type CorsOptions = {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  credentials?: boolean;
};

// Cache configuration
const CACHE_DURATION = 60 * 5; // 5 minutes

// Rate limiting configuration
const RATE_LIMIT_OPTIONS: RateLimitOptions = {
  key: 'user-settings',
  maxRequests: 100, // 100 requests per minute per IP
};

// CORS configuration
const CORS_OPTIONS: CorsOptions = {
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-production-domain.com',
        'https://www.your-production-domain.com',
      ] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

// Route segment config for revalidation
export const dynamic = 'force-dynamic'; // No caching at the edge

// Define the UserSettings type that matches our Prisma schema
type UserSettings = {
  id?: string;
  userId?: string;
  email?: string;
  emailNotifications?: boolean;
  showWritingTips?: boolean;
  theme?: string;
  language?: string;
  autoSaveFrequency?: string;
  writingStyle?: string;
  defaultEssayType?: string;
  essayLength?: string;
  analyticsEnabled?: boolean;
  dataSharing?: boolean;
  lastActiveAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

// Type for the request body (excludes read-only fields)
type UserSettingsUpdate = Omit<Partial<UserSettings>, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// Base handler without CORS and rate limiting
async function getHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    if (!userEmail) {
      return unauthorizedResponse('You must be logged in to access user settings');
    }

    // Check cache first
    const cacheKey = `user-settings:${userEmail}`;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      try {
        const responseData = JSON.parse(cached);
        return successResponse(responseData, {
          headers: {
            'X-Cache': 'HIT',
            'X-Response-Time': `${Date.now() - startTime}ms`
          },
          cache: {
            maxAge: CACHE_DURATION,
            swr: 60,
            tags: ['user-settings']
          }
        });
      } catch (e) {
        console.error('Error parsing cached data:', e);
        // If cache is corrupted, continue to fetch from database
        return await fetchFromDatabase(userEmail, startTime);
      }
    }
    
    return await fetchFromDatabase(userEmail, startTime);
  } catch (error) {
    const errResponse = handleError(error);
    if (errResponse instanceof NextResponse) {
      return errResponse;
    }
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching user settings' },
      { status: 500 }
    );
  }
}

async function fetchFromDatabase(email: string, startTime: number): Promise<NextResponse> {
  try {
    // Fetch from database
    const userSettings = await prisma.userSettings.findUnique({
      where: { email },
    });

    // Cache the result
    if (userSettings) {
      const cacheKey = `user-settings:${email}`;
      await setCache(cacheKey, JSON.stringify(userSettings), CACHE_DURATION);
    }
    
    const responseTime = Date.now() - startTime;
    
    return successResponse(userSettings || {}, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`
      },
      cache: {
        maxAge: CACHE_DURATION,
        swr: 60,
        tags: ['user-settings']
      }
    });
  } catch (error) {
    console.error('Error fetching from database:', error);
    throw error;
  }
}

// Create the GET handler with all middleware
const getRouteHandler = withPerformanceMonitoring(
  async (req: NextRequest): Promise<NextResponse> => {
    const result = await getHandler(req);
    return result instanceof NextResponse ? result : NextResponse.json(result);
  }
) as (req: NextRequest) => Promise<NextResponse>;

// Apply rate limiting and CORS to the GET handler
export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // First apply rate limiting
    const rateLimitedHandler = await withRateLimit(
      getRouteHandler,
      RATE_LIMIT_OPTIONS
    ) as (req: NextRequest) => Promise<NextResponse>;
    
    // Then apply CORS
    const corsHandler = withCors(rateLimitedHandler, CORS_OPTIONS) as (req: NextRequest) => Promise<NextResponse>;
    
    const response = await corsHandler(req);
    return response instanceof NextResponse ? response : NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/user-settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};

// POST handler for creating/updating user settings
async function postHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    if (!userEmail) {
      return unauthorizedResponse('You must be logged in to update user settings');
    }
    
    // Parse and validate request body
    let body: UserSettingsUpdate;
    try {
      body = await req.json();
    } catch (e) {
      return validationErrorResponse('Invalid JSON body');
    }
    
    // Validate required fields
    if (!body || Object.keys(body).length === 0) {
      return validationErrorResponse('No data provided for update');
    }
    
    // Prepare update data
    const updateData: Partial<UserSettings> = {
      ...body,
      lastActiveAt: new Date(),
    };
    
    // Update or create user settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: { email: userEmail },
      update: updateData,
      create: {
        email: userEmail,
        ...updateData,
      },
    });
    
    // Invalidate cache
    const cacheKey = `user-settings:${userEmail}`;
    await deleteCache(cacheKey);
    
    return successResponse(updatedSettings, {
      headers: {
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
    
  } catch (error) {
    console.error('Error in POST /api/user-settings:', error);
    return errorResponse(new Error('Failed to update user settings'), 500);
  }
}

// Create the POST handler with all middleware
const postRouteHandler = withPerformanceMonitoring(
  async (req: NextRequest): Promise<NextResponse> => {
    const result = await postHandler(req);
    return result instanceof NextResponse ? result : NextResponse.json(result);
  }
) as (req: NextRequest) => Promise<NextResponse>;

// Apply rate limiting and CORS to the POST handler
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // First apply rate limiting
    const rateLimitedHandler = await withRateLimit(
      postRouteHandler,
      { ...RATE_LIMIT_OPTIONS, maxRequests: 20 } // Stricter rate limiting for POST
    ) as (req: NextRequest) => Promise<NextResponse>;
    
    // Then apply CORS
    const corsHandler = withCors(rateLimitedHandler, CORS_OPTIONS) as (req: NextRequest) => Promise<NextResponse>;
    
    const response = await corsHandler(req);
    return response instanceof NextResponse ? response : NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/user-settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};
