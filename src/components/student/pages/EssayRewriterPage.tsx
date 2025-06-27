'use client';

import { Edit3, Sparkles, RefreshCw } from "lucide-react";

export default function EssayRewriterPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Essay Rewriter</h1>
        <p className="text-gray-600">Improve your essays with AI-powered rewriting suggestions and enhancements.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Edit3 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Essay Rewriter</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This feature is coming soon! You'll be able to rewrite and improve your essays 
            with advanced AI assistance.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What you'll be able to do:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Improve sentence structure and flow</li>
                <li>• Enhance vocabulary and word choice</li>
                <li>• Fix grammar and punctuation errors</li>
                <li>• Maintain your original voice and style</li>
                <li>• Get multiple rewriting suggestions</li>
                <li>• Compare original vs improved versions</li>
              </ul>
            </div>
            
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto">
              <RefreshCw className="h-5 w-5" />
              <span>Coming Soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 