import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '../../../lib/openrouter';
import type { OpenRouterMessage } from '../../../lib/openrouter';

type IssueType = 'relevance' | 'grammar' | 'clarity' | 'vocabulary' | 'sentence-structure' | 'logic-flow' | 'repetition' | 'vague-language' | 'contradiction' | 'lack-of-detail' | 'transitions' | 'incomplete-idea';

const isIssueType = (type: string): type is IssueType => {
  return [
    'relevance', 'grammar', 'clarity', 'vocabulary', 'sentence-structure',
    'logic-flow', 'repetition', 'vague-language', 'contradiction',
    'lack-of-detail', 'transitions', 'incomplete-idea'
  ].includes(type);
};

const processIssues = (issues: any[]): Issue[] => {
  if (!Array.isArray(issues)) return [];
  
  return issues
    .filter(issue => issue && typeof issue === 'object')
    .map(issue => ({
      type: isIssueType(issue.type) ? issue.type : 'clarity',
      description: typeof issue.description === 'string' ? issue.description : 'No description provided',
      examples: Array.isArray(issue.examples) ? issue.examples.filter((e: any) => typeof e === 'string') : []
    }));
};

interface ParagraphRelevanceRequest {
  topic: string;
  essay: string;
  autoFix?: boolean;
  existingAnalysis?: any[]; // Array of paragraph analyses for context in auto-fix mode
}

interface ParagraphAnalysisV2 {
  paragraph: number;
  originalText: string;
  status: 'On-topic' | 'Needs Improvement' | 'Off-topic';
  issues: string[];
  suggestion: string;
}

interface Issue {
  type: IssueType;
  description: string;
  examples?: string[];
}

interface ParagraphAnalysis {
  paragraph: number;
  originalText: string;
  status: "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic";
  issues: Issue[];
  feedback: string;
  suggestion: string;
  improvedParagraph?: string | null;
}

interface ParagraphRelevanceResponse {
  relevanceReport: ParagraphAnalysis[];
  fixedEssay?: string;
}

const UNIVERSAL_PROMPT = `You are a paragraph relevance analyzer. You will receive an essay split into paragraphs. Your job is to analyze each paragraph and return a JSON array.

For each paragraph, include:
- "paragraph": paragraph number (starting from 1)
- "status": must be exactly one of these: "On-topic", "Needs Improvement", or "Off-topic"
- "feedback": short explanation of why the paragraph has that status
- "suggestions": an array of short, practical tips for improvement

Rules:
- Always output ONLY a valid JSON array containing objects for each paragraph — no extra text, explanations, or formatting outside JSON.
- If there are no issues, set "suggestions" to an empty array.
- Be specific and actionable in your feedback.
- Do NOT include any numeric scores, percentages, or ratings.`;

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

