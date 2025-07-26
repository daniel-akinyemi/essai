import { getOpenRouterClient } from '@/lib/openrouter';
import type { OpenRouterMessage } from '@/lib/openrouter';

const scoringPrompt = `
You are an expert essay grader. Given the following essay, score it in these categories:
- grammar (out of 20)
- structure (out of 20)
- coherence (out of 20)
- relevance (out of 15)
- vocabulary (out of 15)
- overusedWords (out of 10)

Scoring rules:
- Penalize harshly for sentence fragments, run-ons, repeated simple structures, and poor vocabulary (grammar/structure max 8/20 if present).
- If ideas jump without connection, coherence should be below 10/20.
- If the essay is off-topic or generic, relevance should be low.
- If the same simple words are used repeatedly, overusedWords should be low.
- Even poor essays must receive a score in every category (never N/A).

After scoring, provide 3-5 actionable improvementSuggestions as a JSON array of strings, each tailored to the essay's weaknesses.

Return a JSON object like:
{
  "grammar": 6,
  "structure": 7,
  "coherence": 8,
  "relevance": 5,
  "vocabulary": 7,
  "overusedWords": 3,
  "explanation": "This essay has many grammar errors, repeated sentence structures, and jumps between ideas.",
  "improvementSuggestions": [
    "Fix sentence fragments and run-on sentences.",
    "Use more varied sentence structures.",
    "Add transitions to improve coherence.",
    "Stay on topic in each paragraph."
  ]
}
`;

export async function llmScoreEssay(essay: string) {
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: scoringPrompt },
    { role: 'user', content: essay }
  ];
  const model = 'mistralai/mistral-7b-instruct:free';
  const client = getOpenRouterClient();
  const response = await client.chatCompletion(messages, model);

  // Extract JSON from response
  const match = response.match(/\{[\s\S]*?\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse LLM score JSON:', e, match[0]);
      return null;
    }
  }
  return null;
} 