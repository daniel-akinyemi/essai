'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, BookOpen, Copy, Check, Plus, Trash2, AlertTriangle, FileText, Users, Calendar, Globe, CheckCircle, XCircle, Target, Zap, TrendingUp } from "lucide-react";
import { useSession } from 'next-auth/react';

interface Reference {
  id: string;
  author: string;
  year: string;
  title: string;
  source: string;
  format: 'APA' | 'MLA';
}

interface RelevanceIssue {
  paragraph: string;
  issue: string;
  suggestion: string;
}

interface GeneratedCitation {
  title: string;
  authors: string;
  year: number;
  source: string;
  url: string;
  apa: string;
  mla: string;
  inline_apa: string;
  inline_mla: string;
}

export default function EssayGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [format, setFormat] = useState<'structured' | 'clean'>('clean');
  const [checkRelevance, setCheckRelevance] = useState(false);
  const [relevanceAnalysis, setRelevanceAnalysis] = useState<RelevanceIssue[]>([]);
  const [showCitations, setShowCitations] = useState(false);
  const [relevanceScore, setRelevanceScore] = useState<number | null>(null);
  const [essayParagraphs, setEssayParagraphs] = useState<string[]>([]);
  const [flaggedParagraphs, setFlaggedParagraphs] = useState<any[]>([]);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEssay('');
    setRelevanceAnalysis([]);
    setRelevanceScore(null);
    setEssayParagraphs([]);
    setFlaggedParagraphs([]);
    setAutoSaveMessage('');
    
    if (!topic.trim() || topic.length < 5) {
      setError('Please enter a valid essay topic (at least 5 characters).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generateEssay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, checkRelevance })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate essay.');
      setEssay(data.essay);
      
      // Split essay into paragraphs for display
      const paragraphs = data.essay.split(/\n{2,}/).filter((p: string) => p.trim().length > 0);
      setEssayParagraphs(paragraphs);
      
      if (data.relevanceAnalysis) {
        setRelevanceAnalysis(data.relevanceAnalysis);
        // Map flagged paragraphs to their index and text
        const flagged = data.relevanceAnalysis.map((flag: any) => {
          // Try to extract index from paragraph label (e.g., 'Body Paragraph 2')
          const match = flag.paragraph.match(/(\d+)/);
          const idx = match ? parseInt(match[1], 10) - 1 : -1;
          return {
            paragraphIndex: idx,
            paragraphText: idx >= 0 ? paragraphs[idx] : '',
            ...flag
          };
        });
        setFlaggedParagraphs(flagged);
      }
      if (typeof data.relevanceScore === 'number') {
        setRelevanceScore(data.relevanceScore);
      }
      // Show auto-save message
      setAutoSaveMessage('Essay automatically saved to your history.');
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate essay.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Localize flagged paragraph
  const localizeParagraph = async (paragraphText: string, paragraphIndex: number) => {
    const res = await fetch('/api/localizeParagraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paragraph: paragraphText, topic })
    });
    const { localized } = await res.json();
    setFlaggedParagraphs(flags =>
      flags.map(f => f.paragraphIndex === paragraphIndex ? { ...f, localizedSuggestion: localized } : f)
    );
  };

  // Replace paragraph in essay
  const replaceParagraph = (paragraphIndex: number, newText: string) => {
    setEssayParagraphs(paragraphs =>
      paragraphs.map((p, i) => i === paragraphIndex ? newText : p)
    );
    setEssay(paragraphs =>
      essayParagraphs.map((p, i) => i === paragraphIndex ? newText : p).join('\n\n')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Essay Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate high-quality essays with AI assistance and intelligent relevance checking
          </p>
        </div>

      {/* Relevance Score Summary */}
      {typeof relevanceScore === 'number' && (
          <div className={`mb-8 p-6 rounded-2xl font-semibold flex items-center ${relevanceScore >= 70 ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${relevanceScore >= 70 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {relevanceScore >= 70 ? '✅' : '⚠️'}
            </div>
            <div>
              <div className="text-xl">Relevance Score: {relevanceScore}%</div>
              <div className="text-sm opacity-80">({essayParagraphs.length - flaggedParagraphs.length} of {essayParagraphs.length} paragraphs on-topic)</div>
          {relevanceScore < 70 && (
                <div className="text-sm mt-1">Some parts of your essay drift from the topic. Review feedback below.</div>
          )}
            </div>
        </div>
      )}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
        </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generate Essay</h2>
                  <p className="text-gray-600">Create high-quality essays with AI assistance</p>
        </div>
      </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="topic" className="block text-sm font-semibold text-gray-700">
                  Essay Topic or Question
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="E.g., Discuss the impact of climate change on coastal cities."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="format" className="block text-sm font-semibold text-gray-700">
                    Output Format
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={e => setFormat(e.target.value as 'structured' | 'clean')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="clean">Clean Academic Essay</option>
                    <option value="structured">Structured Essay</option>
                  </select>
                </div>

                <div className="flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      checked={checkRelevance}
                      onChange={e => setCheckRelevance(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                    />
                      <span className="text-sm font-semibold text-gray-700">Check Relevance</span>
                  </label>
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
                disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Essay...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Generate Essay</span>
                    </>
                  )}
              </button>
            </form>
            </div>

            {/* Generated Essay */}
            {essay && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Generated Essay</h3>
                  <button
                      onClick={() => copyToClipboard(essay)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                                </button>
                              </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{essay}</div>
                </div>
                  </div>
                )}

            {/* Relevance Issues */}
                {relevanceAnalysis.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Relevance Issues Found</h3>
                </div>
                
                <div className="space-y-4">
                      {relevanceAnalysis.map((issue, index) => (
                    <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                      <div className="font-semibold text-orange-800 mb-2">{issue.paragraph}</div>
                      <div className="text-orange-700 mb-3">{issue.issue}</div>
                      <div className="text-orange-600">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                            </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <span className="text-gray-600 font-medium">Topic Length:</span>
                  <span className="font-bold text-emerald-700">{topic.length} chars</span>
                          </div>
                
                {essay && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <span className="text-gray-600 font-medium">Essay Length:</span>
                      <span className="font-bold text-blue-700">{essay.length} chars</span>
                          </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <span className="text-gray-600 font-medium">Paragraphs:</span>
                      <span className="font-bold text-purple-700">{essayParagraphs.length}</span>
                    </div>
                    {relevanceScore !== null && (
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <span className="text-gray-600 font-medium">Relevance Score:</span>
                        <span className={`font-bold ${relevanceScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {relevanceScore}%
                        </span>
                  </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Writing Tips</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Be specific and provide concrete examples</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Use clear topic sentences for each paragraph</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Maintain logical flow between paragraphs</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Include a strong conclusion that summarizes key points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
    </div>
  );
} 