function extractAndParseJson(response: string, essayContent?: string): any {
  // Split the essay into paragraphs for reference
  const essayParagraphs = essayContent ? essayContent.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
  
  // Method 1: Try to parse the entire response as a JSON array
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      // Transform the array of paragraph analyses to match our expected format
      const relevanceReport = parsed.map((item: any, index: number) => {
        // Get the original text from the essay content if available, otherwise use the response
        const originalText = essayParagraphs[index] || 
          (typeof item.paragraph === 'string' ? item.paragraph : 
           typeof item.text === 'string' ? item.text : 
           `Paragraph ${index + 1}`);
        
        return {
          paragraph: index + 1,
          originalText: originalText.trim(),
          status: getStatusEmoji(item.status || 'Needs Improvement'),
          issues: (Array.isArray(item.issues) ? item.issues : []).map((issue: any) => ({
            type: getIssueType(String(issue).toLowerCase()),
            description: String(issue),
            examples: []
          })),
          feedback: item.feedback ? String(item.feedback) : '',
          suggestion: Array.isArray(item.suggestions) && item.suggestions.length > 0 
            ? String(item.suggestions[0])
            : '',
          improvedParagraph: null
        };
      });
      return { relevanceReport };
    }
  } catch (error) {
    console.error('Failed to parse as JSON array:', error);
  }

  // Method 2: Try to extract a JSON array from the response
  const arrayMatch = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (arrayMatch) {
    try {
      const parsedArray = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsedArray)) {
        // Get the original paragraphs from the parsed array
        const originalParagraphs = parsedArray.map((p: any) => {
          const text = p.originalText || p.text || p.paragraph || '';
          return typeof text === 'string' ? text.trim() : String(text).trim();
        });

        const relevanceReport = parsedArray.map((item: any, index: number) => ({
          paragraph: index + 1,
          originalText: originalParagraphs[index] || `Paragraph ${index + 1}`,
          status: getStatusEmoji(item.status || 'Needs Improvement'),
          issues: (Array.isArray(item.issues) ? item.issues : []).map((issue: any) => ({
            type: getIssueType(String(issue).toLowerCase()),
            description: String(issue),
            examples: []
          })),
          feedback: item.feedback ? String(item.feedback) : '',
          suggestion: Array.isArray(item.suggestions) && item.suggestions.length > 0 
            ? String(item.suggestions[0])
            : '',
          improvedParagraph: null
        }));
        return { relevanceReport };
      }
    } catch (error) {
      console.error('Failed to parse extracted JSON array:', error);
    }
  }
  
  // Method 3: Fallback to manual parsing if JSON parsing fails
  try {
    const paragraphSections = response.split(/\n\s*\n/);
    const relevanceReport = [];
    
    for (let i = 0; i < paragraphSections.length; i++) {
      const section = paragraphSections[i].trim();
      if (!section) continue;
      
      // Try to extract status from the section
      let status = 'Needs Improvement';
      if (section.includes('On-topic')) status = 'On-topic';
      else if (section.includes('Off-topic')) status = 'Off-topic';
      
      // Extract issues and suggestions
      const issues: string[] = [];
      let suggestion = '';
      
      // Look for issues list
      const issuesMatch = section.match(/Issues:[\s\n]+([\s\S]*?)(?=\n\w|$)/i);
      if (issuesMatch) {
        issues.push(...issuesMatch[1].split('\n').filter(Boolean).map(s => s.trim().replace(/^[-•*]\s*/, '')));
      }
      
      // Look for suggestion
      const suggestionMatch = section.match(/Suggestion:[\s\n]+([^\n]+)/i);
      if (suggestionMatch) {
        suggestion = suggestionMatch[1].trim();
      }
      
      // Extract the paragraph text (first line that's not a heading or list item)
      const paragraphMatch = section.match(/^([^\n\-•*:]+)\n/);
      const paragraphText = paragraphMatch ? paragraphMatch[1].trim() : section.split('\n')[0].trim();
      
      relevanceReport.push({
        paragraph: i + 1,
        originalText: paragraphText,
        status: getStatusEmoji(status),
        issues: issues.map(issue => ({
          type: getIssueType(issue.toLowerCase()),
          description: issue,
          examples: []
        })),
        feedback: suggestion,
        suggestion,
        improvedParagraph: null
      });
    }
    
    if (relevanceReport.length > 0) {
      return { relevanceReport };
    }
  } catch (error) {
    console.error('Failed manual parsing:', error);
  }
  
  // If all else fails, return a single entry with the entire response as an error
  return {
    relevanceReport: [{
      paragraph: 1,
      originalText: 'Failed to parse analysis. Please try again.',
      status: '❌ Error',
      issues: [],
      feedback: 'There was an error processing your request. The response format was not recognized.',
      suggestion: 'Please try again or contact support if the issue persists.',
      improvedParagraph: null
    }]
  };
}

// Helper function to get status with emoji
function getStatusEmoji(status: string): string {
  const statusMap: Record<string, string> = {
    'on-topic': '✅ On-topic',
    'needs improvement': '🟡 Needs Improvement',
    'off-topic': '❌ Off-topic',
    'error': '❌ Error'
  };
  
  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || '🟡 Needs Improvement';
}

