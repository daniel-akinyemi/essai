'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, BookOpen, Copy, Check, Plus, Trash2, AlertTriangle, FileText, Users, Calendar, Globe, Search, CheckCircle, XCircle } from "lucide-react";
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

interface ParagraphAnalysis {
  paragraph: number;
  originalText: string;
  relevanceScore: number;
  status: "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic";
  feedback: string;
  suggestion?: string;
  improvedParagraph?: string | null;
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
  
  // New paragraph analyzer states
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const [paragraphAnalysis, setParagraphAnalysis] = useState<ParagraphAnalysis[]>([]);
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [fixedEssay, setFixedEssay] = useState<string>('');

  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Add save handler for Paragraph Analyzer
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [saveAnalysisSuccess, setSaveAnalysisSuccess] = useState(false);
  const [saveAnalysisError, setSaveAnalysisError] = useState('');
  const handleSaveAnalysis = async () => {
    setSavingAnalysis(true);
    setSaveAnalysisSuccess(false);
    setSaveAnalysisError('');
    try {
      const contentToSave = fixedEssay || essay;
      const feedbackSummary = paragraphAnalysis.map(p => p.feedback).join(' ');
      const res = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content: contentToSave,
          type: 'Paragraph Analysis',
          score: 0, // Optionally calculate an average score
          feedback: feedbackSummary || 'Paragraph analysis feedback.'
        })
      });
      if (!res.ok) throw new Error('Failed to save essay.');
      setSaveAnalysisSuccess(true);
      setTimeout(() => setSaveAnalysisSuccess(false), 2000);
    } catch (err: any) {
      setSaveAnalysisError(err.message || 'Failed to save essay.');
    } finally {
      setSavingAnalysis(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEssay('');
    setRelevanceAnalysis([]);
    setRelevanceScore(null);
    setEssayParagraphs([]);
    setFlaggedParagraphs([]);
    setParagraphAnalysis([]);
    setFixedEssay('');
    
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
      
      // Auto-analysis disabled - user can manually analyze if needed
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate essay.');
    } finally {
      setLoading(false);
    }
  };



  const handleParagraphAnalysis = async () => {
    if (!topic.trim() || !essay.trim()) {
      setError('Please enter both topic and essay content for analysis.');
      return;
    }
    
    setAnalyzingParagraphs(true);
    setError('');
    setParagraphAnalysis([]);
    setFixedEssay('');
    
    try {
      const res = await fetch('/api/analyzeParagraphRelevance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, essay, autoFix })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze paragraphs.');
      
      setParagraphAnalysis(data.relevanceReport);
      if (data.fixedEssay) {
        setFixedEssay(data.fixedEssay);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze paragraphs.');
    } finally {
      setAnalyzingParagraphs(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case '✅ On-topic':
        return 'text-green-600 bg-green-50 border-green-200';
      case '🟡 Needs Improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case '❌ Off-topic':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '✅ On-topic':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case '🟡 Needs Improvement':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case '❌ Off-topic':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Add save handler
  const handleSaveEssay = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      // You may want to extract type, score, feedback from the generated essay or set defaults
      const type = 'Generated';
      const score = relevanceScore ?? 80;
      const feedback = relevanceAnalysis.length > 0
        ? relevanceAnalysis.map(r => r.suggestion).join(' ')
        : 'Essay generated by AI.';
      const res = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content: essay, type, score, feedback })
      });
      if (!res.ok) throw new Error('Failed to save essay.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save essay.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Relevance Score Summary */}
      {typeof relevanceScore === 'number' && (
        <div className={`mb-4 p-3 rounded-lg font-semibold flex items-center ${relevanceScore >= 70 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
          {relevanceScore >= 70 ? '✅' : '⚠️'} Relevance Score: {relevanceScore}% ({essayParagraphs.length - flaggedParagraphs.length} of {essayParagraphs.length} paragraphs on-topic)
          {relevanceScore < 70 && (
            <span className="ml-2 font-normal">Some parts of your essay drift from the topic. Review feedback below.</span>
          )}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-7 w-7 text-purple-600 mr-2" /> Essay Generator & Analyzer
          </h1>
        </div>
        <p className="text-gray-600">Generate high-quality essays and analyze paragraph relevance with AI assistance.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Generate Essay
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analyze'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Analyze Paragraphs
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    Essay Topic or Question
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="E.g., Discuss the impact of climate change on coastal cities."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                      Output Format
                    </label>
                    <select
                      id="format"
                      value={format}
                      onChange={e => setFormat(e.target.value as 'structured' | 'clean')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="clean">Clean Academic Essay</option>
                      <option value="structured">Structured Essay</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkRelevance}
                        onChange={e => setCheckRelevance(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Check Relevance</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Essay...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Essay
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Generated Essay */}
            {essay && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Essay</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(essay)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                    <button
                      onClick={handleSaveEssay}
                      disabled={saving || saveSuccess}
                      className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg transition-colors ${saveSuccess ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : saveSuccess ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>{saveSuccess ? 'Saved!' : 'Save to History'}</span>
                    </button>
                  </div>
                </div>
                {saveError && <div className="text-red-500 text-sm mb-2">{saveError}</div>}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{essay}</div>
                </div>
              </div>
            )}

            {/* Relevance Issues */}
            {relevanceAnalysis.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  Relevance Issues Found
                </h3>
                <div className="space-y-3">
                  {relevanceAnalysis.map((issue, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="font-medium text-orange-800">{issue.paragraph}</div>
                      <div className="text-sm text-orange-700 mt-1">{issue.issue}</div>
                      <div className="text-sm text-orange-600 mt-2">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic Length:</span>
                  <span className="font-medium">{topic.length} chars</span>
                </div>
                {essay && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Essay Length:</span>
                      <span className="font-medium">{essay.length} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paragraphs:</span>
                      <span className="font-medium">{essayParagraphs.length}</span>
                    </div>
                    {relevanceScore !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relevance Score:</span>
                        <span className={`font-medium ${relevanceScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {relevanceScore}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                Writing Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Be specific and provide concrete examples</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use clear topic sentences for each paragraph</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Maintain logical flow between paragraphs</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include a strong conclusion that summarizes key points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analyze' && (
        <div className="space-y-6">
          {/* Tool Behavior Explanation */}
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 text-sm">
              <strong>Note:</strong> Relevance Checker uses <strong>stricter criteria across the whole essay</strong>, while <strong>Paragraph Analyzer</strong> focuses on clarity, grammar, and paragraph flow <strong>individually</strong>.
            </span>
          </div>
          {/* Analysis Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paragraph Analysis</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="analyze-topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Topic
                </label>
                <input
                  id="analyze-topic"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter the essay topic for analysis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="analyze-essay" className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Content
                </label>
                <textarea
                  id="analyze-essay"
                  value={essay}
                  onChange={e => setEssay(e.target.value)}
                  placeholder="Paste your essay content here for paragraph analysis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[200px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-fix"
                  checked={autoFix}
                  onChange={e => setAutoFix(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="auto-fix" className="text-sm text-gray-700">
                  Auto-fix problematic paragraphs
                </label>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleParagraphAnalysis}
                disabled={analyzingParagraphs || !topic.trim() || !essay.trim()}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {analyzingParagraphs ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Paragraphs...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Paragraphs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {paragraphAnalysis.length > 0 && (
            <div className="space-y-6">
              {/* Save to History Button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleSaveAnalysis}
                  disabled={savingAnalysis || saveAnalysisSuccess}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${saveAnalysisSuccess ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${savingAnalysis ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {savingAnalysis ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveAnalysisSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{saveAnalysisSuccess ? 'Saved!' : 'Save to History'}</span>
                </button>
              </div>
              {saveAnalysisError && <div className="text-red-500 text-sm mb-2">{saveAnalysisError}</div>}
              {/* Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {paragraphAnalysis.filter(p => p.status === '✅ On-topic').length}
                    </div>
                    <div className="text-sm text-green-700">On-topic</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {paragraphAnalysis.filter(p => p.status === '🟡 Needs Improvement' || p.status === '⚠️ Somewhat Off-topic').length}
                    </div>
                    <div className="text-sm text-yellow-700">Needs Improvement</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {paragraphAnalysis.filter(p => p.status === '❌ Off-topic').length}
                    </div>
                    <div className="text-sm text-red-700">Off-topic</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {paragraphAnalysis.filter(p => !['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic', '⚠️ Somewhat Off-topic'].includes(p.status)).length}
                    </div>
                    <div className="text-sm text-gray-700">Other</div>
                    {/* Show unique status strings counted as Other */}
                    {(() => {
                      const otherStatuses = Array.from(new Set(paragraphAnalysis
                        .filter(p => !['✅ On-topic', '🟡 Needs Improvement', '❌ Off-topic', '⚠️ Somewhat Off-topic'].includes(p.status))
                        .map(p => p.status)));
                      return otherStatuses.length > 0 ? (
                        <ul className="mt-2 text-xs text-gray-500 text-left">
                          {otherStatuses.map((status, idx) => (
                            <li key={idx}>• {status}</li>
                          ))}
                        </ul>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                <div className="space-y-4">
                  {paragraphAnalysis.map((paragraph, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(paragraph.status)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(paragraph.status)}
                          <h4 className="font-semibold">Paragraph {paragraph.paragraph}</h4>
                          <span className="text-sm font-medium">
                            Score: {paragraph.relevanceScore}/100
                          </span>
                        </div>
                        <span className="text-sm font-medium">{paragraph.status}</span>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium mb-2">Original Text:</h5>
                        <div className="text-sm bg-white/50 p-3 rounded border">
                          {paragraph.originalText}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium mb-1">Feedback:</h5>
                        <p className="text-sm">{paragraph.feedback}</p>
                      </div>

                      {paragraph.suggestion && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Suggestion:</h5>
                          <p className="text-sm">{paragraph.suggestion}</p>
                        </div>
                      )}

                      {paragraph.improvedParagraph && (
                        <div>
                          <h5 className="font-medium mb-2">Improved Version:</h5>
                          <div className="text-sm bg-white/50 p-3 rounded border">
                            {paragraph.improvedParagraph}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixed Essay Output */}
              {fixedEssay && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Essay</h3>
                  <div className="prose max-w-none">
                    {fixedEssay.split(/\n\s*\n/).map((para, idx) => (
                      <p key={idx} className="mb-4 text-gray-700">{para.trim()}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 