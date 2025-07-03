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
    const systemPrompt = `You are an expert essay writing assistant. Your task is to rewrite essays to improve their quality while maintaining the original meaning and the author's voice. 

Guidelines for rewriting:
1. Improve sentence structure and flow
2. Enhance vocabulary and word choice (avoid overusing complex words)
3. Fix grammar, punctuation, and spelling errors
4. Improve paragraph transitions and coherence
5. Maintain the original argument and key points
6. Keep the author's voice and style
7. Ensure the essay remains authentic and not overly academic
8. Make the writing more engaging and clear

Return ONLY the rewritten essay without any explanations or commentary.`;

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
      throw new Error('No JSON array found in model response');
    }

    try {
      const suggestions = extractFirstJsonArray(response);
      if (Array.isArray(suggestions)) {
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
}

export const openRouterClient = new OpenRouterClient();