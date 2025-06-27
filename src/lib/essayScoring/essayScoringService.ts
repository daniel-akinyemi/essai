// 'use client';

import { EssaySubmission, EssayScore, ScoreBreakdown, DebugInfo } from './types';
import { CoherenceAnalyzer } from './coherenceAnalyzer';
import { StructureAnalyzer } from './structureAnalyzer';
import { RelevanceAnalyzer } from './relevanceAnalyzer';
import { OverusedWordsAnalyzer } from './overusedWordsAnalyzer';
import { GrammarAnalyzer } from './grammarAnalyzer';
import { VocabularyAnalyzer } from './vocabularyAnalyzer';
import { ScoreCalculator } from './scoreCalculator';
import { THRESHOLDS } from './constants';

// Define the new clean response interface
export interface CleanEssayScore {
  essayTitle: string;
  overallScore: number;
  scoreBreakdown: {
    grammar: string;
    structure: string;
    coherence: string;
    relevance: string;
    vocabulary: string;
    overusedWords: string;
  };
  improvementSuggestions: string[];
  timestamp: string;
}

export class EssayScoringService {
  /**
   * Score an essay with comprehensive analysis and return clean, user-friendly response
   */
  static async scoreEssay(submission: EssaySubmission): Promise<CleanEssayScore> {
    const { topic, content } = submission;
    
    try {
      // Validate input
      if (!topic || !content) {
        throw new Error('Topic and content are required');
      }
      
      if (content.length < 50) {
        throw new Error('Essay content must be at least 50 characters long');
      }

      // Analyze each category with error handling
      let grammarPoints = 15; // Default fallback
      let structurePoints = 14; // Default fallback
      let coherencePoints = 13; // Default fallback
      let relevancePoints = 12; // Default fallback
      let vocabularyPoints = 11; // Default fallback
      let overusedWordsPoints = 8; // Default fallback

      try {
        const grammarResult = GrammarAnalyzer.analyzeGrammar(content);
        grammarPoints = Math.max(0, Math.round((this.ensureValidScore(grammarResult.score, 75) / 100) * 20));
      } catch (error) {
        console.error('Grammar analysis failed:', error);
      }

      try {
        const structureResult = StructureAnalyzer.analyzeStructure(content);
        structurePoints = Math.max(0, Math.round((this.ensureValidScore(structureResult.score, 70) / 100) * 20));
      } catch (error) {
        console.error('Structure analysis failed:', error);
      }

      try {
        const coherenceResult = CoherenceAnalyzer.analyzeCoherence(content);
        coherencePoints = Math.max(0, Math.round((this.ensureValidScore(coherenceResult.score, 65) / 100) * 20));
      } catch (error) {
        console.error('Coherence analysis failed:', error);
      }

      try {
        const relevanceResult = RelevanceAnalyzer.analyzeRelevance(topic, content);
        relevancePoints = Math.max(0, Math.round((this.ensureValidScore(relevanceResult.score, 80) / 100) * 15));
      } catch (error) {
        console.error('Relevance analysis failed:', error);
      }

      try {
        const vocabularyScore = VocabularyAnalyzer.analyzeVocabulary(content);
        vocabularyPoints = Math.max(0, Math.round((this.ensureValidScore(vocabularyScore, 70) / 100) * 15));
      } catch (error) {
        console.error('Vocabulary analysis failed:', error);
      }

      try {
        const overusedWordsResult = OverusedWordsAnalyzer.analyzeOverusedWords(content);
        overusedWordsPoints = Math.max(0, Math.round((this.ensureValidScore(overusedWordsResult.score, 80) / 100) * 10));
      } catch (error) {
        console.error('Overused words analysis failed:', error);
      }

      // Ensure all points are valid numbers
      grammarPoints = this.ensureValidScore(grammarPoints, 15);
      structurePoints = this.ensureValidScore(structurePoints, 14);
      coherencePoints = this.ensureValidScore(coherencePoints, 13);
      relevancePoints = this.ensureValidScore(relevancePoints, 12);
      vocabularyPoints = this.ensureValidScore(vocabularyPoints, 11);
      overusedWordsPoints = this.ensureValidScore(overusedWordsPoints, 8);

      const overallScore = grammarPoints + structurePoints + coherencePoints + relevancePoints + vocabularyPoints + overusedWordsPoints;

      // Format breakdown
      const scoreBreakdown = {
        grammar: `${grammarPoints} / 20`,
        structure: `${structurePoints} / 20`,
        coherence: `${coherencePoints} / 20`,
        relevance: `${relevancePoints} / 15`,
        vocabulary: `${vocabularyPoints} / 15`,
        overusedWords: `${overusedWordsPoints} / 10`,
      };

      // Generate suggestions based on scores
      const suggestions: string[] = [];
      if (grammarPoints < 16) suggestions.push("Fix basic grammar issues like punctuation and subject-verb agreement.");
      if (structurePoints < 14) suggestions.push("Structure your essay with clear paragraphs and a proper introduction.");
      if (coherencePoints < 14) suggestions.push("Use transition words to connect ideas and improve flow.");
      if (vocabularyPoints < 11) suggestions.push("Replace vague words with more specific vocabulary.");
      if (overusedWordsPoints < 8) suggestions.push("Avoid repeating weak words like 'thing' or 'very'.");
      if (relevancePoints < 12) suggestions.push("Make sure every sentence supports your main topic.");
      
      // Always provide at least 3 suggestions
      if (suggestions.length < 3) {
        suggestions.push("Read your essay aloud to catch mistakes.");
        suggestions.push("Ask someone else to review your essay.");
        suggestions.push("Take time to revise and improve your writing.");
      }
      
      // Limit to 5 suggestions
      const improvementSuggestions = suggestions.slice(0, 5);

      // Generate timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

      return {
        essayTitle: topic,
        overallScore,
        scoreBreakdown,
        improvementSuggestions,
        timestamp,
      };
      
    } catch (error) {
      console.error('Essay scoring failed:', error);
      
      // Return a fallback response
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      
      return {
        essayTitle: topic || 'Essay',
        overallScore: 60,
        scoreBreakdown: {
          grammar: "12 / 20",
          structure: "10 / 20",
          coherence: "11 / 20",
          relevance: "10 / 15",
          vocabulary: "9 / 15",
          overusedWords: "8 / 10",
        },
        improvementSuggestions: [
          "Please check your essay content and try again.",
          "Make sure your essay is at least 50 characters long.",
          "Ensure your topic and content are clearly written.",
          "Review your grammar and structure.",
          "Use clear, specific language."
        ],
        timestamp,
      };
    }
  }

