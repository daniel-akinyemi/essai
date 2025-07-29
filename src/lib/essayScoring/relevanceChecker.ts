import { openRouterClient } from '../openrouter';
import type { OpenRouterMessage } from '../openrouter';

// Function to detect if topic specifies a country or region
function detectLocalizationContext(topic: string): { hasLocalization: boolean; context?: string } {
  const countries = [
    'nigeria', 'nigerian', 'ghana', 'ghanaian', 'kenya', 'kenyan', 'south africa', 'south african',
    'egypt', 'egyptian', 'morocco', 'moroccan', 'ethiopia', 'ethiopian', 'uganda', 'ugandan',
    'tanzania', 'tanzanian', 'zimbabwe', 'zimbabwean', 'zambia', 'zambian', 'malawi', 'malawian',
    'botswana', 'botswanan', 'namibia', 'namibian', 'mozambique', 'mozambican', 'angola', 'angolan',
    'congo', 'congolese', 'cameroon', 'cameroonian', 'senegal', 'senegalese', 'mali', 'malian',
    'burkina faso', 'burkinabe', 'niger', 'nigerien', 'chad', 'chadian', 'sudan', 'sudanese',
    'somalia', 'somali', 'djibouti', 'djiboutian', 'eritrea', 'eritrean', 'comoros', 'comorian',
    'seychelles', 'seychellois', 'mauritius', 'mauritian', 'madagascar', 'malagasy', 'rwanda', 'rwandan',
    'burundi', 'burundian', 'central african republic', 'central african', 'equatorial guinea', 'equatoguinean',
    'gabon', 'gabonese', 'republic of congo', 'congo brazzaville', 'democratic republic of congo', 'drc',
    'sao tome and principe', 'sao tomean', 'cape verde', 'cape verdean', 'guinea-bissau', 'guinea-bissauan',
    'guinea', 'guinean', 'sierra leone', 'sierra leonean', 'liberia', 'liberian', 'ivory coast', 'ivorian',
    'togo', 'togolese', 'benin', 'beninese', 'gambia', 'gambian', 'mauritania', 'mauritanian',
    'algeria', 'algerian', 'tunisia', 'tunisian', 'libya', 'libyan', 'western sahara', 'sahrawi',
    'lesotho', 'basotho', 'eswatini', 'swazi', 'south sudan', 'south sudanese'
  ];

  const regions = [
    'africa', 'african', 'west africa', 'west african', 'east africa', 'east african',
    'southern africa', 'southern african', 'central africa', 'central african',
    'north africa', 'north african', 'horn of africa', 'sahel', 'sahelian',
    'sub-saharan africa', 'sub-saharan african', 'maghreb', 'maghrebi',
    'europe', 'european', 'asia', 'asian', 'america', 'american',
    'latin america', 'latin american', 'caribbean', 'caribbean',
    'middle east', 'middle eastern', 'pacific', 'pacific islander'
  ];

  const topicLower = topic.toLowerCase();
  
  // Check for specific countries
  for (const country of countries) {
    if (topicLower.includes(country)) {
      return { hasLocalization: true, context: country };
    }
  }
  
  // Check for regions
  for (const region of regions) {
    if (topicLower.includes(region)) {
      return { hasLocalization: true, context: region };
    }
  }
  
  return { hasLocalization: false };
}

const relevanceCheckPrompt = `You are a relevance checker for academic essays. Given an essay topic and the full essay, analyze each paragraph and identify any that drift off-topic, are too generic, or irrelevant.

Instructions:
- For each flagged paragraph, return:
  - "paragraph": the section or paragraph label (e.g., "Body Paragraph 2", "Conclusion")
  - "issue": a short explanation of the problem
  - "suggestion": a brief suggestion to realign the paragraph
- Only flag paragraphs that are off-topic, too general, or irrelevant.
- Output ONLY a JSON array in this format:
[
  {
    "paragraph": "Body Paragraph 2",
    "issue": "Drifts from topic",
    "suggestion": "Focus more on the specific topic rather than general information."
  }
]`;

const localizedRelevanceCheckPrompt = `You are a relevance checker for academic essays with a focus on contextual localization. Given an essay topic and the full essay, analyze each paragraph and identify any that drift off-topic, are too generic, or lack proper contextual relevance.

Instructions:
- For each flagged paragraph, return:
  - "paragraph": the section or paragraph label (e.g., "Body Paragraph 2", "Conclusion")
  - "issue": a short explanation of the problem
  - "suggestion": a brief suggestion to realign the paragraph with proper contextual focus
- Only flag paragraphs that are off-topic, too general, or lack contextual relevance.
- Prioritize suggestions that include relevant local context, examples, or regional considerations.
- Output ONLY a JSON array in this format:
[
  {
    "paragraph": "Body Paragraph 2",
    "issue": "Lacks contextual focus",
    "suggestion": "Include more specific local examples and contextual information relevant to the topic."
  }
]`;

export async function checkRelevance(topic: string, essay: string) {
  const localization = detectLocalizationContext(topic);
  
  // Choose appropriate prompt based on whether topic specifies localization
  const systemPrompt = localization.hasLocalization 
    ? localizedRelevanceCheckPrompt 
    : relevanceCheckPrompt;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Essay Topic: ${topic}\n\nEssay:\n${essay}` }
  ];
  
  const model = 'mistralai/mistral-7b-instruct:free';
          const client = openRouterClient;
    const response = await client.chatCompletion(messages, model);

  // Extract first JSON array from the response
  const match = response.match(/\[[\s\S]*?\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse relevance JSON:', e, match[0]);
      return [];
    }
  }
  return [];
} 

// 1. Relevance Feedback Wording
export const relevanceFeedback = {
  perfect: "✅ Excellent! This paragraph directly supports the essay topic with clear focus.",
  slightDrift: "🟡 Mostly relevant, but could better highlight how timeless themes apply to modern digital behavior.",
  needsFocus: "🟠 Some sentences drift from the main idea. Try tightening the focus to directly support your thesis.",
  offTopic: "🔴 This paragraph may not clearly relate to the topic. Consider linking it more explicitly to your argument.",
};

export function generateRelevanceFeedback(score: number): string {
  if (score >= 95) return relevanceFeedback.perfect;
  if (score >= 85) return relevanceFeedback.slightDrift;
  if (score >= 70) return relevanceFeedback.needsFocus;
  return relevanceFeedback.offTopic;
}

// 2. Fairer Relevance Score Logic
export function calculateRelevanceScore(paragraphScores: number[]): number {
  const average = paragraphScores.reduce((a, b) => a + b, 0) / paragraphScores.length;

  if (average >= 95) return 100;
  if (average >= 90) return 95;
  if (average >= 85) return 90;
  if (average >= 80) return 85;
  if (average >= 70) return 80;
  return Math.round(average);
} 