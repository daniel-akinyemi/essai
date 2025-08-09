import { NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';

export async function GET() {
  try {
    // Test OpenRouter client initialization
    const openRouter = new OpenRouterClient();
    
    // Test a simple completion
    const messages = [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: 'Say "Hello, production!"' }
    ];
    
    const model = 'mistralai/mistral-7b-instruct:free';
    const response = await openRouter.chatCompletion(messages, model);
    
    return NextResponse.json({
      success: true,
      message: 'API key is working in production!',
      response: response
    });
    
  } catch (error: any) {
    console.error('Production test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      env: {
        nodeEnv: process.env.NODE_ENV,
        openRouterBaseUrl: process.env.OPENROUTER_BASE_URL,
        openRouterKey: process.env.OPENROUTER_API_KEY ? '*** (exists)' : '*** (missing)'
      }
    }, { status: 500 });
  }
}
