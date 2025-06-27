import { NextRequest, NextResponse } from 'next/server';
import { EssayScoringService } from '@/lib/essayScoring/essayScoringService';
import { EssaySubmission } from '@/lib/essayScoring/types';

export async function POST(request: NextRequest) {
  try {
    const body: EssaySubmission = await request.json();
    const { topic, content } = body;

    // Validate input
    if (!topic || !content) {
      return NextResponse.json(
        { error: 'Topic and content are required' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Score the essay using the comprehensive service
    let result;
    try {
      result = await EssayScoringService.scoreEssay({ topic, content });
    } catch (scoringError) {
      console.error('Scoring error:', scoringError);
      return NextResponse.json(
        { error: 'Essay scoring failed. Please check your essay content and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scoring essay:', error);
    if (error instanceof Error) {
      console.error(error.stack);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to score essay' },
      { status: 500 }
    );
  }
} 