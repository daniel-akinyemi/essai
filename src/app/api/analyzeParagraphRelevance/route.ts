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
}

interface ParagraphAnalysisV2 {
  paragraph: number;
  originalText: string;
  relevance: number;
  quality: number;
  flaws: string[];
  suggestions: string[];
  classification: 'On-topic' | 'Needs Improvement' | 'Off-topic';
}

interface Issue {
  type: IssueType;
  description: string;
  examples?: string[];
}

interface ParagraphAnalysis {
  paragraph: number;
  originalText: string;
  relevanceScore: number;
  qualityScore: number;
  status: "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic" | "⚠️ Somewhat Off-topic";
  issues: Issue[];
  feedback: string;
  suggestions: string[];
  improvedParagraph?: string | null;
  vocabularyAnalysis?: {
    weakWords: string[];
    suggestedReplacements: string[];
  };
  sentenceVariety?: {
    sentenceLengths: number[];
    sentenceStructures: string[];
    suggestions: string[];
  };
}

interface ParagraphRelevanceResponse {
  relevanceReport: ParagraphAnalysis[];
  fixedEssay?: string;
}

const UNIVERSAL_PROMPT = `You are a professional essay paragraph evaluator. Your job is to analyze each paragraph of an essay for BOTH topic relevance and writing quality.

For each paragraph:

1. RELEVANCE SCORING (0–100):
   - 90–100: Fully on-topic, directly related to the essay topic, no irrelevant sentences.
   - 70–89: Mostly on-topic but contains slightly unrelated or filler content.
   - Below 70: Mostly or completely off-topic.

2. QUALITY SCORING (0–100):
   Evaluate based on:
     - Grammar and sentence structure
     - Vocabulary richness (avoid overuse of generic words like "good," "nice," "okay")
     - Clarity and conciseness (no rambling, no unnecessary repetition)
     - Sentence variety (mix of simple, compound, and complex)
     - Logical flow and transitions
     - Depth of detail and examples

3. FLAW DETECTION:
   Identify and list specific issues such as:
     - Exact repeated words or phrases
     - Contradictions or unclear comparisons
     - Weak or vague language
     - Poor transitions between ideas
     - Lack of explanation or evidence

4. IMPROVEMENT SUGGESTIONS:
   Give clear, actionable ways to improve the paragraph while keeping its meaning.

5. FINAL CLASSIFICATION:
   - On-topic: Relevance ≥ 85 AND Quality ≥ 85
   - Needs Improvement: Relevance ≥ 70 AND Quality < 85
   - Off-topic: Relevance < 70

OUTPUT FORMAT:
Paragraph {number}:
Relevance Score: {number}/100
Quality Score: {number}/100
Flaws: {list flaws here}
Suggestions: {list improvements here}
Classification: {On-topic / Needs Improvement / Off-topic}

IMPORTANT INSTRUCTIONS:
1. Return ONLY the analysis in the specified format, no additional text
2. Ensure all text is properly formatted and escaped
3. Be specific and actionable in feedback
4. Highlight exact words/phrases that need improvement
5. Provide concrete examples for suggested improvements`;

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
        
        // Extract issues from the issues section
        const issues: { type: 'relevance'|'grammar'|'clarity'|'vocabulary'|'sentence-structure'|'logic-flow'|'repetition'|'vague-language'|'contradiction'|'lack-of-detail'|'transitions'|'incomplete-idea'; description: string; examples: string[] }[] = [];
        const issuesMatch = response.match(/## Issues\n([\s\S]*?)(?=## |$)/i);
        if (issuesMatch) {
          const issuesContent = issuesMatch[1];
          const issueMatches = [...issuesContent.matchAll(/- \*\*(.*?):\*\* ([^\n]*)/g)];
          
          for (const match of issueMatches) {
            const issueType = match[1].toLowerCase().replace(/\s+/g, '-') as 'relevance'|'grammar'|'clarity'|'vocabulary'|'sentence-structure'|'logic-flow'|'repetition'|'vague-language'|'contradiction'|'lack-of-detail'|'transitions'|'incomplete-idea';
            const description = match[2].trim();
            
            // Find examples for this issue
            const exampleMatch = issuesContent.match(
              new RegExp(`- \*\*${match[1]}:\*\*[^\n]*\n([\s\S]*?)(?=\n- \*\*|$)`, 'i')
            );
            
            const examples = exampleMatch && exampleMatch[1] 
              ? exampleMatch[1].trim().split('\n').map(line => line.replace(/^\s*[-•]\s*/, '').trim())
              : [];
            
            // Only add if it's a valid issue type
            const validIssueTypes = ['relevance', 'grammar', 'clarity', 'vocabulary', 'sentence-structure', 'logic-flow', 'repetition', 'vague-language', 'contradiction', 'lack-of-detail', 'transitions', 'incomplete-idea'];
            if (validIssueTypes.includes(issueType)) {
              issues.push({
                type: issueType,
                description,
                examples: examples.filter(ex => ex.length > 0)
              });
            }
          }
        }
        
        return {
          paragraph: parseInt(paragraphMatch?.[1] || (index + 1).toString()),
          originalText: (textMatch?.[1] || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
          relevanceScore: parseInt(scoreMatch?.[1] || '75'),
          status: statusMatch?.[1] || '🟡 Needs Improvement',
          issues,
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

    // Prepare the prompt with clear instructions
    const userPrompt = `Essay Topic: ${topic}

Essay:
${essay}

${autoFix ? `When providing Auto-Fix:
1. Each improved paragraph must end with exactly one blank line for separation
2. Preserve the original paragraph count and structure
3. Use appropriate transition words (e.g., "Furthermore,", "In addition,", "Moreover")
4. For each paragraph, provide:
   - A relevance score (0-100)
   - Status: "✅ On-topic", "🟡 Needs Improvement", or "❌ Off-topic"
   - Specific feedback on issues (relevance, clarity, coherence, grammar)
   - A revised version of the paragraph if improvements are needed
5. Ensure the final output is valid JSON with proper escaping` : ''}`;

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
      
      // Try to extract complete JSON object
      analysisResult = extractAndParseJson(cleanedResponse);
      
      if (!analysisResult) {
        console.error('[AnalyzeParagraphRelevance] Failed to parse AI response as JSON');
        console.error('[AnalyzeParagraphRelevance] First 500 chars of response:', response.substring(0, 500));
        
        // Create a fallback analysis by splitting the essay into paragraphs
        const paragraphs = essay.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const fallbackReport = paragraphs.map((paragraph, index): ParagraphAnalysis => ({
          paragraph: index + 1,
          originalText: paragraph.trim(),
          relevanceScore: 75, // Default score
          qualityScore: 60, // Default quality score
          status: "🟡 Needs Improvement" as const,
          issues: [{
            type: 'clarity',
            description: 'Unable to analyze due to parsing error',
            examples: []
          }],
          feedback: "Unable to analyze due to parsing error. The AI response format was unexpected.",
          suggestions: ["Please try again or check the input format."],
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
        relevanceScore: 0,
        qualityScore: 50,
        status: "❌ Off-topic" as const,
        issues: [{
          type: 'relevance',
          description: 'Analysis failed due to an error',
          examples: []
        }],
        feedback: "An error occurred while analyzing this paragraph. Please try again.",
        suggestions: ["Check your input and try again. If the problem persists, contact support."],
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
      // Ensure issues is an array
      const issues = Array.isArray(analysis.issues) ? analysis.issues.map(issue => ({
        type: typeof issue.type === 'string' ? issue.type : 'other',
        description: typeof issue.description === 'string' ? issue.description : 'Issue found',
        examples: Array.isArray(issue.examples) ? issue.examples.filter(e => typeof e === 'string') : []
      })) : [];

      // Ensure suggestions is an array
      const suggestions = Array.isArray(analysis.suggestions) 
        ? analysis.suggestions.filter(s => typeof s === 'string')
        : [];

      // Handle vocabulary analysis
      const vocabularyAnalysis = analysis.vocabularyAnalysis && 
        typeof analysis.vocabularyAnalysis === 'object' 
        ? {
            weakWords: Array.isArray(analysis.vocabularyAnalysis.weakWords) 
              ? analysis.vocabularyAnalysis.weakWords.filter(w => typeof w === 'string')
              : [],
            suggestedReplacements: Array.isArray(analysis.vocabularyAnalysis.suggestedReplacements)
              ? analysis.vocabularyAnalysis.suggestedReplacements.filter(w => typeof w === 'string')
              : []
          }
        : undefined;

      // Handle sentence variety analysis
      const sentenceVariety = analysis.sentenceVariety && 
        typeof analysis.sentenceVariety === 'object'
        ? {
            sentenceLengths: Array.isArray(analysis.sentenceVariety.sentenceLengths)
              ? analysis.sentenceVariety.sentenceLengths.filter(n => typeof n === 'number')
              : [],
            sentenceStructures: Array.isArray(analysis.sentenceVariety.sentenceStructures)
              ? analysis.sentenceVariety.sentenceStructures.filter(s => typeof s === 'string')
              : [],
            suggestions: Array.isArray(analysis.sentenceVariety.suggestions)
              ? analysis.sentenceVariety.suggestions.filter(s => typeof s === 'string')
              : []
          }
        : undefined;

      // Create a safe copy with defaults
      const safeAnalysis: ParagraphAnalysis = {
        paragraph: typeof analysis.paragraph === 'number' ? analysis.paragraph : index + 1,
        originalText: typeof analysis.originalText === 'string' && analysis.originalText.trim() 
          ? analysis.originalText.trim() 
          : 'No content provided',
        relevanceScore: typeof analysis.relevanceScore === 'number' 
          ? Math.max(0, Math.min(100, analysis.relevanceScore)) // Clamp to 0-100
          : 75, // Default score
        qualityScore: typeof analysis.qualityScore === 'number'
          ? Math.max(0, Math.min(100, analysis.qualityScore)) // Clamp to 0-100
          : 75, // Default score
        status: ['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic', '⚠️ Somewhat Off-topic'].includes(analysis.status)
          ? analysis.status as '✅ On-topic' | '🟡 Needs Improvement' | '❌ Off-topic' | '⚠️ Somewhat Off-topic'
          : analysis.relevanceScore >= 80 ? '✅ On-topic' : 
            analysis.relevanceScore >= 40 ? '🟡 Needs Improvement' : '❌ Off-topic',
        issues: Array.isArray(analysis.issues) 
          ? analysis.issues
              .filter((issue): issue is Issue => 
                issue && 
                typeof issue === 'object' && 
                'type' in issue && 
                'description' in issue &&
                isIssueType(issue.type) &&
                typeof issue.description === 'string'
              )
              .map(issue => ({
                type: issue.type,
                description: issue.description,
                examples: Array.isArray(issue.examples) 
                  ? issue.examples.filter((e): e is string => typeof e === 'string')
                  : []
              }))
          : [],
        feedback: typeof analysis.feedback === 'string' && analysis.feedback.trim()
          ? analysis.feedback.trim()
          : 'No feedback provided.',
        suggestions,
        improvedParagraph: (autoFix && typeof analysis.improvedParagraph === 'string' && analysis.improvedParagraph.trim())
          ? analysis.improvedParagraph.trim()
          : null,
        ...(vocabularyAnalysis && { vocabularyAnalysis }),
        ...(sentenceVariety && { sentenceVariety })
      };
      
      return safeAnalysis;
    });
    
    // Update the analysis result with validated data
    analysisResult.relevanceReport = validatedReport;

    // Format the fixed essay if it exists
    if (analysisResult.fixedEssay) {
      try {
        console.log('[AnalyzeParagraphRelevance] Formatting fixed essay');
        analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay)
          .replace(/\n{3,}/g, '\n\n'); // Ensure no more than two newlines between paragraphs
        
        // Fallback: if still only one paragraph, split into paragraphs by sentences
        if (!analysisResult.fixedEssay.includes('\n\n')) {
          console.log('[AnalyzeParagraphRelevance] Using fallback paragraph splitting');
          analysisResult.fixedEssay = fallbackParagraphSplit(analysisResult.fixedEssay);
          analysisResult.fixedEssay = formatFixedEssay(analysisResult.fixedEssay);
        }
      } catch (formatError) {
        console.error('[AnalyzeParagraphRelevance] Error formatting fixed essay:', formatError);
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