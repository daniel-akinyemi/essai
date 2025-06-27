import { SentenceScore } from './types';

export class RelevanceAnalyzer {
  /**
   * Analyze relevance of each sentence to the essay topic
   */
  static analyzeRelevance(topic: string, content: string): { score: number; sentenceScores: SentenceScore[] } {
    const sentences = this.extractSentences(content);
    const topicKeywords = this.extractKeywords(topic);
    const sentenceScores: SentenceScore[] = [];
    
    if (sentences.length === 0) {
      return { score: 100, sentenceScores: [] };
    }
    
    let totalRelevance = 0;
    
    for (const sentence of sentences) {
      const relevance = this.calculateSentenceRelevance(sentence, topicKeywords, topic);
      
      sentenceScores.push({
        sentence,
        relevance,
        coherence: 0 // Will be calculated separately
      });
      
      totalRelevance += relevance;
    }
    
    const averageRelevance = totalRelevance / sentences.length;
    
    return {
      score: Math.round(averageRelevance),
      sentenceScores
    };
  }

  /**
   * Calculate relevance of a sentence to the topic
   */
  private static calculateSentenceRelevance(
    sentence: string, 
    topicKeywords: string[], 
    topic: string
  ): number {
    const sentenceKeywords = this.extractKeywords(sentence);
    const keywordOverlap = this.calculateKeywordOverlap(sentenceKeywords, topicKeywords);
    const semanticSimilarity = this.calculateSemanticSimilarity(sentence, topic);
    const topicWordFrequency = this.calculateTopicWordFrequency(sentence, topic);
    
    // Weighted combination of factors
    const relevance = (
      keywordOverlap * 0.4 + 
      semanticSimilarity * 0.4 + 
      topicWordFrequency * 0.2
    );
    
    return Math.min(100, Math.max(0, relevance));
  }

  /**
   * Calculate keyword overlap between sentence and topic
   */
  private static calculateKeywordOverlap(sentenceKeywords: string[], topicKeywords: string[]): number {
    if (topicKeywords.length === 0) return 50;
    
    const intersection = sentenceKeywords.filter(keyword => 
      topicKeywords.some(topicKeyword => 
        keyword.includes(topicKeyword) || topicKeyword.includes(keyword)
      )
    );
    
    const overlap = intersection.length / topicKeywords.length;
    return overlap * 100;
  }

  /**
   * Calculate semantic similarity using word overlap and context
   */
  private static calculateSemanticSimilarity(sentence: string, topic: string): number {
    const sentenceWords = this.extractWords(sentence);
    const topicWords = this.extractWords(topic);
    
    if (topicWords.length === 0) return 50;
    
    // Check for related concepts and synonyms
    const relatedConcepts = this.getRelatedConcepts(topicWords);
    const sentenceLower = sentence.toLowerCase();
    
    let relatedMatches = 0;
    for (const concept of relatedConcepts) {
      if (sentenceLower.includes(concept)) {
        relatedMatches++;
      }
    }
    
    const similarity = relatedMatches / relatedConcepts.length;
    return similarity * 100;
  }

  /**
   * Calculate frequency of topic words in sentence
   */
  private static calculateTopicWordFrequency(sentence: string, topic: string): number {
    const topicWords = this.extractWords(topic);
    const sentenceLower = sentence.toLowerCase();
    
    if (topicWords.length === 0) return 50;
    
    let topicWordCount = 0;
    for (const word of topicWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = sentenceLower.match(regex);
      if (matches) {
        topicWordCount += matches.length;
      }
    }
    
    // Normalize by sentence length
    const sentenceWords = sentence.split(/\s+/).length;
    const frequency = topicWordCount / Math.max(1, sentenceWords);
    
    return Math.min(100, frequency * 100);
  }

  /**
   * Extract meaningful keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'what', 'when', 'where', 'why', 'how', 'which', 'who', 'whom'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Extract words from text
   */
  private static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Get related concepts for topic words
   */
  private static getRelatedConcepts(topicWords: string[]): string[] {
    const conceptMap: Record<string, string[]> = {
      'technology': ['digital', 'computer', 'software', 'hardware', 'internet', 'online', 'virtual'],
      'education': ['learning', 'teaching', 'student', 'school', 'university', 'academic', 'study'],
      'impact': ['effect', 'influence', 'change', 'result', 'consequence', 'outcome'],
      'environment': ['nature', 'climate', 'pollution', 'sustainability', 'green', 'eco'],
      'health': ['medical', 'wellness', 'fitness', 'disease', 'treatment', 'care'],
      'economy': ['financial', 'economic', 'business', 'market', 'trade', 'commerce'],
      'society': ['social', 'community', 'culture', 'people', 'population', 'demographic'],
      'politics': ['political', 'government', 'policy', 'election', 'democracy', 'leadership']
    };
    
    const related: string[] = [];
    for (const word of topicWords) {
      for (const [concept, synonyms] of Object.entries(conceptMap)) {
        if (word.includes(concept) || concept.includes(word)) {
          related.push(...synonyms);
        }
      }
    }
    
    return [...new Set(related)];
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