'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, CheckCircle, AlertCircle, Loader2, Target, TrendingUp, Award, Clock, Zap, Upload } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/ui/auto-save-status';

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
  const { data: session } = useSession();
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  // User settings state
  const [userSettings, setUserSettings] = useState({
    autoSaveFrequency: '30'
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load user settings on component mount
  useEffect(() => {
    if (session?.user) {
      loadUserSettings();
    }
  }, [session?.user]);

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserSettings({
          autoSaveFrequency: data.autoSaveFrequency || '30'
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setSettingsLoaded(true);
    }
  };

  // Auto-save functionality
  const autoSaveHandler = async (content: string) => {
    if (!content.trim() || !session?.user) return;
    
    try {
      const response = await fetch('/api/autoSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          topic: topic || 'Essay draft',
          type: 'Draft'
        })
      });
      
      if (!response.ok) {
        throw new Error('Auto-save failed');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  };

  const { isSaving, saveStatus, saveNow } = useAutoSave({
    content,
    autoSaveFrequency: userSettings.autoSaveFrequency, // Use user's preferred frequency
    onSave: autoSaveHandler,
    enabled: !!session?.user && content.length > 50
  });

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
    setAutoSaveMessage('');

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
      
      // Automatically save to history
      try {
        const feedback = result.improvementSuggestions.join(' ');
        const res = await fetch('/api/essays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: result.essayTitle,
            content,
            type: 'Scored',
            score: result.overallScore,
            feedback,
          })
        });
        if (res.ok) {
          setAutoSaveMessage('Essay automatically saved to your history.');
        }
      } catch (saveError) {
        console.error('Failed to auto-save essay:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scoring your essay');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const parseScore = (scoreString: string) => {
    const [score, max] = scoreString.split(' / ').map(Number);
    return { score, max, percentage: (score / max) * 100 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Score Essay
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant AI-powered scoring and detailed feedback to improve your writing skills
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Essay Scoring Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Essay Scoring</h2>
                <p className="text-gray-600">Submit your essay for comprehensive analysis</p>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-700">
                Essay Topic *
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your essay topic..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                Essay Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your essay here... (minimum 100 characters)"
                rows={12}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm"
                required
              />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{content.length} characters</span>
                  <div className="flex items-center space-x-4">
                    {/* Auto-save Status */}
                    {session?.user && content.length > 50 && (
                      <AutoSaveStatus 
                        status={saveStatus} 
                        frequency={userSettings.autoSaveFrequency}
                        className="text-sm"
                      />
                    )}
                    <span className={content.length < 100 ? 'text-red-500' : 'text-green-600'}>
                      {content.length < 100 ? `${100 - content.length} more needed` : '✓ Minimum met'}
                    </span>
                  </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing Essay...</span>
                </>
              ) : (
                <>
                    <Zap className="h-5 w-5" />
                    <span>Score Essay</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
              <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Your Essay</h3>
                  <p className="text-gray-600 text-lg">Our AI is carefully reviewing your essay and generating detailed feedback...</p>
              </div>
            </div>
          )}

          {score && (
            <>
                {/* Overall Score Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{score.essayTitle}</h3>
                    <p className="text-gray-500">Scored on {score.timestamp}</p>
                  </div>
                  
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreGradient(score.overallScore)} flex items-center justify-center shadow-2xl`}>
                        <span className="text-4xl font-bold text-white">{score.overallScore}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Award className="h-5 w-5 text-amber-500" />
                      </div>
                </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 mb-2">/ 100</p>
                    <p className={`text-lg font-semibold ${getScoreColor(score.overallScore)}`}>
                      {score.overallScore >= 90 ? '🏆 Excellent work!' :
                       score.overallScore >= 80 ? '🌟 Great job!' :
                       score.overallScore >= 70 ? '👍 Good effort!' :
                       score.overallScore >= 60 ? '💪 Keep practicing!' : '📚 Needs improvement'}
                  </p>
                </div>
              </div>

                {/* Score Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Score Breakdown</h3>
                  </div>
                  
                  <div className="space-y-6">
                  {Object.entries(score.scoreBreakdown).map(([category, scoreString]) => {
                    const { score: scoreValue, max, percentage } = parseScore(scoreString);
                    return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                            <span className={`text-sm font-bold ${getScoreColor(percentage)}`}>
                              {scoreString}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(percentage)} transition-all duration-1000 ease-out`}
                              style={{ width: `${percentage}%` }}
                            />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement Suggestions */}
              {score.improvementSuggestions.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Improvement Suggestions</h3>
                    </div>
                    
                    <div className="space-y-4">
                    {score.improvementSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 leading-relaxed">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                </div>
              )}
            </>
          )}

          {!isLoading && !score && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Score</h3>
                <p className="text-gray-600 text-lg">Fill out the form and submit your essay to receive AI-powered scoring and feedback.</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
} 