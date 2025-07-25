import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient } from '@/lib/openrouter';
import type { OpenRouterMessage } from '@/lib/openrouter';
import { checkRelevance } from '@/lib/essayScoring/relevanceChecker';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { prisma } from '@/lib/prisma';
import { sendEssayNotification } from '@/lib/email/sendEssayNotification';

const structuredPrompt = `Role & Context:
You are an advanced AI essay generator, designed to first analyze a given topic to determine the most suitable essay type, and then produce a high-quality, well-structured, and relevant essay draft. You should act as an intelligent academic writing assistant.

Objective:
First, analyze the provided ESSAY_TOPIC to accurately determine the most appropriate essay type.
Then, generate a complete, well-structured essay draft based on the identified essay type and the ESSAY_TOPIC. The essay should demonstrate clear reasoning, appropriate vocabulary, and logical flow.

IMPORTANT OUTPUT INSTRUCTIONS:
- At the very top of your output, state the detected essay type as: Essay Type: [Type]
- Then, write the essay content.
- DO NOT include or restate the topic anywhere in your output.
- Do NOT include any labels, headings, or text except for the essay type and the essay itself.

Input Variable (User Provided):
ESSAY_TOPIC: [User will paste their essay topic or question here, e.g., "Discuss the impact of climate change on coastal cities." or "Analyze the themes in 'Things Fall Apart'."]

Essay Type Detection:
Detect the most appropriate essay type for the given topic. Choose from the following common academic essay types:
Argumentative: Presents a claim and supports it with evidence.
Expository: Explains, informs, or clarifies a topic.
Narrative: Tells a story or describes an event.
Descriptive: Describes a person, place, object, or event in detail.
Compare and Contrast: Examines similarities and differences between two or more subjects.
Cause and Effect: Explores the reasons (causes) and outcomes (effects) of an event or phenomenon.
Literary Analysis: Examines a piece of literature to understand its meaning or impact.
Persuasive: Aims to convince the reader to agree with a particular viewpoint.

Essay Structure Requirements (Based on Detected Type):
Generate the essay with clear subheadings and structure:

Introduction:
Begin with an engaging opening sentence that hooks the reader.
Provide brief background information and context for the topic.
Present a clear, concise thesis statement that outlines the essay's main argument or purpose.

Background Information:
Provide relevant context and background details that help the reader understand the topic.

Thesis Statement:
Clearly state the main argument or purpose of the essay.

Body Paragraph 1:
Topic Sentence: [Clearly states the main idea of the paragraph]
Supporting Details: [Develops the topic sentence with logical points, examples, or explanations]
Elaboration: [Explains how the supporting details connect to the topic sentence and overall thesis]
Transition: [Smooth transition to the next paragraph]

Body Paragraph 2:
Topic Sentence: [Clearly states the main idea of the paragraph]
Supporting Details: [Develops the topic sentence with logical points, examples, or explanations]
Elaboration: [Explains how the supporting details connect to the topic sentence and overall thesis]
Transition: [Smooth transition to the next paragraph]

Body Paragraph 3:
Topic Sentence: [Clearly states the main idea of the paragraph]
Supporting Details: [Develops the topic sentence with logical points, examples, or explanations]
Elaboration: [Explains how the supporting details connect to the topic sentence and overall thesis]
Transition: [Smooth transition to the next paragraph]

Conclusion:
Restated Thesis: [Rephrased thesis statement]
Summary of Main Points: [Briefly reiterate the key arguments from the body paragraphs]
Concluding Thought: [A final, insightful statement that provides closure and broadens the essay's significance]

Content & Style Guidelines:
Clarity and Coherence: Ensure smooth transitions between sentences and paragraphs, making the essay easy to read and understand.
Relevance: All content must directly address the ESSAY_TOPIC and adhere to the conventions of the detected ESSAY_TYPE.
Vocabulary: Use appropriate academic vocabulary, avoiding overly simplistic or overly complex jargon.
Tone: Maintain an objective and academic tone, unless the detected ESSAY_TYPE (e.g., Narrative, Persuasive) explicitly requires a different approach.
Length: Aim for an essay length of approximately 500-700 words, structured into clear paragraphs.
Avoid Overused/Weak Words: Do not use clichés, vague language, or repetitive phrasing.

Consider a "Nigerian context" if the topic or prompt inherently suggests it (e.g., "Discuss the impact of public transportation in Lagos"). If not explicitly suggested, maintain a general academic context.`;

