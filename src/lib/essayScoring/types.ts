export interface EssaySubmission {
  topic: string;
  content: string;
  debug?: boolean;
}

export interface ScoreBreakdown {
  grammar: number;
  structure: number;
  coherence: number;
  relevance: number;
  vocabulary: number;
  overusedWords: number;
}

export interface WeightedScores {
  grammar: string;
  structure: string;
  coherence: string;
  relevance: string;
  vocabulary: string;
  overusedWords: string;
}

export interface EssayScore {
  breakdown: ScoreBreakdown;
  weightedScores: WeightedScores;
  totalScore: number;
  feedback: string;
  suggestions: string[];
  debug?: DebugInfo;
}

export interface DebugInfo {
  sentenceScores: SentenceScore[];
  overusedWordsFound: OverusedWord[];
  grammarIssues: GrammarIssue[];
  structureAnalysis: StructureAnalysis;
}

export interface SentenceScore {
  sentence: string;
  relevance: number;
  coherence: number;
}

export interface OverusedWord {
  word: string;
  count: number;
  suggestions: string[];
}

export interface GrammarIssue {
  type: 'subject-verb-agreement' | 'article-usage' | 'pronoun-error' | 'punctuation' | 'spelling';
  description: string;
  sentence: string;
  position: number;
}

export interface StructureAnalysis {
  paragraphCount: number;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  transitionWords: string[];
  structureScore: number;
}

export interface ScoringWeights {
  grammar: number;
  structure: number;
  coherence: number;
  relevance: number;
  vocabulary: number;
  overusedWords: number;
} 