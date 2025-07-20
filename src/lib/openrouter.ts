export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Please set OPENROUTER_API_KEY in your .env file.');
    }
  }

  async chatCompletion(messages: OpenRouterMessage[], model: string = 'deepseek/deepseek-r1'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Essai - Essay Writing Assistant',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async rewriteEssay(originalEssay: string, instructions?: string, model?: string): Promise<string> {
    const systemPrompt = `You are an academic writing assistant. Your task is to rewrite the provided essay to improve grammar, sentence structure, coherence, and vocabulary. However, you must not change the original topic, subject matter, intended message, or the essay's title.

Guidelines for rewriting:
1. Do not change the essay’s original title. Keep the title exactly the same as provided.
2. Rewrite only the body of the essay to improve grammar, clarity, vocabulary, and flow. Do not change the topic, tone, or core meaning.
3. Do not remove or add entirely new ideas.
4. Ensure the tone remains academic and formal.
5. Do not change the essay type (if it’s argumentative, informative, etc., keep it so).
6. Fix grammar, punctuation, and spelling errors.
7. Improve paragraph transitions and coherence.
8. Make the writing more engaging and clear.

Return ONLY the rewritten essay, with the original title unchanged, and without any explanations or commentary.`;

    const userPrompt = instructions 
      ? `Please rewrite the following essay with these specific instructions: ${instructions}\n\nOriginal essay:\n${originalEssay}`
      : `Please rewrite the following essay to improve its quality:\n\n${originalEssay}`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    return this.chatCompletion(messages, model);
  }

  async getSuggestions(originalEssay: string, model?: string): Promise<string[]> {
    const systemPrompt = `You are an expert writing coach. Analyze the given essay and provide specific, actionable improvement suggestions. Focus on concrete areas that can be enhanced.

Return exactly 5 suggestions as a JSON array of strings. Each suggestion should be specific and actionable.

Example format: ["Improve thesis statement clarity", "Add more supporting evidence in paragraph 2", "Strengthen conclusion with call to action", "Use more varied sentence structures", "Improve transitions between paragraphs"]`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Please analyze this essay and provide 5 specific improvement suggestions:\n\n${originalEssay}`
      }
    ];

    const response = await this.chatCompletion(messages, model);
    
    function extractFirstJsonArray(text: string): any {
      // Remove control characters except for newlines and tabs
      const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, c => (c === '\n' || c === '\t') ? c : '');
      const match = sanitized.match(/\[[\s\S]*?\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return null;
    }

    function extractQuotedSuggestions(text: string): string[] {
      // Extract lines that look like: 1. "..." or - "..." or numbered suggestions
      const lines = text.split(/\r?\n/);
      const suggestions: string[] = [];
      
      // First try to extract from numbered/bulleted lists
      for (const line of lines) {
        // Match patterns like: 1. "text" or - "text" or "text"
        const match = line.match(/^[\s\d\-\*\.]*[""]([^""]+)[""]/);
        if (match && match[1]) {
          suggestions.push(match[1].trim());
        }
      }
      
      // If no suggestions found, try extracting from plain text
      if (suggestions.length === 0) {
        // Look for any quoted text in the response
        const quoteMatches = text.match(/[""]([^""]+)[""]/g);
        if (quoteMatches) {
          for (const match of quoteMatches) {
            const content = match.replace(/[""]/g, '').trim();
            if (content.length > 10) { // Only add substantial suggestions
              suggestions.push(content);
            }
          }
        }
      }
      
      console.log('Extracted suggestions:', suggestions);
      return suggestions;
    }

    try {
      let suggestions = extractFirstJsonArray(response);
      if (Array.isArray(suggestions)) {
        return suggestions.slice(0, 5);
      }
      // Fallback: try extracting quoted suggestions
      suggestions = extractQuotedSuggestions(response);
      if (suggestions.length > 0) {
        return suggestions.slice(0, 5);
      }
      throw new Error('Invalid suggestions format');
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      console.error('Raw AI response:', response);
      return [
        'Improve sentence structure and flow',
        'Enhance vocabulary and word choice',
        'Strengthen supporting evidence',
        'Improve paragraph transitions',
        'Refine conclusion impact'
      ];
    }
  }

  async compareEssaysForImprovements(originalEssay: string, rewrittenEssay: string, model?: string): Promise<string[]> {
    const systemPrompt = `You are an expert academic writing assistant. Compare the following two essays. The first is the original, the second is the rewritten version. List 3-5 specific improvements made in the rewrite (e.g., improved grammar, added transitions, varied sentence structure, more formal tone, etc.). Do NOT mention the title in your list of improvements. The title must remain unchanged. Only list improvements to the body. Return ONLY a JSON array of strings.`;

    const userPrompt = `Original Essay:\n${originalEssay}\n\nRewritten Essay:\n${rewrittenEssay}`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    const response = await this.chatCompletion(messages, model);

    // Try to extract JSON array from response
    const match = response.match(/\[[\s\S]*?\]/);
    let improvements: string[] = [];
    if (match) {
      try {
        improvements = JSON.parse(match[0]);
      } catch (e) {
        console.error('Failed to parse LLM improvements JSON:', e, match[0]);
      }
    }
    // Fallback: extract lines that look like improvements
    if (!improvements.length) {
      const lines = response.split(/\r?\n/);
      improvements = lines
        .filter(line => /^\s*(\d+\.|-|\").*/.test(line))
        .map(line => line.replace(/^\s*(\d+\.|-|\")/, '').trim())
        .filter(Boolean);
      // If only one improvement and it contains multiple items, split by semicolon or period
      if (improvements.length === 1 && /[.;•]/.test(improvements[0])) {
        improvements = improvements[0].split(/[.;•]/).map(s => s.trim()).filter(Boolean);
      }
    }
    // Filter out any improvement that mentions the title
    improvements = improvements.filter(imp => !/title/i.test(imp));
    return improvements;
  }
}

export const openRouterClient = new OpenRouterClient();