'use client';

import { Sparkles, Crown, Zap } from "lucide-react";

export default function EssayGeneratorPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Essay Generator</h1>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
            PRO
          </span>
        </div>
        <p className="text-gray-600">Generate high-quality essays with AI assistance and contextual relevance checking.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Essay Generator</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This is a Pro feature! Upgrade your account to unlock AI-powered essay generation 
            with contextual relevance checking.
          </p>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span>Pro Features</span>
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Generate essays from prompts or topics</li>
                <li>• Contextual relevance checking</li>
                <li>• Multiple writing styles and tones</li>
                <li>• Customizable essay length</li>
                <li>• Citation and reference generation</li>
                <li>• Plagiarism-free content</li>
                <li>• Export in multiple formats</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Why Upgrade to Pro?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Save time on essay writing</li>
                <li>• Learn from AI-generated examples</li>
                <li>• Improve your writing skills</li>
                <li>• Meet tight deadlines</li>
                <li>• Access advanced AI features</li>
              </ul>
            </div>
            
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2 mx-auto">
              <Crown className="h-5 w-5" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 