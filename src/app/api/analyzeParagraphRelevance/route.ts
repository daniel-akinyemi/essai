import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '../../../lib/openrouter';
import type { OpenRouterMessage } from '../../../lib/openrouter';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set. The analyzeParagraphRelevance API will not function correctly.');
}

interface ParagraphRelevanceRequest {
  topic: string;
  essay: string;
  autoFix?: boolean;
}

interface ParagraphAnalysis {
  paragraph: number;
  originalText: string;
  relevanceScore: number;
  status: "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic" | "⚠️ Somewhat Off-topic";
  feedback: string;
  suggestion?: string;
  improvedParagraph?: string | null;
}

interface ParagraphRelevanceResponse {
  relevanceReport: ParagraphAnalysis[];
  fixedEssay?: string;
}

const paragraphAnalysisPrompt = `You are a paragraph analysis and improvement assistant. Your tasks:
1️⃣ Analyze each paragraph for relevance to the essay topic.
2️⃣ Identify if it is on-topic, off-topic, or needs improvement.
3️⃣ Provide a clear score (out of 100) and explain: is the issue Clarity, Relevance, Coherence, or Grammar?
4️⃣ When fixing the essay:
   - Clearly separate each paragraph with a blank line.
   - Do not merge two ideas into one block.
   - Use natural transitions like: Furthermore, Moreover, In addition, Consequently.
5️⃣ Final output: A clean, readable essay with clear paragraph breaks.

Formatting Example for Final Output:
[Paragraph 1]

(blank line)

[Paragraph 2]

(blank line)

... etc.

Return your analysis and the fixed essay in the following JSON format:
{
  "relevanceReport": [
    {
      "paragraph": 1,
      "originalText": "The original paragraph text here...",
      "relevanceScore": 85,
      "status": "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic",
      "issue": "Clarity" | "Relevance" | "Coherence" | "Grammar",
      "explanation": "Short explanation."
    }
  ],
  "fixedEssay": "Essay text with each paragraph separated by a blank line, using natural transitions."
}

IMPORTANT: 
- Return ONLY the JSON object, no additional text
- Ensure all text fields are properly escaped
- Do not include any control characters or special formatting
- Make sure the JSON is valid and parseable
- For fixedEssay: Use \n\n to separate paragraphs, not single \n, and ensure each paragraph is a logical academic paragraph with transitions as needed.`;

