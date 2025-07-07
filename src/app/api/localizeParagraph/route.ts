import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  const { paragraph, topic } = await req.json();
  const prompt = `Rewrite the following paragraph to be highly relevant to the topic, using Nigerian context and examples:\n\nTopic: ${topic}\nParagraph: ${paragraph}`;
  const localized = await openRouterClient.chatCompletion([
    { role: 'system', content: prompt }
  ], 'mistralai/mistral-7b-instruct:free');
  return NextResponse.json({ localized });
} 