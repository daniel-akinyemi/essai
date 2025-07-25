import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withPerformanceMonitoring } from '@/lib/api-performance';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';

// Cache configuration
const CACHE_DURATION = 60 * 5; // 5 minutes

// Revalidate the cache every 5 minutes
export const revalidate = CACHE_DURATION;

type UserSettings = {
  id?: string;
  userId: string;
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

/**
 * GET /api/user-settings
 * Fetches user settings with caching
 */
const GET = withPerformanceMonitoring(async (req: NextRequest) => {
  try {
    const startTime = Date.now();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return unauthorizedResponse('You must be logged in to access user settings');
    }

    // Check cache first
    const cacheKey = `user-settings:${session.user.email}`;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      const responseTime = Date.now() - startTime;
      const responseData = JSON.parse(cached);
      
      return successResponse(responseData, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${responseTime}ms`
        },
        cache: {
          maxAge: CACHE_DURATION,
          swr: 60,
          tags: ['user-settings']
        }
      });
    }

    // Fetch from database
    const userSettings = await prisma.userSettings.findUnique({
      where: { email: session.user.email },
    });

    // Cache the result
    if (userSettings) {
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
    return errorResponse(error);
  }
});

/**
 * POST /api/user-settings
 * Updates or creates user settings
 */
const POST = withPerformanceMonitoring(async (req: NextRequest) => {
  try {
    const startTime = Date.now();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return unauthorizedResponse('You must be logged in to update user settings');
    }
    
    // Rate limiting check (10 requests per minute)
    const rateLimitKey = `rate-limit:user-settings:${session.user.email}`;
    const rateLimit = await getCache(rateLimitKey);
    
    if (rateLimit && parseInt(rateLimit) >= 10) {
      return errorResponse(
        new Error('Too many requests, please try again later'),
        429,
        { 'Retry-After': '60' }
      );
    }
    
    // Set rate limit
    await setCache(rateLimitKey, (parseInt(rateLimit || '0') + 1).toString(), 60);

    // Parse and validate request body
    let body: Partial<UserSettings>;
    try {
      body = await req.json();
    } catch (e) {
      return validationErrorResponse('Invalid JSON body');
    }
    
    // Validate required fields
    if (!body || Object.keys(body).length === 0) {
      return validationErrorResponse('No data provided for update');
    }
    
    // Validate specific fields if needed
    // Example: if (body.theme && !['light', 'dark', 'system'].includes(body.theme)) {
    //   return validationErrorResponse('Invalid theme value', { theme: body.theme });
    // }
    
    // Update or create user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { email: session.user.email },
      update: body,
      create: {
        email: session.user.email,
        ...body,
        userId,
        emailNotifications: body.emailNotifications,
        showWritingTips: body.showWritingTips,
        theme: body.theme,
        language: body.language,
        autoSaveFrequency: body.autoSaveFrequency,
        writingStyle: body.writingStyle,
        defaultEssayType: body.defaultEssayType,
        essayLength: body.essayLength,
        analyticsEnabled: body.analyticsEnabled,
        dataSharing: body.dataSharing,
      },
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('[API] POST /api/user-settings - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}); 