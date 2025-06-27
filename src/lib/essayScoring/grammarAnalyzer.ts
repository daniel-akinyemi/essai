import { GrammarIssue } from './types';
import { GRAMMAR_PATTERNS } from './constants';

export class GrammarAnalyzer {
  /**
   * Analyze grammar in the essay
   */
  static analyzeGrammar(content: string): { score: number; issues: GrammarIssue[] } {
    const sentences = this.extractSentences(content);
    const issues: GrammarIssue[] = [];
    
    // Check each sentence for grammar issues
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceIssues = this.checkSentenceGrammar(sentence, i);
      issues.push(...sentenceIssues);
    }
    
    // Calculate score based on number and severity of issues
    const score = this.calculateGrammarScore(issues, sentences.length);
    
    return { score, issues };
  }

  /**
   * Check grammar in a single sentence
   */
  private static checkSentenceGrammar(sentence: string, position: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    // Check subject-verb agreement
    const svaIssues = this.checkSubjectVerbAgreement(sentence, position);
    issues.push(...svaIssues);
    
    // Check article usage
    const articleIssues = this.checkArticleUsage(sentence, position);
    issues.push(...articleIssues);
    
    // Check spelling
    const spellingIssues = this.checkSpelling(sentence, position);
    issues.push(...spellingIssues);
    
    // Check punctuation
    const punctuationIssues = this.checkPunctuation(sentence, position);
    issues.push(...punctuationIssues);
    
    return issues;
  }

  /**
   * Check subject-verb agreement
   */
  private static checkSubjectVerbAgreement(sentence: string, position: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    for (const pattern of GRAMMAR_PATTERNS.subjectVerbAgreement) {
      const matches = sentence.match(pattern);
      if (matches) {
        issues.push({
          type: 'subject-verb-agreement',
          description: 'Subject-verb agreement error detected',
          sentence,
          position
        });
      }
    }
    
    return issues;
  }

  /**
   * Check article usage
   */
  private static checkArticleUsage(sentence: string, position: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    for (const pattern of GRAMMAR_PATTERNS.articleUsage) {
      const matches = sentence.match(pattern);
      if (matches) {
        issues.push({
          type: 'article-usage',
          description: 'Incorrect article usage detected',
          sentence,
          position
        });
      }
    }
    
    return issues;
  }

  /**
   * Check spelling
   */
  private static checkSpelling(sentence: string, position: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    for (const pattern of GRAMMAR_PATTERNS.commonSpelling) {
      const matches = sentence.match(pattern);
      if (matches) {
        issues.push({
          type: 'spelling',
          description: 'Common spelling error detected',
          sentence,
          position
        });
      }
    }
    
    return issues;
  }

  /**
   * Check punctuation
   */
  private static checkPunctuation(sentence: string, position: number): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    
    // Check for missing periods at end of sentences
    if (sentence.length > 0 && !sentence.match(/[.!?]$/)) {
      issues.push({
        type: 'punctuation',
        description: 'Missing sentence ending punctuation',
        sentence,
        position
      });
    }
    
    // Check for double spaces
    if (sentence.includes('  ')) {
      issues.push({
        type: 'punctuation',
        description: 'Multiple consecutive spaces detected',
        sentence,
        position
      });
    }
    
    return issues;
  }

  /**
   * Calculate grammar score based on issues
   */
  private static calculateGrammarScore(issues: GrammarIssue[], sentenceCount: number): number {
    if (sentenceCount === 0) return 100;
    
    // Base score starts at 100
    let score = 100;
    
    // Penalize for each issue
    for (const issue of issues) {
      switch (issue.type) {
        case 'subject-verb-agreement':
          score -= 8;
          break;
        case 'article-usage':
          score -= 3;
          break;
        case 'spelling':
          score -= 5;
          break;
        case 'punctuation':
          score -= 2;
          break;
        case 'pronoun-error':
          score -= 6;
          break;
      }
    }
    
    // Bonus for clean grammar
    if (issues.length === 0) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract sentences from content
   */
  private static extractSentences(content: string): string[] {
    return content
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 5);
  }

  /**
   * Get grammar improvement suggestions
   */
  static getSuggestions(issues: GrammarIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (issues.length === 0) {
      suggestions.push("Excellent grammar! No issues detected.");
      return suggestions;
    }
    
    // Group issues by type
    const issueTypes = new Map<string, number>();
    for (const issue of issues) {
      issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
    }
    
    // Generate suggestions based on most common issues
    for (const [type, count] of issueTypes) {
      switch (type) {
        case 'subject-verb-agreement':
          suggestions.push(`Review subject-verb agreement rules (${count} issues found)`);
          break;
        case 'article-usage':
          suggestions.push(`Check article usage (a/an/the) (${count} issues found)`);
          break;
        case 'spelling':
          suggestions.push(`Review spelling of common words (${count} issues found)`);
          break;
        case 'punctuation':
          suggestions.push(`Check punctuation and spacing (${count} issues found)`);
          break;
        case 'pronoun-error':
          suggestions.push(`Review pronoun usage and agreement (${count} issues found)`);
          break;
      }
    }
    
    return suggestions;
  }
} 