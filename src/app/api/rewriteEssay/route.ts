import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { originalEssay, instructions, requestType, writingStyle = 'academic' } = body;

    if (!originalEssay || typeof originalEssay !== 'string') {
      return NextResponse.json({ error: 'Original essay is required' }, { status: 400 });
    }

    if (originalEssay.length < 50) {
      return NextResponse.json({ error: 'Essay must be at least 50 characters long' }, { status: 400 });
    }

    if (originalEssay.length > 10000) {
      return NextResponse.json({ error: 'Essay must be less than 10,000 characters' }, { status: 400 });
    }

    // Get user settings if writingStyle not provided
    let userWritingStyle = writingStyle;
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
    
    if (userId && !writingStyle) {
      try {
        const userSettings = await prisma.userSettings.findUnique({
          where: { userId }
        });
        if (userSettings) {
          userWritingStyle = userSettings.writingStyle || 'academic';
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    }

    // Lazy load the OpenRouter client to catch initialization errors
    let openRouterClient;
    try {
      const { openRouterClient: client } = await import('@/lib/openrouter');
      openRouterClient = client;
    } catch (error) {
      console.error('Failed to initialize OpenRouter client:', error);
      return NextResponse.json({ 
        error: 'OpenRouter service is not properly configured. Please check the API key.' 
      }, { status: 500 });
    }

    let result;
    const mistralModel = 'mistralai/mistral-7b-instruct:free';

    if (requestType === 'suggestions') {
      result = await openRouterClient.getSuggestions(originalEssay, mistralModel);
      return NextResponse.json({ 
        suggestions: result,
        success: true 
      });
    } else {
      // Pass writing style to the rewrite function
      const rewrittenEssay = await openRouterClient.rewriteEssay(originalEssay, instructions, mistralModel, userWritingStyle);
      // Get before-rewrite suggestions
      const suggestions = await openRouterClient.getSuggestions(originalEssay, mistralModel);
      // Get after-rewrite improvements
      const improvements = await openRouterClient.compareEssaysForImprovements(originalEssay, rewrittenEssay, mistralModel);
      return NextResponse.json({ 
        rewrittenEssay,
        originalEssay,
        instructions: instructions || null,
        suggestions, // before rewrite
        improvements, // after rewrite
        timestamp: new Date().toISOString(),
        success: true 
      });
    }

  } catch (error) {
    console.error('Essay rewriter API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'API configuration error. Please contact support.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a few minutes.' 
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: `Essay rewriting failed: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: 'An unexpected error occurred while rewriting the essay' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}