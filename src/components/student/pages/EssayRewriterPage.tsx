'use client';

import { useState } from 'react';
import { Edit3, Sparkles, RefreshCw, Copy, Download, ArrowRight, Lightbulb, AlertCircle, CheckCircle, Loader2, RotateCcw, Settings } from "lucide-react";

interface RewriteResult {
  rewrittenEssay: string;
  originalEssay: string;
  instructions?: string;
  timestamp: string;
  success: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'rewrite' | 'compare'>('rewrite');
  const [copySuccess, setCopySuccess] = useState(false);

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

    try {
      const response = await fetch('/api/rewriteEssay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalEssay,
          instructions: instructions.trim() || undefined,
          requestType: 'rewrite'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite essay');
      }

      const result: RewriteResult = await response.json();
      setRewriteResult(result);
      setActiveTab('compare');
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

      const result: Suggestions = await response.json();
      setSuggestions(result.suggestions);
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

  const resetForm = () => {
    setOriginalEssay('');
    setInstructions('');
    setRewriteResult(null);
    setSuggestions([]);
    setError('');
    setActiveTab('rewrite');
  };

  const wordCount = originalEssay.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = originalEssay.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Essay Rewriter</h1>
        <p className="text-gray-600">Improve your essays with AI-powered rewriting suggestions and enhancements.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Input Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              <span>Original Essay</span>
            </h2>

            <form onSubmit={handleRewriteEssay} className="space-y-4">
              <div>
                <textarea
                  value={originalEssay}
                  onChange={(e) => setOriginalEssay(e.target.value)}
                  placeholder="Paste your essay here to rewrite and improve it..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{charCount} characters • {wordCount} words</span>
                  <span className={charCount > 10000 ? 'text-red-500' : ''}>
                    {charCount < 50 ? 'Minimum 50 characters' : `${10000 - charCount} characters remaining`}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., 'Make it more formal', 'Improve the conclusion', 'Use more academic vocabulary'..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !originalEssay.trim() || charCount < 50}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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
                    className="bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center space-x-2 transition-colors"
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('rewrite')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'rewrite'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Rewritten Essay
                  </button>
                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'compare'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Side-by-Side Compare
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'rewrite' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Improved Version</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(rewriteResult.rewrittenEssay)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadText(rewriteResult.rewrittenEssay, 'rewritten-essay.txt')}
                          className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap text-gray-900 font-sans">
                        {rewriteResult.rewrittenEssay}
                      </pre>
                    </div>
                    {rewriteResult.instructions && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Applied instructions:</strong> {rewriteResult.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'compare' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Original</h3>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-900 text-sm font-sans">
                          {rewriteResult.originalEssay}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Improved</h3>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-900 text-sm font-sans">
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
        <div className="space-y-6">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Improvement Tips</span>
              </h3>
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <span>Features</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Improve sentence structure and flow</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Enhance vocabulary and word choice</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Fix grammar and punctuation errors</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Maintain your original voice and style</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Side-by-side comparison</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Custom rewriting instructions</span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Pro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Be specific with your instructions for better results</li>
              <li>• Use "Get Tips" to understand areas for improvement</li>
              <li>• Compare side-by-side to see the changes</li>
              <li>• Download or copy the improved version</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 