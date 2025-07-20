'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Search, AlertCircle, Loader2, TrendingUp, Target, CheckCircle, Search as SearchIcon, Download } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/ui/auto-save-status';
import jsPDF from 'jspdf';

interface ParagraphAnalysis {
  paragraph: number;
  originalText: string;
  relevanceScore: number;
  status: "✅ On-topic" | "🟡 Needs Improvement" | "❌ Off-topic" | "⚠️ Somewhat Off-topic";
  feedback: string;
  suggestion?: string;
  improvedParagraph?: string | null;
}

export default function ParagraphAnalyzerPage() {
  const [topic, setTopic] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paragraphAnalysis, setParagraphAnalysis] = useState<ParagraphAnalysis[]>([]);
  const [analyzingParagraphs, setAnalyzingParagraphs] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [fixedEssay, setFixedEssay] = useState<string>('');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: session } = useSession();

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
          topic: topic || 'Paragraph analysis draft',
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
    content: essay,
    autoSaveFrequency: userSettings.autoSaveFrequency && userSettings.autoSaveFrequency !== 'none' ? userSettings.autoSaveFrequency : '30', // Use user's preferred frequency or default
    onSave: autoSaveHandler,
    enabled: !!session?.user && essay.length > 50
  });

  const handleParagraphAnalysis = async () => {
    if (!topic.trim() || !essay.trim()) {
      setError('Please enter both topic and essay content for analysis.');
      return;
    }
    
    setAnalyzingParagraphs(true);
    setError('');
    setParagraphAnalysis([]);
    setFixedEssay('');
    setAutoSaveMessage('');
    
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
      // Automatically save analysis result to history
      const contentToSave = data.fixedEssay || essay;
      const feedbackSummary = data.relevanceReport.map((p: any) => p.feedback).join(' ');
      await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content: contentToSave,
          type: 'Paragraph Analysis',
          score: 0,
          feedback: feedbackSummary || 'Paragraph analysis feedback.'
        })
      });
      setAutoSaveMessage('Paragraph analysis automatically saved to your history.');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze paragraphs.');
    } finally {
      setAnalyzingParagraphs(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '✅ On-topic':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case '🟡 Needs Improvement':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case '❌ Off-topic':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '✅ On-topic':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case '🟡 Needs Improvement':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case '❌ Off-topic':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Add copy handler for fixed essay
  const handleCopyFixedEssay = () => {
    if (fixedEssay) {
      navigator.clipboard.writeText(fixedEssay).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!fixedEssay) return;
    const doc = new jsPDF();
    doc.setFont("times", "normal"); // Use Times (Times New Roman style)
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(fixedEssay, 180);
    doc.text(lines, 10, 10);
    doc.save('fixed-essay.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl mb-6">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Paragraph Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze paragraph relevance, flow, and get AI-powered suggestions for improvement
          </p>
        </div>

        <div className="space-y-8">
          {/* Tool Behavior Explanation */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <span className="text-blue-800 text-sm font-medium">
              <strong>Note:</strong> Paragraph Analyzer focuses on clarity, grammar, and paragraph flow <strong>individually</strong>.
            </span>
          </div>
          
          {/* Analysis Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Paragraph Analysis</h3>
                <p className="text-gray-600">Analyze your essay paragraphs for relevance and improvement</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="analyze-topic" className="block text-sm font-semibold text-gray-700">
                  Essay Topic
                </label>
                <input
                  id="analyze-topic"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter the essay topic for analysis"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="analyze-essay" className="block text-sm font-semibold text-gray-700">
                  Essay Content
                </label>
                <textarea
                  id="analyze-essay"
                  value={essay}
                  onChange={e => setEssay(e.target.value)}
                  placeholder="Paste your essay content here for paragraph analysis..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 min-h-[200px] resize-none bg-white/50 backdrop-blur-sm"
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{essay.length} characters</span>
                  <div className="flex items-center space-x-4">
                    {/* Auto-save Status */}
                    {session?.user && essay.length > 50 && (
                      <AutoSaveStatus 
                        status={saveStatus} 
                        frequency={userSettings.autoSaveFrequency && userSettings.autoSaveFrequency !== 'none' ? userSettings.autoSaveFrequency : '30'}
                        className="text-sm"
                      />
                    )}
                    <span className={essay.length < 100 ? 'text-amber-500' : 'text-green-600'}>
                      {essay.length < 100 ? 'Add more content for better analysis' : '✓ Ready for analysis'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="auto-fix"
                  checked={autoFix}
                  onChange={e => setAutoFix(e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 w-5 h-5"
                />
                <label htmlFor="auto-fix" className="text-sm font-semibold text-gray-700">
                  Auto-fix problematic paragraphs
                </label>
              </div>

              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleParagraphAnalysis}
                disabled={analyzingParagraphs || !topic.trim() || !essay.trim()}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                {analyzingParagraphs ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing Paragraphs...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Analyze Paragraphs</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Analysis Results */}
          {paragraphAnalysis.length > 0 && (
            <div className="space-y-8">
              {/* Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {paragraphAnalysis.filter(p => p.status === '✅ On-topic').length}
                    </div>
                    <div className="text-sm font-semibold text-emerald-700">On-topic</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {paragraphAnalysis.filter(p => p.status === '🟡 Needs Improvement' || p.status === '⚠️ Somewhat Off-topic').length}
                    </div>
                    <div className="text-sm font-semibold text-amber-700">Needs Improvement</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-slate-50 rounded-2xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {paragraphAnalysis.filter(p => p.status === '❌ Off-topic').length}
                    </div>
                    <div className="text-sm font-semibold text-red-700">Off-topic</div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Detailed Analysis</h3>
                </div>
                
                <div className="space-y-6">
                  {paragraphAnalysis.map((paragraph, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border ${getStatusColor(paragraph.status)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(paragraph.status)}
                          <h4 className="font-bold text-lg">Paragraph {paragraph.paragraph}</h4>
                          <span className="text-sm font-semibold bg-white/50 px-3 py-1 rounded-full">
                            Score: {paragraph.relevanceScore}/100
                          </span>
                        </div>
                        <span className="text-sm font-semibold">{paragraph.status}</span>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-semibold mb-3 text-gray-800">Original Text:</h5>
                        <div className="text-sm bg-white/50 p-4 rounded-xl border">
                          {paragraph.originalText}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-semibold mb-2 text-gray-800">Feedback:</h5>
                        <p className="text-sm leading-relaxed">{paragraph.feedback}</p>
                      </div>

                      {paragraph.suggestion && (
                        <div className="mb-4">
                          <h5 className="font-semibold mb-2 text-gray-800">Suggestion:</h5>
                          <p className="text-sm leading-relaxed">{paragraph.suggestion}</p>
                        </div>
                      )}

                      {paragraph.improvedParagraph && (
                        <div>
                          <h5 className="font-semibold mb-3 text-gray-800">Improved Version:</h5>
                          <div className="text-sm bg-white/50 p-4 rounded-xl border">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Fixed Essay</h3>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    {fixedEssay.split(/\n\s*\n/).map((para, idx) => (
                      <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{para.trim()}</p>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <button
                      onClick={handleCopyFixedEssay}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 transition"
                    >
                      {copySuccess ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <FileText className="h-5 w-5 text-white" />
                      )}
                      {copySuccess ? 'Copied!' : 'Copy Essay'}
                    </button>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 