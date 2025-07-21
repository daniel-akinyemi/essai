'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Edit3, Copy, Download, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, RefreshCw, Sparkles, Lightbulb, RotateCcw, Settings } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/ui/auto-save-status';
import jsPDF from 'jspdf';

interface RewriteResult {
  rewrittenEssay: string;
  originalEssay: string;
  instructions?: string;
  timestamp: string;
  success: boolean;
  suggestions?: string[];
  improvements?: string[];
}

interface Suggestions {
  suggestions: string[];
  success: boolean;
}

export default function EssayRewriterPage() {
  const [originalEssay, setOriginalEssay] = useState('');
  const [instructions, setInstructions] = useState('');
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'rewrite' | 'compare'>('rewrite');
  const [copySuccess, setCopySuccess] = useState(false);
  const { data: session } = useSession();
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  // User settings state
  const [userSettings, setUserSettings] = useState({
    writingStyle: 'academic',
    autoSaveFrequency: '30',
    showWritingTips: true,
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Auto-save functionality
  const autoSaveHandler = async (content: string) => {
    if (!content.trim() || !session?.user) return;
    
    try {
      const response = await fetch('/api/autoSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          topic: 'Essay rewrite draft',
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

  const autoSaveEnabled = userSettings.autoSaveFrequency && userSettings.autoSaveFrequency !== 'none';
  const { isSaving, saveStatus, saveNow } = useAutoSave({
    content: originalEssay,
    autoSaveFrequency: autoSaveEnabled ? userSettings.autoSaveFrequency : undefined,
    onSave: autoSaveHandler,
    enabled: !!session?.user && originalEssay.length > 50 && autoSaveEnabled
  });

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
          writingStyle: data.writingStyle || 'academic',
          autoSaveFrequency: data.autoSaveFrequency || '30',
          showWritingTips: data.showWritingTips !== false,
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setSettingsLoaded(true);
    }
  };

  const handleRewriteEssay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalEssay.trim()) {
      setError('Please enter your essay to rewrite');
      return;
    }

    if (originalEssay.length < 50) {
      setError('Essay must be at least 50 characters long');
      return;
    }

    if (originalEssay.length > 10000) {
      setError('Essay must be less than 10,000 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setAutoSaveMessage('');

    try {
      const response = await fetch('/api/rewriteEssay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalEssay,
          instructions: instructions.trim() || undefined,
          requestType: 'rewrite',
          writingStyle: userSettings.writingStyle && userSettings.writingStyle !== 'none' ? userSettings.writingStyle : 'academic'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite essay');
      }

      const result = await response.json();
      setRewriteResult(result);
      setSuggestions([]); // Do not show tips immediately after rewrite
      setImprovements([]); // Do not show improvements immediately after rewrite
      setActiveTab('compare');
      
      // Automatically save to history
      try {
        const res = await fetch('/api/essays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: originalEssay.slice(0, 120),
            content: result.rewrittenEssay,
            type: 'Rewritten',
            score: 0,
            feedback: instructions || 'Essay rewritten by AI.'
          })
        });
        if (res.ok) {
          setAutoSaveMessage('Rewritten essay automatically saved to your history.');
        }
      } catch (saveError) {
        console.error('Failed to auto-save essay:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while rewriting your essay');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!originalEssay.trim()) {
      setError('Please enter your essay to get suggestions');
      return;
    }

    if (originalEssay.length < 50) {
      setError('Essay must be at least 50 characters long');
      return;
    }

    setIsLoadingSuggestions(true);
    setError('');

    try {
      // If a rewrite exists, fetch both suggestions and improvements
      if (rewriteResult && rewriteResult.rewrittenEssay) {
        const response = await fetch('/api/rewriteEssay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalEssay,
            instructions: instructions.trim() || undefined,
            requestType: 'rewrite',
            writingStyle: userSettings.writingStyle && userSettings.writingStyle !== 'none' ? userSettings.writingStyle : 'academic'
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get suggestions');
        }
        const result = await response.json();
        setSuggestions(result.suggestions || []);
        setImprovements(result.improvements || []);
      } else {
        // No rewrite yet, just get suggestions for the original
        const response = await fetch('/api/rewriteEssay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalEssay,
            requestType: 'suggestions'
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get suggestions');
        }
        const result = await response.json();
        setSuggestions(result.suggestions || []);
        setImprovements([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while getting suggestions');
    } finally {
      setIsLoadingSuggestions(false);
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

  const downloadText = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = () => {
    if (!rewriteResult?.rewrittenEssay) return;
    const doc = new jsPDF();
    doc.setFont("times", "normal"); // Use Times (Times New Roman style)
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(rewriteResult.rewrittenEssay, 180);
    doc.text(lines, 10, 10);
    doc.save('rewritten-essay.pdf');
  };

  const resetForm = () => {
    setOriginalEssay('');
    setInstructions('');
    setRewriteResult(null);
    setSuggestions([]);
    setImprovements([]);
    setError('');
    setActiveTab('rewrite');
  };

  const wordCount = originalEssay.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = originalEssay.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl mb-6">
            <Edit3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Essay Rewriter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your essays with AI-powered rewriting suggestions and enhancements
          </p>
        </div>

        {/* User Preferences Indicator */}
        {settingsLoaded && userSettings.writingStyle !== 'none' && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-800">Using Your Writing Preferences</div>
                  <div className="text-xs text-green-600">
                    Style: {userSettings.writingStyle.charAt(0).toUpperCase() + userSettings.writingStyle.slice(1)}
                  </div>
                </div>
              </div>
              <a 
                href="/dashboard/settings" 
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Change Settings
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Original Essay</h2>
                  <p className="text-gray-600">Paste your essay to rewrite and improve</p>
                </div>
              </div>

              <form onSubmit={handleRewriteEssay} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Essay Content *
                  </label>
                  <textarea
                    value={originalEssay}
                    onChange={(e) => setOriginalEssay(e.target.value)}
                    placeholder="Paste your essay here to rewrite and improve it..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm"
                    required
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{charCount} characters • {wordCount} words</span>
                    <div className="flex items-center space-x-4">
                      {/* Auto-save Status */}
                      {session?.user && originalEssay.length > 50 && autoSaveEnabled && (
                        <AutoSaveStatus 
                          status={saveStatus} 
                          frequency={userSettings.autoSaveFrequency}
                          className="text-sm"
                        />
                      )}
                      <span className={charCount > 10000 ? 'text-red-500' : ''}>
                        {charCount < 50 ? 'Minimum 50 characters' : `${10000 - charCount} characters remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="instructions" className="block text-sm font-semibold text-gray-700">
                    Specific Instructions (Optional)
                  </label>
                  <textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="E.g., 'Make it more formal', 'Improve the conclusion', 'Use more academic vocabulary'..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm"
                  />
                </div>

                {error && (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isLoading || !originalEssay.trim() || charCount < 50}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Rewriting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Rewrite Essay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGetSuggestions}
                    disabled={isLoadingSuggestions || !originalEssay.trim() || charCount < 50}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    {isLoadingSuggestions ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Getting Tips...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-5 w-5" />
                        <span>Get Tips</span>
                      </>
                    )}
                  </button>

                  {(rewriteResult || suggestions.length > 0) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Results Section */}
            {rewriteResult && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <nav className="flex space-x-8 px-8">
                    <button
                      onClick={() => setActiveTab('rewrite')}
                      className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                        activeTab === 'rewrite'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Rewritten Essay
                    </button>
                    <button
                      onClick={() => setActiveTab('compare')}
                      className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                        activeTab === 'compare'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Side-by-Side Compare
                    </button>
                  </nav>
                </div>

                <div className="p-8">
                  {activeTab === 'rewrite' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-900">Improved Version</h3>
                      </div>
                      
                      {rewriteResult && activeTab === 'rewrite' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => copyToClipboard(rewriteResult.rewrittenEssay)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <Copy className="h-4 w-4" />
                            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadText(rewriteResult.rewrittenEssay, 'rewritten-essay.txt')}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-gray-700 hover:to-gray-800 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={handleDownloadPDF}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <pre className="whitespace-pre-wrap text-gray-900 font-sans leading-relaxed">
                          {rewriteResult.rewrittenEssay}
                        </pre>
                      </div>
                      
                      {rewriteResult.instructions && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Applied instructions:</strong> {rewriteResult.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'compare' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Original</h3>
                        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-gray-900 text-sm font-sans leading-relaxed">
                            {rewriteResult.originalEssay}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Improved</h3>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-gray-900 text-sm font-sans leading-relaxed">
                            {rewriteResult.rewrittenEssay}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Before Rewrite Suggestions (show only if present) */}
            {suggestions.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Here’s what’s wrong with your essay.</h3>
                </div>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* After Rewrite Improvements (show only if present) */}
            {improvements.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Here’s what we improved for you.</h3>
                </div>
                <div className="space-y-4">
                  {improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Features</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Improve sentence structure and flow</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Enhance vocabulary and word choice</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Fix grammar and punctuation errors</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Maintain your original voice and style</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Side-by-side comparison</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Custom rewriting instructions</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            {userSettings.showWritingTips && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">Pro Tips</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Be specific with your instructions for better results</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use "Get Tips" to understand areas for improvement</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Compare side-by-side to see the changes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Download or copy the improved version</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 