import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  const { paragraph, topic } = await req.json();
  const prompt = `Rewrite the following paragraph to be highly relevant to the topic, using Nigerian context and examples:\n\nTopic: ${topic}\nParagraph: ${paragraph}`;
  const client = getOpenRouterClient();
  const localized = await client.chatCompletion([
    { role: 'system', content: prompt }
  ], 'mistralai/mistral-7b-instruct:free');
  return NextResponse.json({ localized });
}