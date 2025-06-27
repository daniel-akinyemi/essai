// 'use client';

import { StructureAnalysis } from './types';
import { TRANSITION_WORDS, THRESHOLDS } from './constants';

export class StructureAnalyzer {
  /**
   * Analyze essay structure and return detailed analysis
   */
  static analyzeStructure(content: string): { score: number; analysis: StructureAnalysis } {
    const paragraphs = this.extractParagraphs(content);
    const sentences = this.extractSentences(content);
    const transitionWords = this.findTransitionWords(content);
    
    const hasIntroduction = this.hasIntroduction(paragraphs);
    const hasConclusion = this.hasConclusion(paragraphs);
    const paragraphScore = this.scoreParagraphs(paragraphs);
    const transitionScore = this.scoreTransitions(transitionWords);
    const structureScore = this.scoreStructure(paragraphs, hasIntroduction, hasConclusion);
    
    const totalScore = Math.round(
      (paragraphScore * 0.3) + 
      (transitionScore * 0.3) + 
      (structureScore * 0.4)
    );
    
    // Ensure score is between 0-100
    const finalScore = Math.max(0, Math.min(100, totalScore));
    
    const analysis: StructureAnalysis = {
      paragraphCount: paragraphs.length,
      hasIntroduction,
      hasConclusion,
      transitionWords,
      structureScore: finalScore
    };
    
    return { score: finalScore, analysis };
  }

  /**
   * Extract paragraphs from content
   */
  private static extractParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  }

  /**
   * Extract sentences from content
   */
  private static extractSentences(content: string): string[] {
    return content
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10);
  }

  /**
   * Check if essay has a proper introduction
   */
  private static hasIntroduction(paragraphs: string[]): boolean {
    if (paragraphs.length === 0) return false;
    
    const firstParagraph = paragraphs[0].toLowerCase();
    
    // Check for introduction signals (more lenient)
    const introSignals = [
      'introduction', 'begin', 'start', 'first', 'initially',
      'this essay', 'this paper', 'this article', 'this discussion',
      'technology', 'education', 'impact', 'effect', 'influence'
    ];
    
    return introSignals.some(signal => firstParagraph.includes(signal));
  }

  /**
   * Check if essay has a proper conclusion
   */
  private static hasConclusion(paragraphs: string[]): boolean {
    if (paragraphs.length === 0) return false;
    
    const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
    
    // Check for conclusion signals (more lenient)
    const conclusionSignals = [
      'conclusion', 'conclude', 'summary', 'finally', 'overall',
      'in summary', 'to conclude', 'in conclusion', 'ultimately',
      'therefore', 'thus', 'as a result', 'in the end'
    ];
    
    return conclusionSignals.some(signal => lastParagraph.includes(signal));
  }

  /**
   * Find transition words in the content
   */
  private static findTransitionWords(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const foundTransitions: string[] = [];
    
    // Check all transition word categories
    Object.values(TRANSITION_WORDS).flat().forEach(transition => {
      if (lowerContent.includes(transition.toLowerCase())) {
        foundTransitions.push(transition);
      }
    });
    
    return [...new Set(foundTransitions)]; // Remove duplicates
  }

  /**
   * Score paragraphs based on count and length (more lenient)
   */
  private static scoreParagraphs(paragraphs: string[]): number {
    const paragraphCount = paragraphs.length;
    
    // More lenient scoring for paragraph count
    if (paragraphCount >= 3 && paragraphCount <= 8) {
      return 100;
    } else if (paragraphCount >= 2 && paragraphCount <= 10) {
      return 85;
    } else if (paragraphCount >= 1 && paragraphCount <= 12) {
      return 70;
    } else {
      return Math.max(40, 100 - Math.abs(paragraphCount - 5) * 10);
    }
  }

  /**
   * Score transitions based on variety and placement (more lenient)
   */
  private static scoreTransitions(transitionWords: string[]): number {
    const uniqueTransitions = new Set(transitionWords).size;
    
    // More lenient scoring for transition words
    if (uniqueTransitions >= 3) {
      return 100;
    } else if (uniqueTransitions >= 2) {
      return 80;
    } else if (uniqueTransitions >= 1) {
      return 60;
    } else {
      return 40; // Base score instead of 20
    }
  }

  /**
   * Score overall structure (more lenient)
   */
  private static scoreStructure(
    paragraphs: string[], 
    hasIntroduction: boolean, 
    hasConclusion: boolean
  ): number {
    let score = 0;
    
    // Base score for having multiple paragraphs (more lenient)
    if (paragraphs.length >= 2) {
      score += 50;
    } else if (paragraphs.length >= 1) {
      score += 30;
    } else {
      score += 20;
    }
    
    // Bonus for introduction (more lenient)
    if (hasIntroduction) {
      score += 25;
    } else {
      score += 10; // Partial credit for trying
    }
    
    // Bonus for conclusion (more lenient)
    if (hasConclusion) {
      score += 25;
    } else {
      score += 10; // Partial credit for trying
    }
    
    return Math.min(100, score);
  }
} 