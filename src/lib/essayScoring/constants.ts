import { ScoringWeights } from './types';

// Scoring weights (total = 100)
export const SCORING_WEIGHTS: ScoringWeights = {
  grammar: 20,
  structure: 20,
  coherence: 20,
  relevance: 15,
  vocabulary: 15,
  overusedWords: 10
};

// Overused/weak words with suggestions
export const OVERUSED_WORDS: Record<string, string[]> = {
  'very': ['extremely', 'highly', 'remarkably', 'exceptionally'],
  'really': ['truly', 'genuinely', 'actually', 'indeed'],
  'some': ['several', 'various', 'numerous', 'multiple'],
  'thing': ['aspect', 'element', 'factor', 'component'],
  'stuff': ['materials', 'items', 'elements', 'components'],
  'good': ['excellent', 'outstanding', 'superior', 'exceptional'],
  'bad': ['poor', 'inadequate', 'substandard', 'unsatisfactory'],
  'big': ['large', 'substantial', 'considerable', 'significant'],
  'small': ['minor', 'minimal', 'insignificant', 'negligible'],
  'nice': ['pleasant', 'enjoyable', 'delightful', 'appealing'],
  'great': ['excellent', 'outstanding', 'remarkable', 'exceptional'],
  'many': ['numerous', 'multiple', 'various', 'diverse'],
  'much': ['considerable', 'substantial', 'significant', 'extensive'],
  'lot': ['many', 'numerous', 'multiple', 'various'],
  'get': ['obtain', 'acquire', 'receive', 'achieve'],
  'make': ['create', 'produce', 'develop', 'establish'],
  'do': ['perform', 'execute', 'accomplish', 'achieve'],
  'say': ['state', 'declare', 'mention', 'express'],
  'think': ['believe', 'consider', 'suppose', 'assume'],
  'know': ['understand', 'recognize', 'realize', 'comprehend']
};

// Transition words and phrases
export const TRANSITION_WORDS = {
  introduction: ['firstly', 'first', 'initially', 'to begin', 'in the beginning'],
  addition: ['moreover', 'furthermore', 'additionally', 'also', 'besides', 'in addition'],
  contrast: ['however', 'nevertheless', 'on the other hand', 'conversely', 'in contrast'],
  cause: ['because', 'since', 'as a result', 'therefore', 'thus', 'consequently'],
  conclusion: ['in conclusion', 'finally', 'to conclude', 'in summary', 'overall', 'ultimately']
};

// Grammar patterns for detection
export const GRAMMAR_PATTERNS = {
  subjectVerbAgreement: [
    /(?:he|she|it)\s+(?:are|were|have)/gi,
    /(?:they|we|you)\s+(?:is|was|has)/gi
  ],
  articleUsage: [
    /\b(?:a|an)\s+[aeiou]/gi, // a apple -> an apple
    /\b(?:an)\s+[bcdfghjklmnpqrstvwxyz]/gi // an book -> a book
  ],
  commonSpelling: [
    /\b(?:recieve|seperate|occured|definately|accomodate)\b/gi
  ]
};

// Minimum thresholds
export const THRESHOLDS = {
  MIN_ESSAY_LENGTH: 100,
  MAX_OVERUSED_WORDS: 3,
  MIN_PARAGRAPHS: 3,
  MIN_SENTENCES: 5
}; 