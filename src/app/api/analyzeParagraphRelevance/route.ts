import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '../../../lib/openrouter';
import type { OpenRouterMessage } from '../../../lib/openrouter';

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

const paragraphAnalysisPrompt = `You are an essay relevance checker.

Your task is to analyze each paragraph of a given essay and determine how well it supports the main topic or thesis. Use **flexible relevance checking**.

🔍 Instructions:
- Evaluate how well each paragraph supports the main argument or topic.
- Accept both localized (e.g., Nigerian examples) and global/international examples (e.g., Coursera, Google Classroom) **as long as they support the thesis**.
- Do NOT penalize a paragraph for using non-local examples if they are meaningful and logically contribute to the essay's main idea.
- Flag a paragraph **only if it is clearly unrelated, redundant, or weakly connected** to the essay's argument.

🎨 Scoring Guide:
✅ On-topic – Directly or indirectly supports the thesis (score 80-100).
⚠️ Somewhat Off-topic – Mostly relevant but needs clearer connection to the topic (score 50-79).
❌ Off-topic – Irrelevant or distracting content (score 0-49).

Do not be overly strict. Be helpful and suggest improvements when relevance is low.

OUTPUT FORMAT:
Return ONLY a valid JSON object with this structure. Do not include any text before or after the JSON:
{
  "relevanceReport": [
    {
      "paragraph": 1,
      "originalText": "The original paragraph text here...",
      "relevanceScore": 85,
      "status": "✅ On-topic",
      "feedback": "Clearly supports the main idea with good examples.",
      "suggestion": null,
      "improvedParagraph": null
    }
  ]
}

If autoFix is true, also include a "fixedEssay" field with the full essay where problematic paragraphs are replaced with improved versions. IMPORTANT: Preserve paragraph breaks in the fixedEssay by using double line breaks (\\n\\n) between paragraphs.

IMPORTANT: 
- Return ONLY the JSON object, no additional text
- Ensure all text fields are properly escaped
- Do not include any control characters or special formatting
- Make sure the JSON is valid and parseable
- Use flexible relevance checking - don't be overly strict
- For fixedEssay: Use \\n\\n to separate paragraphs, not single \\n`;

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

export async function POST(request: NextRequest) {
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

${autoFix ? 'Please provide both the relevance analysis AND a fixed version of the essay where problematic paragraphs are replaced with improved versions.' : 'Please provide only the relevance analysis.'}`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: paragraphAnalysisPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Use a reliable model for analysis
    const model = 'mistralai/mistral-7b-instruct:free';
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
    for (const analysis of analysisResult.relevanceReport) {
      if (typeof analysis.paragraph !== 'number' ||
          typeof analysis.originalText !== 'string' ||
          typeof analysis.relevanceScore !== 'number' ||
          typeof analysis.feedback !== 'string') {
        throw new Error('Invalid paragraph analysis structure');
      }
      
          // Validate status with more flexible checking
    const validStatuses = ['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic', '⚠️ Somewhat Off-topic'];
    if (!validStatuses.includes(analysis.status)) {
      // If status is invalid, set a default
      analysis.status = '🟡 Needs Improvement';
    }
  }

  // Format the fixed essay if it exists
  if (analysisResult.fixedEssay) {
    analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay);
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