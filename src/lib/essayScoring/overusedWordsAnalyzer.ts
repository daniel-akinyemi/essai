// 'use client';

import { OverusedWord } from './types';
import { OVERUSED_WORDS, THRESHOLDS } from './constants';

export class OverusedWordsAnalyzer {
  /**
   * Analyze overused words in the essay
   */
  static analyzeOverusedWords(content: string): { score: number; overusedWords: OverusedWord[] } {
    const words = this.extractWords(content);
    const overusedWords: OverusedWord[] = [];
    
    // Count occurrences of overused words
    for (const [word, suggestions] of Object.entries(OVERUSED_WORDS)) {
      const count = this.countWordOccurrences(content, word);
      
      if (count > 0) {
        overusedWords.push({
          word,
          count,
          suggestions
        });
      }
    }
    
    // Calculate score based on overused word count
    const totalOverused = overusedWords.reduce((sum, item) => sum + item.count, 0);
    const score = this.calculateScore(totalOverused, overusedWords.length);
    
    return { score, overusedWords };
  }

  /**
   * Calculate score based on overused word usage
   */
  private static calculateScore(totalCount: number, uniqueCount: number): number {
    // Base score starts at 100
    let score = 100;
    
    // Penalize for total count of overused words
    if (totalCount > THRESHOLDS.MAX_OVERUSED_WORDS) {
      score -= (totalCount - THRESHOLDS.MAX_OVERUSED_WORDS) * 10; // Reduced penalty
    }
    
    // Additional penalty for variety of overused words
    if (uniqueCount > 3) {
      score -= (uniqueCount - 3) * 5; // Reduced penalty
    }
    
    // Bonus for minimal usage
    if (totalCount <= 1) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count occurrences of a specific word in content
   */
  private static countWordOccurrences(content: string, word: string): number {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Extract words from content
   */
  private static extractWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Get concise suggestions for improving overused words
   */
  static getSuggestions(overusedWords: OverusedWord[]): string[] {
    const suggestions: string[] = [];
    
    if (overusedWords.length === 0) {
      suggestions.push("Great job! No overused words detected.");
      return suggestions;
    }
    
    // Sort by count (most used first) and take top 3
    const sortedWords = overusedWords.sort((a, b) => b.count - a.count).slice(0, 3);
    
    // Create concise suggestions
    const wordSuggestions = sortedWords.map(item => {
      const topSuggestion = item.suggestions[0];
      return `Replace "${item.word}" (${item.count}x) with "${topSuggestion}"`;
    });
    
    suggestions.push(...wordSuggestions);
    
    // Add general suggestion if multiple overused words
    if (overusedWords.length > 3) {
      suggestions.push(`Consider varying your vocabulary to avoid overusing ${overusedWords.length} different weak words.`);
    }
    
    return suggestions;
  }
} 