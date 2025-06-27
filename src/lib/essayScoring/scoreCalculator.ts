import { ScoreBreakdown, WeightedScores, EssayScore, DebugInfo } from './types';
import { SCORING_WEIGHTS } from './constants';

export class ScoreCalculator {
  /**
   * Calculate weighted scores and total score
   */
  static calculateScores(
    breakdown: ScoreBreakdown,
    debug?: DebugInfo
  ): { weightedScores: WeightedScores; totalScore: number } {
    const weightedScores: WeightedScores = {
      grammar: this.formatWeightedScore(breakdown.grammar, SCORING_WEIGHTS.grammar),
      structure: this.formatWeightedScore(breakdown.structure, SCORING_WEIGHTS.structure),
      coherence: this.formatWeightedScore(breakdown.coherence, SCORING_WEIGHTS.coherence),
      relevance: this.formatWeightedScore(breakdown.relevance, SCORING_WEIGHTS.relevance),
      vocabulary: this.formatWeightedScore(breakdown.vocabulary, SCORING_WEIGHTS.vocabulary),
      overusedWords: this.formatWeightedScore(breakdown.overusedWords, SCORING_WEIGHTS.overusedWords)
    };

    const totalScore = this.calculateTotalScore(breakdown);

    return { weightedScores, totalScore };
  }

  /**
   * Format weighted score as "score / max"
   */
  private static formatWeightedScore(rawScore: number, weight: number): string {
    const weightedScore = Math.round((rawScore / 100) * weight);
    return `${weightedScore} / ${weight}`;
  }

  /**
   * Calculate total score from weighted components
   */
  private static calculateTotalScore(breakdown: ScoreBreakdown): number {
    let totalScore = 0;
    
    totalScore += (breakdown.grammar / 100) * SCORING_WEIGHTS.grammar;
    totalScore += (breakdown.structure / 100) * SCORING_WEIGHTS.structure;
    totalScore += (breakdown.coherence / 100) * SCORING_WEIGHTS.coherence;
    totalScore += (breakdown.relevance / 100) * SCORING_WEIGHTS.relevance;
    totalScore += (breakdown.vocabulary / 100) * SCORING_WEIGHTS.vocabulary;
    totalScore += (breakdown.overusedWords / 100) * SCORING_WEIGHTS.overusedWords;
    
    return Math.round(totalScore);
  }

  /**
   * Generate feedback based on scores
   */
  static generateFeedback(breakdown: ScoreBreakdown, totalScore: number): string {
    if (totalScore >= 90) {
      return "Excellent work! Your essay demonstrates outstanding writing skills with strong structure, excellent grammar, and compelling arguments. Keep up the exceptional work!";
    } else if (totalScore >= 80) {
      return "Great job! Your essay shows strong writing abilities with room for improvement in specific areas. Focus on the suggestions below to enhance your work further.";
    } else if (totalScore >= 70) {
      return "Good effort! Your essay has potential but needs improvement in several areas. Review the feedback below and consider revising for better results.";
    } else if (totalScore >= 60) {
      return "Fair work. Your essay needs significant improvement in multiple areas. Focus on the fundamental aspects of writing like grammar, structure, and clarity.";
    } else {
      return "Your essay requires substantial improvement. Focus on the basic elements of writing including grammar, structure, coherence, and vocabulary. Consider seeking additional help.";
    }
  }

  /**
   * Generate improvement suggestions
   */
  static generateSuggestions(breakdown: ScoreBreakdown): string[] {
    const suggestions: string[] = [];
    
    if (breakdown.grammar < 80) {
      suggestions.push("Review grammar rules and consider using a grammar checker");
    }
    if (breakdown.structure < 80) {
      suggestions.push("Improve essay structure with clear introduction, body paragraphs, and conclusion");
    }
    if (breakdown.coherence < 80) {
      suggestions.push("Enhance logical flow between paragraphs and ideas using transition words");
    }
    if (breakdown.relevance < 80) {
      suggestions.push("Ensure all content directly relates to the essay topic");
    }
    if (breakdown.vocabulary < 80) {
      suggestions.push("Expand your vocabulary and use more sophisticated language");
    }
    if (breakdown.overusedWords < 80) {
      suggestions.push("Replace overused words with more specific and varied alternatives");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Great work! Keep practicing to maintain your high standards.");
    }
    
    return suggestions;
  }
} 