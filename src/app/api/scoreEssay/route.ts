import { NextRequest, NextResponse } from 'next/server';
import { EssayScoringService } from '@/lib/essayScoring/essayScoringService';
import { EssaySubmission } from '@/lib/essayScoring/types';
import { openRouterClient } from '@/lib/openrouter';
import { OpenRouterMessage } from '@/lib/openrouter';

// Helper to extract first JSON object from a string
function extractFirstJsonObject(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('No JSON object found in model response');
}

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

    // Use OpenRouter Mistral 7B Free model for scoring
    const mistralModel = 'mistralai/mistral-7b-instruct:free';
    const systemPrompt = `You are an expert essay grader. Given an essay topic and content, analyze the essay and return a JSON object with the following fields:
- grammar (score out of 20)
- structure (score out of 20)
- coherence (score out of 20)
- relevance (score out of 15)
- vocabulary (score out of 15)
- overusedWords (score out of 10)
- improvementSuggestions (array of 3-5 actionable suggestions)

Example response:
{"grammar":18,"structure":17,"coherence":16,"relevance":13,"vocabulary":14,"overusedWords":9,"improvementSuggestions":["Use more varied sentence structures.","Add more supporting evidence.","Improve transitions between paragraphs."]}`;
    const userPrompt = `Essay Topic: ${topic}\nEssay Content: ${content}`;
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let aiResult;
    try {
      const raw = await openRouterClient.chatCompletion(messages, mistralModel);
      try {
        aiResult = extractFirstJsonObject(raw);
      } catch (jsonErr) {
        console.error('Raw AI response:', raw);
        throw jsonErr;
      }
    } catch (scoringError) {
      console.error('Scoring error:', scoringError);
      return NextResponse.json(
        { error: 'Essay scoring failed. Please check your essay content and try again.' },
        { status: 500 }
      );
    }

    // Format breakdown
    const scoreBreakdown = {
      grammar: `${aiResult.grammar} / 20`,
      structure: `${aiResult.structure} / 20`,
      coherence: `${aiResult.coherence} / 20`,
      relevance: `${aiResult.relevance} / 15`,
      vocabulary: `${aiResult.vocabulary} / 15`,
      overusedWords: `${aiResult.overusedWords} / 10`,
    };

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    return NextResponse.json({
      essayTitle: topic,
      overallScore: aiResult.grammar + aiResult.structure + aiResult.coherence + aiResult.relevance + aiResult.vocabulary + aiResult.overusedWords,
      scoreBreakdown,
      improvementSuggestions: aiResult.improvementSuggestions,
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