// Helper function to map issue text to issue type
function getIssueType(issueText: string): IssueType {
  if (issueText.includes('grammar')) return 'grammar';
  if (issueText.includes('clarity') || issueText.includes('unclear')) return 'clarity';
  if (issueText.includes('vocab') || issueText.includes('word choice')) return 'vocabulary';
  if (issueText.includes('sentence') || issueText.includes('structure')) return 'sentence-structure';
  if (issueText.includes('logic') || issueText.includes('flow')) return 'logic-flow';
  if (issueText.includes('repeat') || issueText.includes('repetition')) return 'repetition';
  if (issueText.includes('vague') || issueText.includes('unclear')) return 'vague-language';
  if (issueText.includes('contradict') || issueText.includes('inconsist')) return 'contradiction';
  if (issueText.includes('detail') || issueText.includes('evidence')) return 'lack-of-detail';
  if (issueText.includes('transition')) return 'transitions';
  if (issueText.includes('incomplete') || issueText.includes('unfinished')) return 'incomplete-idea';
  return 'clarity'; // Default to clarity for unknown issue types
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
  const startTime = Date.now();
  
  try {
    console.log('[AnalyzeParagraphRelevance] Starting request processing');
    
    // Parse and validate request body
    let requestBody: ParagraphRelevanceRequest;
    try {
      requestBody = await request.json();
      console.log('[AnalyzeParagraphRelevance] Request body parsed successfully');
    } catch (e) {
      console.error('[AnalyzeParagraphRelevance] Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body. Please provide a valid JSON object with topic and essay.' },
        { status: 400 }
      );
    }

    const { topic, essay, autoFix = false } = requestBody;

    // Input validation with detailed error messages
    if (!topic || !essay) {
      const missingFields = [];
      if (!topic) missingFields.push('topic');
      if (!essay) missingFields.push('essay');
      
      const errorMessage = `Missing required field(s): ${missingFields.join(', ')}`;
      console.error(`[AnalyzeParagraphRelevance] ${errorMessage}`);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (typeof topic !== 'string' || topic.trim().length < 5) {
      console.error(`[AnalyzeParagraphRelevance] Invalid topic: ${topic?.substring(0, 50)}...`);
      return NextResponse.json(
        { error: 'Topic must be at least 5 characters long' },
        { status: 400 }
      );
    }

    if (typeof essay !== 'string' || essay.trim().length < 50) {
      console.error('[AnalyzeParagraphRelevance] Essay is too short');
      return NextResponse.json(
        { error: 'Essay must be at least 50 characters long' },
        { status: 400 }
      );
    }
    
    console.log(`[AnalyzeParagraphRelevance] Input validated. Topic length: ${topic.length}, Essay length: ${essay.length}`);

    // First, split the essay into paragraphs for accurate mapping
    const paragraphs = essay.split('\n\n').filter(p => p.trim().length > 0);
    
    // Prepare the prompt with clear instructions and paragraph mapping
    const userPrompt = `Essay Topic: ${topic}

Essay (with paragraph numbers):
${paragraphs.map((p, i) => `[Paragraph ${i + 1}]\n${p}`).join('\n\n')}

${autoFix ? `Analyze and improve this essay while maintaining its original paragraph structure. For EACH paragraph:

1. Carefully read and understand the paragraph text
2. Determine if it is relevant to the topic "${topic}"
3. If relevant, improve its clarity and quality
4. If not relevant, mark it as off-topic

For EACH paragraph, return a JSON object with these exact fields:
- paragraph: number (from the [Paragraph X] marker)
- originalText: string (the exact original text)
- status: "On-topic" (directly relevant), "Needs Improvement" (relevant but needs work), or "Off-topic" (not relevant)
- feedback: 1-2 sentences explaining your analysis
- suggestions: array of specific improvement suggestions (empty if none)
- improvedParagraph: the enhanced version (or original if no improvements needed)

CRITICAL RULES:
1. The output MUST be a valid JSON array with one object per paragraph
2. The order of paragraphs MUST be preserved exactly as in the original
3. The originalText MUST match the input text exactly
4. For off-topic paragraphs, set improvedParagraph to an empty string

Example:
[
  {
    "paragraph": 1,
    "originalText": "Exercise is good for health.",
    "status": "Needs Improvement",
    "feedback": "The point is valid but could be more specific and detailed.",
    "suggestions": ["Add specific health benefits", "Include examples of exercises"],
    "improvedParagraph": "Regular exercise provides numerous health benefits, including improved cardiovascular health, stronger muscles, and better mental well-being. Activities like walking, swimming, or cycling for 30 minutes daily can significantly enhance overall health."
  }
]` : `Please analyze each paragraph of the essay and return a JSON array where each object has these fields:
- paragraph: number (starting from 1)
- originalText: string
- status: "On-topic" | "Needs Improvement" | "Off-topic"
- feedback: string (explanation of the analysis)
- suggestions: string[] (specific improvement suggestions)

Example:
[
  {
    "paragraph": 1,
    "originalText": "Exercise is good for health.",
    "status": "Needs Improvement",
    "feedback": "The point is valid but could be more specific.",
    "suggestions": ["Add specific health benefits", "Include examples of exercises"]
  }
]`}`;

    // Prepare the chat completion request
    console.log(`[AnalyzeParagraphRelevance] Sending request to OpenRouter (autoFix: ${autoFix})`);
    
    const messages: OpenRouterMessage[] = [
      { 
        role: 'system', 
        content: UNIVERSAL_PROMPT 
      },
      { 
        role: 'user', 
        content: userPrompt 
      }
    ];

    // Use a reliable model for analysis
    const model = 'mistralai/mistral-7b-instruct:free';
    console.log(`[AnalyzeParagraphRelevance] Using model: ${model}`);
    
    const response = await openRouterClient.chatCompletion(messages, model);
    console.log('[AnalyzeParagraphRelevance] Received response from OpenRouter');

    // Clean the response and extract JSON
    let analysisResult: ParagraphRelevanceResponse | undefined;
    
    try {
      console.log('[AnalyzeParagraphRelevance] Processing AI response');
      
      // Clean the response by removing control characters and normalizing whitespace
      const cleanedResponse = response
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Normalize line endings
        .trim();
      
      // First, try to find a JSON array in the response
      let jsonMatch = cleanedResponse.match(/\[\s*\{.*\}\s*\]/s);
      
      if (!jsonMatch) {
        // If no array found, try to extract individual JSON objects
        const jsonObjects = cleanedResponse.match(/\{[^\{\}]*\}/gs) || [];
        if (jsonObjects.length > 0) {
          jsonMatch = `[${jsonObjects.join(',')}]`;
        }
      }
      
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
            // Map the parsed response to our expected format
            analysisResult = {
              relevanceReport: parsedResponse.map((item: any) => ({
                paragraph: typeof item.paragraph === 'number' ? item.paragraph : 0,
                originalText: typeof item.originalText === 'string' ? item.originalText : '',
                status: getStatusEmoji(item.status || 'Needs Improvement'),
                feedback: typeof item.feedback === 'string' ? item.feedback : 'No feedback provided.',
                suggestion: Array.isArray(item.suggestions) && item.suggestions.length > 0 
                  ? item.suggestions[0] 
                  : 'No specific suggestions provided.',
                issues: [],
                improvedParagraph: autoFix && typeof item.improvedParagraph === 'string' 
                  ? item.improvedParagraph 
                  : null
              }))
            };
          }
        } catch (e) {
          console.error('[AnalyzeParagraphRelevance] Error parsing JSON response:', e);
        }
      }
      
      // Fallback if JSON parsing failed
      if (!analysisResult) {
        console.error('[AnalyzeParagraphRelevance] Falling back to extractAndParseJson');
        analysisResult = extractAndParseJson(cleanedResponse, essay);
      }
      
      if (!analysisResult) {
        console.error('[AnalyzeParagraphRelevance] Failed to parse AI response as JSON');
        console.error('[AnalyzeParagraphRelevance] First 500 chars of response:', response.substring(0, 500));
        
        // Create a fallback analysis by splitting the essay into paragraphs
        const paragraphs = essay.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const fallbackReport = paragraphs.map((paragraph, index): ParagraphAnalysis => ({
          paragraph: index + 1,
          originalText: paragraph.trim(),
          status: "🟡 Needs Improvement" as const,
          issues: [{
            type: 'clarity',
            description: 'Unable to analyze due to parsing error',
            examples: []
          }],
          feedback: "Unable to analyze due to parsing error. The AI response format was unexpected.",
          suggestion: "Please try again or check the input format.",
          improvedParagraph: autoFix ? paragraph.trim() : null
        }));
        
        analysisResult = { 
          relevanceReport: fallbackReport,
          fixedEssay: autoFix ? essay : undefined
        };
      }
    } catch (parseError) {
      console.error('[AnalyzeParagraphRelevance] Error processing AI response:', parseError);
      
      // Create a minimal fallback response
      const paragraphs = essay.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      const fallbackReport = paragraphs.map((paragraph, index): ParagraphAnalysis => ({
        paragraph: index + 1,
        originalText: paragraph.trim(),
        status: "❌ Off-topic" as const,
        issues: [{
          type: 'relevance',
          description: 'Analysis failed due to an error',
          examples: []
        }],
        feedback: "An error occurred while analyzing this paragraph. Please try again.",
        suggestion: "Check your input and try again. If the problem persists, contact support.",
        improvedParagraph: null
      }));
      
      analysisResult = { relevanceReport: fallbackReport };
    }

    // Ensure we have a valid result with proper structure
    if (!analysisResult) {
      console.error('[AnalyzeParagraphRelevance] No analysis result generated');
      throw new Error('Failed to generate analysis result');
    }

    // Validate the response structure
    if (!analysisResult.relevanceReport || !Array.isArray(analysisResult.relevanceReport)) {
      console.error('[AnalyzeParagraphRelevance] Invalid relevance report structure:', analysisResult);
      throw new Error('Invalid analysis response structure - missing or invalid relevanceReport');
    }

    console.log(`[AnalyzeParagraphRelevance] Validating ${analysisResult.relevanceReport.length} paragraph analyses`);
    
    // Validate each paragraph analysis
    const validatedReport = analysisResult.relevanceReport.map((analysis, index) => {
      // Ensure issues is an array of valid Issue objects
      const issues = Array.isArray(analysis.issues) 
        ? analysis.issues
            .filter(issue => issue && typeof issue === 'object' && 'type' in issue && 'description' in issue)
            .map(issue => ({
              type: isIssueType(issue.type) ? issue.type : 'clarity',
              description: typeof issue.description === 'string' 
                ? issue.description 
                : 'Issue found',
              examples: Array.isArray(issue.examples) 
                ? issue.examples.filter(e => typeof e === 'string') 
                : []
            }))
        : [];

      // Ensure we have a valid suggestion
      const suggestion = typeof analysis.suggestion === 'string' 
        ? analysis.suggestion 
        : '';

      // Create a safe copy with defaults
      const safeAnalysis: ParagraphAnalysis = {
        paragraph: typeof analysis.paragraph === 'number' ? analysis.paragraph : index + 1,
        originalText: typeof analysis.originalText === 'string' && analysis.originalText.trim() 
          ? analysis.originalText.trim() 
          : 'No content provided',
        status: ['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic'].includes(analysis.status)
          ? analysis.status as '✅ On-topic' | '🟡 Needs Improvement' | '❌ Off-topic'
          : '🟡 Needs Improvement',
        issues: issues,
        feedback: typeof analysis.feedback === 'string' && analysis.feedback.trim()
          ? analysis.feedback.trim()
          : 'No feedback provided.',
        suggestion: suggestion,
        improvedParagraph: (autoFix && typeof analysis.improvedParagraph === 'string' && analysis.improvedParagraph.trim())
          ? analysis.improvedParagraph.trim()
          : null
      };
      
      return safeAnalysis;
    });
    
    // Update the analysis result with validated data
    analysisResult.relevanceReport = validatedReport;

    // Generate fixed essay from improved paragraphs if in auto-fix mode
    if (autoFix) {
      try {
        console.log('[AnalyzeParagraphRelevance] Generating fixed essay from improved paragraphs');
        
        // Sort paragraphs by their original order
        const sortedParagraphs = [...analysisResult.relevanceReport]
          .sort((a, b) => a.paragraph - b.paragraph);
        
        // Combine improved paragraphs into a single essay
        const fixedEssay = sortedParagraphs
          .map(p => p.improvedParagraph || p.originalText)
          .filter(Boolean)
          .join('\n\n');
        
        if (fixedEssay) {
          console.log('[AnalyzeParagraphRelevance] Generated fixed essay with', 
            fixedEssay.split('\n\n').length, 'paragraphs');
          
          // Format the fixed essay
          analysisResult.fixedEssay = formatFixedEssay(fixedEssay)
            .replace(/\n{3,}/g, '\n\n');
            
          // Fallback: if still only one paragraph, split into paragraphs by sentences
          if (!analysisResult.fixedEssay.includes('\n\n')) {
            console.log('[AnalyzeParagraphRelevance] Using fallback paragraph splitting');
            analysisResult.fixedEssay = fallbackParagraphSplit(analysisResult.fixedEssay);
            analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay);
          }
          
          console.log('[AnalyzeParagraphRelevance] Final fixed essay length:', 
            analysisResult.fixedEssay.length);
        } else {
          console.warn('[AnalyzeParagraphRelevance] No content available for fixed essay');
        }
      } catch (formatError) {
        console.error('[AnalyzeParagraphRelevance] Error generating fixed essay:', formatError);
        // If formatting fails, return the original essay
        analysisResult.fixedEssay = essay;
      }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`[AnalyzeParagraphRelevance] Request completed in ${processingTime}ms`);
    return NextResponse.json(analysisResult);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AnalyzeParagraphRelevance] Error processing request:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('[AnalyzeParagraphRelevance] Error stack:', error.stack);
    }
    
    // Provide a more user-friendly error message
    let statusCode = 500;
    let errorResponse = 'Failed to analyze paragraph relevance';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      statusCode = 504; // Gateway Timeout
      errorResponse = 'The analysis took too long to complete. Please try again with a shorter essay or try again later.';
    } else if (errorMessage.includes('network')) {
      statusCode = 503; // Service Unavailable
      errorResponse = 'Unable to connect to the analysis service. Please check your internet connection and try again.';
    } else if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
      statusCode = 500; // Internal Server Error (don't expose auth details)
      errorResponse = 'An authentication error occurred. Please try again or contact support if the problem persists.';
    }
    
    return NextResponse.json(
      { 
        error: errorResponse,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { status: statusCode }
    );
  }
} 