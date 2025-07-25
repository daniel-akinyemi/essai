import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

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
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }

    const userId = (session.user as any).id;
    
    // Fetch user settings with only needed fields
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        id: true,
        emailNotifications: true,
        showWritingTips: true,
        theme: true,
        language: true,
        updatedAt: true
      }
    });

    const responseData = userSettings || {};
    const responseTime = Date.now() - startTime;
    
    // Log performance
    console.log(`[API] GET /api/user-settings - ${responseTime}ms`);

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`,
          'X-Response-Time': `${responseTime}ms`
        }
      }
    );
  } catch (error) {
    console.error('[API Error] GET /api/user-settings:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/user-settings
 * Updates or creates user settings
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Fallback to email lookup if needed
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({ 
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = user?.id;
    }
    
    // Check authentication
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    let body: Partial<UserSettings>;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields if needed
    // Add your validation logic here

    // Update or create user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
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
        updatedAt: new Date(),
      },
      create: {
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
    console.error('Error saving user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 