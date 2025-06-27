export class VocabularyAnalyzer {
  /**
   * Analyze vocabulary sophistication and variety
   */
  static analyzeVocabulary(content: string): number {
    const words = this.extractWords(content);
    const uniqueWords = new Set(words);
    
    if (words.length === 0) return 100;
    
    // Calculate vocabulary diversity
    const diversity = uniqueWords.size / words.length;
    
    // Calculate average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Count sophisticated words
    const sophisticatedWords = this.countSophisticatedWords(words);
    const sophisticationRatio = sophisticatedWords / words.length;
    
    // Weighted score calculation
    const diversityScore = diversity * 40;
    const lengthScore = Math.min(30, avgWordLength * 2);
    const sophisticationScore = sophisticationRatio * 30;
    
    const totalScore = diversityScore + lengthScore + sophisticationScore;
    
    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Extract words from content
   */
  private static extractWords(content: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Count sophisticated words in the text
   */
  private static countSophisticatedWords(words: string[]): number {
    const sophisticatedWords = new Set([
      'consequently', 'furthermore', 'moreover', 'nevertheless', 'nonetheless',
      'subsequently', 'therefore', 'thus', 'whereas', 'whilst', 'whilst',
      'comprehensive', 'extensive', 'thorough', 'detailed', 'elaborate',
      'sophisticated', 'complex', 'intricate', 'nuanced', 'subtle',
      'significant', 'substantial', 'considerable', 'notable', 'remarkable',
      'exceptional', 'outstanding', 'exemplary', 'superior', 'excellent',
      'demonstrate', 'illustrate', 'exemplify', 'indicate', 'suggest',
      'imply', 'reveal', 'establish', 'confirm', 'validate',
      'analysis', 'evaluation', 'assessment', 'examination', 'investigation',
      'perspective', 'viewpoint', 'standpoint', 'position', 'stance',
      'methodology', 'approach', 'strategy', 'technique', 'procedure'
    ]);
    
    return words.filter(word => sophisticatedWords.has(word)).length;
  }
} 