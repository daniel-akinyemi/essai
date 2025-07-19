import { NextRequest, NextResponse } from 'next/server';
import { llmScoreEssay } from '@/lib/essayScoring/llmScorer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, content } = body;

    if (!topic || !content) {
      return NextResponse.json(
        { error: 'Topic and content are required' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use LLM-based scoring
    const llmResult = await llmScoreEssay(`Essay Topic: ${topic}\nEssay Content: ${content}`);
    if (!llmResult) {
      return NextResponse.json(
        { error: 'Essay scoring failed. Please check your essay content and try again.' },
        { status: 500 }
      );
    }

    // Always provide all six scores, defaulting to 0 if missing
    const grammar = typeof llmResult.grammar === 'number' ? llmResult.grammar : 0;
    const structure = typeof llmResult.structure === 'number' ? llmResult.structure : 0;
    const coherence = typeof llmResult.coherence === 'number' ? llmResult.coherence : 0;
    const relevance = typeof llmResult.relevance === 'number' ? llmResult.relevance : 0;
    const vocabulary = typeof llmResult.vocabulary === 'number' ? llmResult.vocabulary : 0;
    const overusedWords = typeof llmResult.overusedWords === 'number' ? llmResult.overusedWords : 0;

    const scoreBreakdown = {
      grammar: `${grammar} / 20`,
      structure: `${structure} / 20`,
      coherence: `${coherence} / 20`,
      relevance: `${relevance} / 15`,
      vocabulary: `${vocabulary} / 15`,
      overusedWords: `${overusedWords} / 10`,
    };

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    return NextResponse.json({
      essayTitle: topic,
      overallScore: grammar + structure + coherence + relevance + vocabulary + overusedWords,
      scoreBreakdown,
      explanation: llmResult.explanation,
      improvementSuggestions: llmResult.improvementSuggestions || [],
      timestamp,
    });
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