const cleanPrompt = `Role & Context:
You are an advanced AI essay generator, designed to first analyze a given topic to determine the most suitable essay type, and then produce a high-quality, well-structured, and relevant essay draft. You should act as an intelligent academic writing assistant.

Objective:
First, analyze the provided ESSAY_TOPIC to accurately determine the most appropriate essay type.
Then, generate a complete, well-structured essay draft based on the identified essay type and the ESSAY_TOPIC. The essay should demonstrate clear reasoning, appropriate vocabulary, and logical flow.

IMPORTANT OUTPUT INSTRUCTIONS:
- At the very top of your output, state the detected essay type as: Essay Type: [Type]
- Then, write the essay content.
- DO NOT include or restate the topic anywhere in your output.
- Do NOT include any labels, headings, or text except for the essay type and the essay itself.

Input Variable (User Provided):
ESSAY_TOPIC: [User will paste their essay topic or question here, e.g., "Discuss the impact of climate change on coastal cities." or "Analyze the themes in 'Things Fall Apart'."]

Essay Type Detection:
Detect the most appropriate essay type for the given topic. Choose from the following common academic essay types:
Argumentative: Presents a claim and supports it with evidence.
Expository: Explains, informs, or clarifies a topic.
Narrative: Tells a story or describes an event.
Descriptive: Describes a person, place, object, or event in detail.
Compare and Contrast: Examines similarities and differences between two or more subjects.
Cause and Effect: Explores the reasons (causes) and outcomes (effects) of an event or phenomenon.
Literary Analysis: Examines a piece of literature to understand its meaning or impact.
Persuasive: Aims to convince the reader to agree with a particular viewpoint.

Essay Structure Requirements (Based on Detected Type):
The generated essay must follow a standard academic essay structure appropriate for the detected ESSAY_TYPE, but output as continuous, flowing prose without subheadings or section labels:

Introduction:
Begin with an engaging opening sentence that hooks the reader.
Provide brief background information and context for the topic.
Present a clear, concise thesis statement that outlines the essay's main argument or purpose.

Body Paragraphs (Minimum 3):
Each paragraph should flow naturally from the previous one with smooth transitions.
Begin each paragraph with a topic sentence that clearly states the main idea.
Develop the topic sentence with logical points, examples, or explanations relevant to the detected ESSAY_TYPE.
Provide elaboration and analysis that explains how the supporting details connect to the topic sentence and overall thesis.
Use transitional phrases to create smooth connections between paragraphs.

Conclusion:
Restate the thesis in different words.
Briefly summarize the key arguments from the body paragraphs.
End with a final, insightful statement that provides closure and broadens the essay's significance.

Content & Style Guidelines:
Clarity and Coherence: Ensure smooth transitions between sentences and paragraphs, making the essay easy to read and understand.
Relevance: All content must directly address the ESSAY_TOPIC and adhere to the conventions of the detected ESSAY_TYPE.
Vocabulary: Use appropriate academic vocabulary, avoiding overly simplistic or overly complex jargon.
Tone: Maintain an objective and academic tone, unless the detected ESSAY_TYPE (e.g., Narrative, Persuasive) explicitly requires a different approach.
Length: Aim for an essay length of approximately 500-700 words, structured into clear paragraphs.
Avoid Overused/Weak Words: Do not use clichés, vague language, or repetitive phrasing.

Output Format:
Generate the essay as continuous, flowing prose without any subheadings, section labels, or numbered paragraphs. The essay should read like a natural, coherent piece of writing with smooth transitions between ideas. Do not include labels like "Introduction:", "Body Paragraph 1:", "Conclusion:", etc. Simply write the essay as a unified, well-structured piece of prose.

Consider a "Nigerian context" if the topic or prompt inherently suggests it (e.g., "Discuss the impact of public transportation in Lagos"). If not explicitly suggested, maintain a general academic context.`;

const citationPrompt = `You are an academic citation generator. After analyzing an essay, generate 2-4 relevant academic citations that would support the essay's content and arguments.

Requirements:
1. Citations must be topically relevant to the essay content
2. Use credible sources (academic journals, books, institutional reports)
3. Include author(s), year, title, publisher/source, and URL if available
4. Generate both APA and MLA formats
5. Include inline citation formats

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Citation Title",
    "authors": "Author Name(s)",
    "year": 2020,
    "source": "Journal or Publisher",
    "url": "https://...",
    "apa": "Author, A. (2020). Title. Journal, Volume(Issue), Pages. https://...",
    "mla": "Author, A. \"Title.\" Journal, vol. Volume, no. Issue, 2020, pp. Pages, https://...",
    "inline_apa": "(Author, 2020)",
    "inline_mla": "(Author 2020)"
  }
]

CRITICAL: Return ONLY valid JSON. No other text or explanations.`;

