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
  userId: string;
  emailNotifications: boolean;
  showWritingTips: boolean;
  theme: string;
  language: string;
  autoSaveFrequency: string;
  writingStyle: string;
  defaultEssayType: string;
  essayLength: string;
  analyticsEnabled: boolean;
  dataSharing: boolean;
  lastActiveAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    email: string;
  };
};

// Type for the request body (excludes read-only fields)
type UserSettingsUpdate = Omit<Partial<UserSettings>, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// Base handler without CORS and rate limiting
async function getHandler(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse('You must be logged in to access user settings');
    }
    
    // Get user ID from session (using type assertion as we know it exists)
    const userId = (session.user as any).id;
    
    if (!userId) {
      return unauthorizedResponse('User ID not found in session');
    }
    
    // First try to get from cache
    const cachedData = await getCache(`user-settings:${userId}`);
    
    if (cachedData) {
      console.log(`[CACHE HIT] Found settings for user ${userId} in cache`);
      
      try {
        const parsedData = JSON.parse(cachedData);
        return successResponse(parsedData, {
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
        return await fetchFromDatabase(userId, startTime);
      }
    }
    
    return await fetchFromDatabase(userId, startTime);
  } catch (error) {
    const errResponse = handleError(error);
    if (errResponse instanceof NextResponse) {
      return errResponse;
    }
    return errorResponse('Failed to fetch user settings', 500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function fetchFromDatabase(userId: string, startTime: number): Promise<NextResponse> {
  try {
    // Fetch from database
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!userSettings) {
      console.log(`[CACHE MISS] No settings found for user: ${userId}`);
      return NextResponse.json(
        { success: false, error: 'User settings not found' },
        { status: 404 }
      );
    }

    // Cache the result
    const cacheKey = `user-settings:${userId}`;
    await setCache(cacheKey, JSON.stringify(userSettings), CACHE_DURATION);
    
    const responseTime = Date.now() - startTime;
    
    return successResponse(userSettings, {
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
  const startTime = Date.now();
  
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse('You must be logged in to update user settings');
    }
    
    // Get user ID from session
    const userId = (session.user as any).id;
    
    // Parse request body - only allow specific fields that can be updated
    let updateData: {
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
    };
    
    try {
      const body = await req.json();
      updateData = body;
    } catch (e) {
      return validationErrorResponse('Invalid JSON payload');
    }
    
    // Validate request body
    if (!updateData || Object.keys(updateData).length === 0) {
      return validationErrorResponse('No update data provided');
    }
    
    // Check if settings exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await prisma.userSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...updateData,
          lastActiveAt: new Date(),
        },
        select: {
          id: true,
          userId: true,
          emailNotifications: true,
          showWritingTips: true,
          theme: true,
          language: true,
          autoSaveFrequency: true,
          writingStyle: true,
          defaultEssayType: true,
          essayLength: true,
          analyticsEnabled: true,
          dataSharing: true,
          lastActiveAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    } else {
      // Create new settings with default values
      result = await prisma.userSettings.create({
        data: {
          userId,
          emailNotifications: updateData.emailNotifications ?? true,
          showWritingTips: updateData.showWritingTips ?? true,
          theme: updateData.theme ?? 'system',
          language: updateData.language ?? 'en',
          autoSaveFrequency: updateData.autoSaveFrequency ?? '30',
          writingStyle: updateData.writingStyle ?? 'academic',
          defaultEssayType: updateData.defaultEssayType ?? 'argumentative',
          essayLength: updateData.essayLength ?? 'medium',
          analyticsEnabled: updateData.analyticsEnabled ?? true,
          dataSharing: updateData.dataSharing ?? false,
          lastActiveAt: new Date(),
        },
        select: {
          id: true,
          userId: true,
          emailNotifications: true,
          showWritingTips: true,
          theme: true,
          language: true,
          autoSaveFrequency: true,
          writingStyle: true,
          defaultEssayType: true,
          essayLength: true,
          analyticsEnabled: true,
          dataSharing: true,
          lastActiveAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    }
    
    // Invalidate cache after update/create
    await deleteCache(`user-settings:${userId}`);
    
    return successResponse(result, {
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
