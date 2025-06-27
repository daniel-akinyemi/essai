// 'use client';

import { SentenceScore } from './types';

export class CoherenceAnalyzer {
  /**
   * Analyze coherence by comparing adjacent sentences
   * Uses keyword overlap and semantic similarity
   */
  static analyzeCoherence(content: string): { score: number; sentenceScores: SentenceScore[] } {
    const sentences = this.extractSentences(content);
    const sentenceScores: SentenceScore[] = [];
    
    if (sentences.length < 2) {
      return { score: 100, sentenceScores: [] };
    }

    let totalCoherence = 0;
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const currentSentence = sentences[i];
      const nextSentence = sentences[i + 1];
      
      const coherence = this.calculateSentenceCoherence(currentSentence, nextSentence);
      
      sentenceScores.push({
        sentence: currentSentence,
        relevance: 0, // Will be calculated separately
        coherence: coherence
      });
      
      totalCoherence += coherence;
    }
    
    // Add the last sentence
    sentenceScores.push({
      sentence: sentences[sentences.length - 1],
      relevance: 0,
      coherence: 100 // Perfect coherence for the last sentence
    });
    
    const averageCoherence = totalCoherence / (sentences.length - 1);
    
    // Ensure score is between 0-100 and not too harsh
    const finalScore = Math.max(30, Math.min(100, Math.round(averageCoherence)));
    
    return {
      score: finalScore,
      sentenceScores
    };
  }

  /**
   * Calculate coherence between two adjacent sentences
   */
  private static calculateSentenceCoherence(sentence1: string, sentence2: string): number {
    const similarity = this.calculateSimilarity(sentence1, sentence2);
    const transitionScore = this.checkTransitionWords(sentence2);
    const topicContinuity = this.checkTopicContinuity(sentence1, sentence2);
    
    // Weighted combination of factors with more lenient scoring
    const coherence = (similarity * 0.4) + (transitionScore * 0.3) + (topicContinuity * 0.3);
    
    // Ensure minimum score of 30 for basic coherence
    return Math.max(30, Math.min(100, coherence));
  }

  /**
   * Calculate similarity between sentences using keyword overlap
   */
  private static calculateSimilarity(sentence1: string, sentence2: string): number {
    const words1 = this.extractKeywords(sentence1);
    const words2 = this.extractKeywords(sentence2);
    
    if (words1.length === 0 || words2.length === 0) {
      return 60; // Neutral score for empty sentences (increased from 50)
    }
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    const jaccardSimilarity = intersection.length / union.length;
    // Boost similarity score to be less harsh
    return Math.min(100, jaccardSimilarity * 120);
  }

  /**
   * Check for transition words that improve coherence
   */
  private static checkTransitionWords(sentence: string): number {
    const lowerSentence = sentence.toLowerCase();
    let transitionCount = 0;
    
    // Check for various types of transition words
    const allTransitions = [
      'however', 'nevertheless', 'moreover', 'furthermore', 'additionally',
      'therefore', 'thus', 'consequently', 'as a result', 'because',
      'firstly', 'secondly', 'finally', 'in conclusion', 'overall',
      'similarly', 'likewise', 'in contrast', 'on the other hand',
      'also', 'besides', 'meanwhile', 'subsequently', 'previously'
    ];
    
    for (const transition of allTransitions) {
      if (lowerSentence.includes(transition)) {
        transitionCount++;
      }
    }
    
    // More generous scoring for transition words (max 30 points, increased from 20)
    return Math.min(30, transitionCount * 15);
  }

  /**
   * Check if sentences maintain topic continuity
   */
  private static checkTopicContinuity(sentence1: string, sentence2: string): number {
    const nouns1 = this.extractNouns(sentence1);
    const nouns2 = this.extractNouns(sentence2);
    
    if (nouns1.length === 0 || nouns2.length === 0) {
      return 60; // Increased from 50
    }
    
    const commonNouns = nouns1.filter(noun => nouns2.includes(noun));
    const continuity = commonNouns.length / Math.max(nouns1.length, nouns2.length);
    
    // Boost continuity score to be less harsh
    return Math.min(100, continuity * 120);
  }

  /**
   * Extract meaningful keywords from a sentence
   */
  private static extractKeywords(sentence: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    return sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Extract nouns from a sentence (simplified approach)
   */
  private static extractNouns(sentence: string): string[] {
    // Simple noun extraction - words that start with capital letters
    // In a real implementation, you'd use a proper NLP library
    const words = sentence.split(/\s+/);
    return words.filter(word => 
      word.length > 2 && 
      /^[A-Z]/.test(word) && 
      !['The', 'This', 'That', 'These', 'Those', 'However', 'Therefore'].includes(word)
    );
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
} 