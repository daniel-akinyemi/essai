'use client';

import { useState } from 'react';
import { FileText, Upload, Send, CheckCircle, AlertCircle, Loader2, Star, TrendingUp } from "lucide-react";

interface CleanEssayScore {
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

export default function SubmitEssayPage() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<CleanEssayScore | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim() || !content.trim()) {
      setError('Please fill in both topic and essay content');
      return;
    }

    if (content.length < 100) {
      setError('Essay content must be at least 100 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setScore(null);

    try {
      const response = await fetch('/api/scoreEssay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to score essay');
      }

      const result = await response.json();
      setScore(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scoring your essay');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const parseScore = (scoreString: string) => {
    const [score, max] = scoreString.split(' / ').map(Number);
    return { score, max, percentage: (score / max) * 100 };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Essay</h1>
        <p className="text-gray-600">Submit your essay for AI-powered scoring and detailed feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Essay Submission Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Essay Submission</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Essay Topic *
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your essay topic..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Essay Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your essay here... (minimum 100 characters)"
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {content.length} characters (minimum 100 required)
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Scoring Essay...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Essay</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Essay</h3>
                <p className="text-gray-600">Our AI is carefully reviewing your essay and generating detailed feedback...</p>
              </div>
            </div>
          )}

          {score && (
            <>
              {/* Essay Title and Overall Score */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{score.essayTitle}</h3>
                <p className="text-sm text-gray-500 mb-4">Scored on {score.timestamp}</p>
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(score.overallScore)} mb-4`}>
                    <span className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
                      {score.overallScore}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">/ 100</p>
                  <p className="text-gray-600">
                    {score.overallScore >= 90 ? 'Excellent work!' :
                     score.overallScore >= 80 ? 'Great job!' :
                     score.overallScore >= 70 ? 'Good effort!' :
                     score.overallScore >= 60 ? 'Keep practicing!' : 'Needs improvement'}
                  </p>
                </div>
              </div>

              {/* Weighted Score Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Score Breakdown</span>
                </h3>
                <div className="space-y-4">
                  {Object.entries(score.scoreBreakdown).map(([category, scoreString]) => {
                    const { score: scoreValue, max, percentage } = parseScore(scoreString);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(percentage)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                            {scoreString}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement Suggestions */}
              {score.improvementSuggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Improvement Suggestions</span>
                  </h3>
                  <ul className="space-y-2">
                    {score.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {!isLoading && !score && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Submit</h3>
              <p className="text-gray-600">Fill out the form and submit your essay to receive AI-powered scoring and feedback.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 