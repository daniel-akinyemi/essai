import { NextRequest, NextResponse } from 'next/server';
import { openRouterClient } from '@/lib/openrouter';
import type { OpenRouterMessage } from '@/lib/openrouter';
import { checkRelevance } from '@/lib/essayScoring/relevanceChecker';
import { upsertUser } from '@/lib/supabase/users';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
    const { topic, format = 'clean', checkRelevance: checkRelevanceEnabled = false, citationsEnabled = true, essayId, userId } = await request.json();
    
    if (!topic || typeof topic !== 'string' || topic.length < 5) {
      return NextResponse.json({ error: 'A valid essay topic is required.' }, { status: 400 });
    }

    const systemPrompt = format === 'structured' ? structuredPrompt : cleanPrompt;
    const userPrompt = `ESSAY_TOPIC: ${topic}`;
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const mistralModel = 'mistralai/mistral-7b-instruct:free';
    const essay = await openRouterClient.chatCompletion(messages, mistralModel);

    let relevanceAnalysis = [];
    let relevanceScore = null;
    let totalParagraphs = 0;
    if (checkRelevanceEnabled) {
      relevanceAnalysis = await checkRelevance(topic, essay);
      // Split essay into paragraphs for scoring
      const paragraphs = essay.split(/\n{2,}/).filter(p => p.trim().length > 0);
      totalParagraphs = paragraphs.length;
      relevanceScore = totalParagraphs > 0 ? Math.round(((totalParagraphs - relevanceAnalysis.length) / totalParagraphs) * 100) : 100;
      // Save to essays table if essayId and userId are provided
      if (essayId && userId) {
        await supabase.from('essays').update({ relevance_flags: relevanceAnalysis, relevance_score: relevanceScore }).eq('id', essayId);
      }
    }
    // Log usage for user
    if (userId) {
      await upsertUser({
        id: userId,
        essay_submissions: 1, // increment logic should be handled in upsertUser
        relevance_checks: checkRelevanceEnabled ? 1 : 0,
        citation_uses: 0,
        pro_status: 'free', // or fetch actual status
      });
    }

    // Inline citation logic (DISABLED TEMPORARILY)
    // let modifiedEssay = essay;
    // let citations = [];
    // if (citationsEnabled) {
    //   // Generate citations as before
    //   const citationMessages: OpenRouterMessage[] = [
    //     { role: 'system', content: citationPrompt },
    //     { role: 'user', content: `Topic: ${topic}\n\nEssay:\n${essay}` }
    //   ];
    //   const citationResponse = await openRouterClient.chatCompletion(citationMessages, mistralModel);
    //   citations = extractFirstJsonArray(citationResponse);
    //   // Limit to only one citation
    //   if (Array.isArray(citations) && citations.length > 1) {
    //     citations = [citations[0]];
    //   }
    //   // Insert inline citation placeholders if possible
    //   if (citations.length > 0) {
    //     citations.forEach((citation: any, idx: number) => {
    //       const placeholder = citation.inline_apa || `(Citation ${idx + 1})`;
    //       const titleWords = citation.title.split(/\s+/).filter((w: string) => w.length > 3);
    //       let found = false;
    //       for (const word of titleWords) {
    //         const regex = new RegExp(`(${word}[^.?!]*[.?!])`, 'i');
    //         modifiedEssay = modifiedEssay.replace(regex, (match) => {
    //           if (!found) {
    //             found = true;
    //             return match.trim() + ' ' + placeholder + ' ';
    //           }
    //           return match;
    //         });
    //         if (found) break;
    //       }
    //     });
    //   }
    // }
    // For now, just use the original essay and no citations
    const modifiedEssay = essay;
    const citations: any[] = [];

    return NextResponse.json({
      essay: modifiedEssay,
      format,
      relevanceAnalysis,
      relevanceScore,
      citations,
      model: mistralModel
    });
  } catch (error) {
    console.error('Essay generation error:', error);
    return NextResponse.json({ error: 'Failed to generate essay.' }, { status: 500 });
  }
} 