function repairJsonString(jsonString: string): string {
  // First, normalize line endings and remove control characters
  let repaired = jsonString
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Find all string values and fix newlines within them
  const stringRegex = /"([^"]*(?:\\.[^"]*)*)"/g;
  repaired = repaired.replace(stringRegex, (match, content) => {
    // Replace newlines and multiple spaces within string content
    const fixedContent = content
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
    return `"${fixedContent}"`;
  });
  
  // Remove extra whitespace around JSON structure
  repaired = repaired
    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .replace(/\s*\{\s*/g, '{') // Remove spaces around braces
    .replace(/\s*\}\s*/g, '}') // Remove spaces around braces
    .replace(/\s*\[\s*/g, '[') // Remove spaces around brackets
    .replace(/\s*\]\s*/g, ']'); // Remove spaces around brackets
  
  return repaired;
}

function extractAndParseJson(response: string): any {
  // Method 1: Try to extract complete JSON object and repair it
  let jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const repairedJson = repairJsonString(jsonMatch[0]);
      // console.log('Repaired JSON:', repairedJson);
      return JSON.parse(repairedJson);
    } catch (error) {
      console.error('Failed to parse repaired JSON:', error);
    }
  }
  
  // Method 2: Try to extract just the relevanceReport array
  const arrayMatch = response.match(/"relevanceReport":\s*(\[[\s\S]*?\])/);
  if (arrayMatch) {
    try {
      const repairedArray = repairJsonString(arrayMatch[1]);
      // console.log('Repaired array JSON:', repairedArray);
      const relevanceReport = JSON.parse(repairedArray);
      return { relevanceReport };
    } catch (error) {
      console.error('Failed to parse repaired array JSON:', error);
    }
  }
  
  // Method 3: Manual parsing as last resort
  try {
    // Extract paragraph data manually using regex
    const paragraphMatches = response.match(/"paragraph":\s*(\d+),\s*"originalText":\s*"([^"]*(?:\\.[^"]*)*)",\s*"relevanceScore":\s*(\d+),\s*"status":\s*"([^"]*(?:\\.[^"]*)*)",\s*"feedback":\s*"([^"]*(?:\\.[^"]*)*)"/g);
    
    if (paragraphMatches) {
      const relevanceReport = paragraphMatches.map((match, index) => {
        const paragraphMatch = match.match(/"paragraph":\s*(\d+)/);
        const textMatch = match.match(/"originalText":\s*"([^"]*(?:\\.[^"]*)*)"/);
        const scoreMatch = match.match(/"relevanceScore":\s*(\d+)/);
        const statusMatch = match.match(/"status":\s*"([^"]*(?:\\.[^"]*)*)"/);
        const feedbackMatch = match.match(/"feedback":\s*"([^"]*(?:\\.[^"]*)*)"/);
        
        return {
          paragraph: parseInt(paragraphMatch?.[1] || (index + 1).toString()),
          originalText: (textMatch?.[1] || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
          relevanceScore: parseInt(scoreMatch?.[1] || '75'),
          status: statusMatch?.[1] || '🟡 Needs Improvement',
          feedback: (feedbackMatch?.[1] || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
          suggestion: null,
          improvedParagraph: null
        };
      });
      
      return { relevanceReport };
    }
  } catch (error) {
    console.error('Failed manual parsing:', error);
  }
  
  return null;
}

function formatFixedEssay(essay: string): string {
  // Replace escaped newlines with actual newlines
  let formatted = essay
    .replace(/\\n\\n/g, '\n\n') // Replace double escaped newlines with paragraph breaks
    .replace(/\\n/g, '\n') // Replace single escaped newlines with line breaks
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .trim();
  
  return formatted;
}

function fallbackParagraphSplit(text: string): string {
  // Split on sentence boundaries (period, exclamation, question mark followed by space and capital letter)
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const paragraphs = [];
  let current = '';
  let count = 0;
  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i];
    count++;
    // Group every 2-3 sentences into a paragraph
    if (count >= 3 || i === sentences.length - 1) {
      paragraphs.push(current.trim());
      current = '';
      count = 0;
    }
  }
  return paragraphs.join('\n\n');
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { 
        error: 'OpenRouter API is not configured',
        message: 'This feature requires an OpenRouter API key to be set in the environment variables.'
      },
      { status: 503, statusText: 'Service Unavailable' }
    );
  }

  try {
    const { topic, essay, autoFix = false }: ParagraphRelevanceRequest = await request.json();

    // Validate input
    if (!topic || !essay) {
      return NextResponse.json(
        { error: 'Topic and essay are required' },
        { status: 400 }
      );
    }

    if (topic.length < 5) {
      return NextResponse.json(
        { error: 'Topic must be at least 5 characters long' },
        { status: 400 }
      );
    }

    if (essay.length < 50) {
      return NextResponse.json(
        { error: 'Essay must be at least 50 characters long' },
        { status: 400 }
      );
    }

    // Prepare the prompt with autoFix instruction
    const userPrompt = `Essay Topic: ${topic}

Essay:
${essay}

${autoFix ? `When providing Auto-Fix:
- Each improved paragraph must end with a clear blank line for readability. Do not merge paragraphs together.
- Use transition words ("Furthermore,", "In addition,", "Moreover,", "Consequently,") to improve flow between ideas.
- For scoring, explain clearly why the paragraph lost points (mention clarity, relevance, grammar, or coherence). For example: 'Score 60/100 because this paragraph shifts focus away from healthy eating and adds confusion. It requires rephrasing to link clearly back to the main topic.'
- Output the fixed essay with proper paragraph breaks and clear formatting, as in the provided example.
- Do not include extra commentary outside this format.
` : ''}`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: paragraphAnalysisPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Use a reliable model for analysis
    const model = 'mistralai/mistral-7b-instruct:free';
    const openRouterClient = getOpenRouterClient();
    const response = await openRouterClient.chatCompletion(messages, model);

    // Clean the response and extract JSON
    let analysisResult: ParagraphRelevanceResponse | undefined;
    
    // Clean the response by removing control characters and normalizing whitespace
    const cleanedResponse = response
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Normalize line endings
      .trim();
    
    // console.log('Cleaned AI response:', cleanedResponse);
    
    // Try to extract complete JSON object
    analysisResult = extractAndParseJson(cleanedResponse);
    
    // If still no result, try to manually construct from the response
    if (!analysisResult) {
      console.error('Raw AI response:', response);
      console.error('Cleaned AI response:', cleanedResponse);
      
      // Create a fallback analysis by splitting the essay into paragraphs
      const paragraphs = essay.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const fallbackReport = paragraphs.map((paragraph, index) => ({
        paragraph: index + 1,
        originalText: paragraph.trim(),
        relevanceScore: 75, // Default score
        status: "🟡 Needs Improvement" as const,
        feedback: "Unable to analyze due to parsing error. Please try again.",
        suggestion: "Consider reviewing this paragraph for topic relevance.",
        improvedParagraph: null
      }));
      
      analysisResult = { relevanceReport: fallbackReport };
    }

    // Ensure we have a valid result
    if (!analysisResult) {
      throw new Error('Failed to generate analysis result');
    }

    // Validate the response structure
    if (!analysisResult.relevanceReport || !Array.isArray(analysisResult.relevanceReport)) {
      throw new Error('Invalid analysis response structure');
    }

    // Validate each paragraph analysis
    for (const [index, analysis] of analysisResult.relevanceReport.entries()) {
      // Fill missing fields with safe defaults
      if (typeof analysis.paragraph !== 'number') analysis.paragraph = index + 1;
      if (typeof analysis.originalText !== 'string') analysis.originalText = '';
      if (typeof analysis.relevanceScore !== 'number') analysis.relevanceScore = 75;
      if (typeof analysis.feedback !== 'string') analysis.feedback = 'No feedback provided.';
      if (typeof analysis.status !== 'string' || !['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic', '⚠️ Somewhat Off-topic'].includes(analysis.status)) {
        analysis.status = '🟡 Needs Improvement';
      }
      if (typeof analysis.suggestion !== 'string') analysis.suggestion = undefined;
      if (typeof analysis.improvedParagraph !== 'string' && analysis.improvedParagraph !== null) analysis.improvedParagraph = null;
  }

  // Format the fixed essay if it exists
  if (analysisResult.fixedEssay) {
    analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay)
      .replace(/\n{3,}/g, '\n\n'); // Ensure no more than two newlines between paragraphs
    // Fallback: if still only one paragraph, split into paragraphs by sentences
    if (!analysisResult.fixedEssay.includes('\n\n')) {
      analysisResult.fixedEssay = fallbackParagraphSplit(analysisResult.fixedEssay);
      analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay);
    }
  }

  return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Paragraph relevance analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze paragraph relevance' },
      { status: 500 }
    );
  }
} 