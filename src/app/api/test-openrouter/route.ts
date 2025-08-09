import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if the API key is loaded
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    // Test the API key by making a simple request
    const response = await fetch(`${baseUrl}/key`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to verify API key',
          status: response.status,
          statusText: response.statusText,
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      apiKeyConfigured: !!apiKey,
      baseUrl,
      keyInfo: data
    });

  } catch (error: unknown) {
    console.error('Error testing OpenRouter API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' 
      ? error.stack 
      : undefined;
      
    return NextResponse.json(
      { 
        error: 'Error testing OpenRouter API',
        message: errorMessage,
        ...(errorStack && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