  /**
   * Generate user-friendly improvement suggestions
   */
  private static generateUserFriendlySuggestions(
    breakdown: ScoreBreakdown, 
    overusedWords: any[], 
    grammarIssues: any[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Grammar suggestions (score < 16)
    if (breakdown.grammar < 16) {
      const grammarSuggestions = [
        "Fix subject-verb agreement errors like 'students learns'.",
        "Use articles correctly (a/an/the) before nouns.",
        "Check your punctuation, especially periods and commas.",
        "Review sentence structure to ensure each sentence is complete.",
        "Pay attention to verb tense consistency throughout your essay."
      ];
      suggestions.push(this.getRandomSuggestion(grammarSuggestions));
    }
    
    // Structure suggestions (score < 15)
    if (breakdown.structure < 15) {
      const structureSuggestions = [
        "Add a clear introduction and conclusion to organize your thoughts.",
        "Break your text into paragraphs to improve readability.",
        "Create a logical flow from introduction to body to conclusion.",
        "Use topic sentences to introduce each paragraph's main idea.",
        "Ensure your essay has a clear beginning, middle, and end."
      ];
      suggestions.push(this.getRandomSuggestion(structureSuggestions));
    }
    
    // Coherence suggestions (score < 14)
    if (breakdown.coherence < 14) {
      const coherenceSuggestions = [
        "Use transition words like 'however' and 'for example' to connect your ideas.",
        "Avoid jumping between ideas without explaining the connection.",
        "Create smooth transitions between paragraphs and sentences.",
        "Make sure each paragraph flows logically to the next.",
        "Use connecting phrases to show relationships between ideas."
      ];
      suggestions.push(this.getRandomSuggestion(coherenceSuggestions));
    }
    
    // Vocabulary suggestions (score < 10)
    if (breakdown.vocabulary < 10) {
      const vocabularySuggestions = [
        "Use more advanced words instead of 'good' or 'bad'.",
        "Expand your vocabulary with more specific and descriptive terms.",
        "Avoid repetitive language - vary your word choices.",
        "Use precise words that convey your exact meaning.",
        "Replace simple words with more sophisticated alternatives."
      ];
      suggestions.push(this.getRandomSuggestion(vocabularySuggestions));
    }
    
    // Relevance suggestions (score < 12)
    if (breakdown.relevance < 12) {
      const relevanceSuggestions = [
        "Make sure every sentence directly supports your main topic.",
        "Stay focused on your central argument throughout the essay.",
        "Avoid going off-topic or including irrelevant information.",
        "Ensure all examples and evidence relate to your main point.",
        "Keep your writing centered on the essay question or topic."
      ];
      suggestions.push(this.getRandomSuggestion(relevanceSuggestions));
    }
    
    // Overused words suggestions
    if (overusedWords.length > 0) {
      const topWord = overusedWords[0];
      if (topWord && breakdown.overusedWords < 8) {
        const overusedSuggestions = [
          `You used the word '${topWord.word}' multiple times. Try '${topWord.suggestions[0]}' instead.`,
          `Avoid repeating '${topWord.word}'. Consider alternatives like '${topWord.suggestions.slice(0, 2).join("' or '")}'.`,
          `Replace overused words like '${topWord.word}' with more specific vocabulary.`,
          `Vary your language by finding synonyms for '${topWord.word}'.`
        ];
        suggestions.push(this.getRandomSuggestion(overusedSuggestions));
      }
    }
    
    // Add specific vocabulary replacement suggestions if vocabulary is low
    if (breakdown.vocabulary < 10 && overusedWords.length > 0) {
      const topWord = overusedWords[0];
      if (topWord) {
        suggestions.push(`Avoid repeating the word '${topWord.word}'. Try alternatives like '${topWord.suggestions.slice(0, 3).join("', '")}' instead.`);
      }
    }
    
    // Add specific grammar issue suggestions if available
    if (grammarIssues.length > 0 && breakdown.grammar < 16) {
      const commonIssues = grammarIssues.slice(0, 2);
      const issueTypes = [...new Set(commonIssues.map(issue => issue.type))];
      
      if (issueTypes.includes('subject-verb-agreement')) {
        suggestions.push("Check for subject-verb agreement errors in your sentences.");
      }
      if (issueTypes.includes('punctuation')) {
        suggestions.push("Review your punctuation, especially sentence endings and commas.");
      }
      if (issueTypes.includes('article-usage')) {
        suggestions.push("Pay attention to article usage (a/an/the) before nouns.");
      }
    }
    
    // Add transition word suggestions if coherence is low
    if (breakdown.coherence < 14) {
      const transitionSuggestions = [
        "Add transition words like 'furthermore', 'in addition', and 'consequently'.",
        "Use connecting phrases such as 'on the other hand' and 'as a result'.",
        "Include transitional expressions to guide your reader through your ideas."
      ];
      suggestions.push(this.getRandomSuggestion(transitionSuggestions));
    }
    
    // Ensure we have at least 3 suggestions, but no more than 5
    if (suggestions.length < 3) {
      const generalSuggestions = [
        "Read your essay aloud to catch awkward phrasing and errors.",
        "Ask someone else to read your essay and provide feedback.",
        "Take time to revise and polish your writing before submitting.",
        "Use a spell-checker and grammar-checker to catch basic errors.",
        "Consider the reader's perspective - is your argument clear?"
      ];
      
      while (suggestions.length < 3) {
        const suggestion = this.getRandomSuggestion(generalSuggestions);
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      }
    }
    
    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * Get a random suggestion from an array
   */
  private static getRandomSuggestion(suggestions: string[]): string {
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    return suggestions[randomIndex];
  }

  /**
   * Ensure a score is valid (0-100) or return fallback
   */
  private static ensureValidScore(score: number | undefined | null, fallback: number): number {
    if (score === undefined || score === null || isNaN(score)) {
      return fallback;
    }
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Validate essay submission
   */
  private static validateSubmission(topic: string, content: string): void {
    if (!topic || !topic.trim()) {
      throw new Error('Essay topic is required');
    }
    
    if (!content || !content.trim()) {
      throw new Error('Essay content is required');
    }
    
    if (content.length < THRESHOLDS.MIN_ESSAY_LENGTH) {
      throw new Error(`Essay content must be at least ${THRESHOLDS.MIN_ESSAY_LENGTH} characters long`);
    }
  }

  /**
   * Get detailed analysis for debugging (legacy method)
   */
  static async getDetailedAnalysis(submission: EssaySubmission): Promise<EssayScore> {
    // This method is kept for backward compatibility but returns the old format
    const { topic, content, debug = false } = submission;
    
    this.validateSubmission(topic, content);
    
    // Initialize debug info if needed
    const debugInfo: DebugInfo | undefined = debug ? {
      sentenceScores: [],
      overusedWordsFound: [],
      grammarIssues: [],
      structureAnalysis: {
        paragraphCount: 0,
        hasIntroduction: false,
        hasConclusion: false,
        transitionWords: [],
        structureScore: 0
      }
    } : undefined;
    
    try {
      // Analyze each component with error handling
      const coherenceResult = CoherenceAnalyzer.analyzeCoherence(content);
      const structureResult = StructureAnalyzer.analyzeStructure(content);
      const relevanceResult = RelevanceAnalyzer.analyzeRelevance(topic, content);
      const overusedWordsResult = OverusedWordsAnalyzer.analyzeOverusedWords(content);
      const grammarResult = GrammarAnalyzer.analyzeGrammar(content);
      const vocabularyScore = VocabularyAnalyzer.analyzeVocabulary(content);
      
      // Build score breakdown with fallbacks
      const breakdown: ScoreBreakdown = {
        grammar: this.ensureValidScore(grammarResult.score, 75),
        structure: this.ensureValidScore(structureResult.score, 70),
        coherence: this.ensureValidScore(coherenceResult.score, 65),
        relevance: this.ensureValidScore(relevanceResult.score, 80),
        vocabulary: this.ensureValidScore(vocabularyScore, 70),
        overusedWords: this.ensureValidScore(overusedWordsResult.score, 80)
      };
      
      // Calculate weighted scores and total
      const { weightedScores, totalScore } = ScoreCalculator.calculateScores(breakdown);
      
      // Generate feedback and suggestions
      const feedback = ScoreCalculator.generateFeedback(breakdown, totalScore);
      const suggestions = ScoreCalculator.generateSuggestions(breakdown);
      
      // Add overused word suggestions (concise)
      const overusedSuggestions = OverusedWordsAnalyzer.getSuggestions(overusedWordsResult.overusedWords);
      suggestions.push(...overusedSuggestions);
      
      // Add grammar suggestions
      const grammarSuggestions = GrammarAnalyzer.getSuggestions(grammarResult.issues);
      suggestions.push(...grammarSuggestions);
      
      // Populate debug info if requested
      if (debug && debugInfo) {
        debugInfo.sentenceScores = relevanceResult.sentenceScores.map((score, index) => ({
          ...score,
          coherence: coherenceResult.sentenceScores[index]?.coherence || 0
        }));
        debugInfo.overusedWordsFound = overusedWordsResult.overusedWords;
        debugInfo.grammarIssues = grammarResult.issues;
        debugInfo.structureAnalysis = structureResult.analysis;
      }
      
      return {
        breakdown,
        weightedScores,
        totalScore,
        feedback,
        suggestions: [...new Set(suggestions)], // Remove duplicates
        debug: debugInfo
      };
    } catch (error) {
      console.error('Error in essay scoring:', error);
      
      // Return fallback scores if analysis fails
      const fallbackBreakdown: ScoreBreakdown = {
        grammar: 75,
        structure: 70,
        coherence: 65,
        relevance: 80,
        vocabulary: 70,
        overusedWords: 80
      };
      
      const { weightedScores, totalScore } = ScoreCalculator.calculateScores(fallbackBreakdown);
      
      return {
        breakdown: fallbackBreakdown,
        weightedScores,
        totalScore,
        feedback: "Essay analysis completed with some limitations. Please review the suggestions below.",
        suggestions: ["Review your essay for grammar, structure, and clarity."],
        debug: debugInfo
      };
    }
  }
} 