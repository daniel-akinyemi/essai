import { NextResponse } from 'next/server';
import { OpenRouterClient } from '@/lib/openrouter';

export async function POST() {
  try {
    const openRouter = new OpenRouterClient();
    
    const testPrompt = 'Write a short paragraph about artificial intelligence.';
    
    const messages = [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: testPrompt }
    ];
    
    const model = 'mistralai/mistral-7b-instruct:free';
    console.log(`Sending request to model: ${model}`);
    
    const startTime = Date.now();
    const response = await openRouter.chatCompletion(messages, model);
    const endTime = Date.now();
    
    return NextResponse.json({
      success: true,
      model,
      response,
      duration: `${(endTime - startTime) / 1000} seconds`
    });
    
  } catch (error: unknown) {
    console.error('Test generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Test generation failed',
        message: errorMessage,
        ...(error instanceof Error && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}