// Helper to extract first JSON array from a string (still needed for citations)
function extractFirstJsonArray(text: string): any {
  // Remove control characters except for newlines and tabs
  const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, c => (c === '\n' || c === '\t') ? c : '');
  const match = sanitized.match(/\[[\s\S]*?\]/);
  if (match) {
    let jsonStr = match[0];
    // Robustly remove newlines inside quoted strings using a state machine
    let inQuotes = false;
    let prevChar = '';
    let result = '';
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      if (char === '"' && prevChar !== '\\') {
        inQuotes = !inQuotes;
      }
      if (inQuotes && (char === '\n' || char === '\r')) {
        result += ' ';
      } else {
        result += char;
      }
      prevChar = char;
    }
    // Remove trailing commas before closing brackets/braces
    result = result.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse extracted JSON:', parseError);
      console.error('Extracted text:', result);
      return [];
    }
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const { topic, format = 'clean', checkRelevance: checkRelevanceEnabled = false, citationsEnabled = true, writingStyle = 'academic', essayLength = 'medium' } = await request.json();
    
    if (!topic || typeof topic !== 'string' || topic.length < 5) {
      return NextResponse.json({ error: 'A valid essay topic is required.' }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    // Fix: Use 'sub' or fallback to 'id' for user id
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;

    // Get user settings if not provided
    let userWritingStyle = writingStyle;
    let userEssayLength = essayLength;
    
    if (userId && (!writingStyle || !essayLength)) {
      try {
        const userSettings = await prisma.userSettings.findUnique({
          where: { userId }
        });
        if (userSettings) {
          userWritingStyle = userWritingStyle || userSettings.writingStyle || 'academic';
          userEssayLength = userEssayLength || userSettings.essayLength || 'medium';
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    }

    // Map essay length to word count
    const lengthMap = {
      'short': '300-500',
      'medium': '500-800', 
      'long': '800-1200',
      'extended': '1200-1500'
    };
    const targetLength = lengthMap[userEssayLength as keyof typeof lengthMap] || '500-800';

    // Essay generation
    let essay;
    try {
      const systemPrompt = format === 'structured' ? structuredPrompt : cleanPrompt;
      const userPrompt = `ESSAY_TOPIC: ${topic}
WRITING_STYLE: ${userWritingStyle}
TARGET_LENGTH: ${targetLength} words

Please generate an essay in ${userWritingStyle} style with a target length of ${targetLength} words.`;
      const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      const mistralModel = 'mistralai/mistral-7b-instruct:free';
      const openRouterClient = getOpenRouterClient();
      essay = await openRouterClient.chatCompletion(messages, mistralModel);
    } catch (aiError) {
      console.error('AI essay generation failed:', aiError);
      return NextResponse.json({ error: 'AI essay generation failed. Please try again later.' }, { status: 500 });
    }

    // Parse essay type from essay output if present (e.g., 'Essay Type: [Type]')
    let detectedType = 'Generated';
    const typeMatch = essay.match(/Essay Type:\s*([\w\s-]+)/i);
    if (typeMatch) detectedType = typeMatch[1].trim();

    // Save essay to DB using Prisma (same as Submit Essay feature)
    let essayId = null;
    if (userId) {
      try {
        const savedEssay = await prisma.essay.create({
          data: {
          userId,
          topic,
          content: essay,
          type: detectedType,
          score: 0,
            feedback: 'Essay generated by AI.',
            submittedAt: new Date(),
          },
        });
        essayId = savedEssay.id;
        console.log('Essay saved to history with ID:', essayId);
        // Send essay notification email if user has email
        if (session?.user?.email) {
          try {
            await sendEssayNotification(session.user.email, topic);
          } catch (emailError) {
            console.error('Failed to send essay notification email:', emailError);
          }
        }
      } catch (dbError) {
        console.error('DB error while saving essay:', dbError);
      }
    }

    let relevanceAnalysis = [];
    let relevanceScore = null;
    let totalParagraphs = 0;
    if (checkRelevanceEnabled) {
      try {
      relevanceAnalysis = await checkRelevance(topic, essay);
      // Split essay into paragraphs for scoring
      const paragraphs = essay.split(/\n{2,}/).filter(p => p.trim().length > 0);
      totalParagraphs = paragraphs.length;
      relevanceScore = totalParagraphs > 0 ? Math.round(((totalParagraphs - relevanceAnalysis.length) / totalParagraphs) * 100) : 100;
        // Update essay with relevance data if we have an essayId
        if (essayId) {
          await prisma.essay.update({
            where: { id: essayId },
            data: { 
              score: relevanceScore,
              feedback: `Essay generated by AI. Relevance score: ${relevanceScore}%. ${relevanceAnalysis.length > 0 ? 'Some paragraphs may need improvement.' : 'All paragraphs are on-topic.'}`
            }
          });
        }
      } catch (relError) {
        console.error('Relevance analysis failed:', relError);
      }
    }
    // Always return a response
    return NextResponse.json({
      essay,
      format,
      essayId,
      relevanceAnalysis,
      relevanceScore,
      citations: [],
      model: 'mistralai/mistral-7b-instruct:free'
    });
  } catch (error) {
    // Show detailed error in development, generic in production
    const isDev = process.env.NODE_ENV !== 'production';
    console.error('Essay generation error:', error);
    return NextResponse.json({ error: isDev ? String(error) : 'Failed to generate essay.' }, { status: 500 });
  }
} 