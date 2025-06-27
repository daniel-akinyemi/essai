'use client';

import { BookOpen, Lightbulb, Target, CheckCircle, ArrowRight } from "lucide-react";

export default function WritingGuidePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Guide</h1>
        <p className="text-gray-600">Access comprehensive essay writing tips, guides, and best practices to improve your writing skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Tips */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Quick Tips</span>
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Always start with a strong thesis statement</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Use clear topic sentences for each paragraph</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Include evidence and examples to support your arguments</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">End with a compelling conclusion</span>
            </div>
          </div>
        </div>

        {/* Essay Structure */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Essay Structure</span>
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Introduction</h3>
              <p className="text-sm text-gray-600">Hook, background, thesis statement</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900">Body Paragraphs</h3>
              <p className="text-sm text-gray-600">Topic sentence, evidence, analysis</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900">Conclusion</h3>
              <p className="text-sm text-gray-600">Restate thesis, summarize, closing thoughts</p>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-red-500" />
            <span>Common Mistakes</span>
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 text-sm">Grammar Errors</h3>
              <p className="text-xs text-red-700">Subject-verb agreement, punctuation</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 text-sm">Weak Arguments</h3>
              <p className="text-xs text-red-700">Lack of evidence, logical fallacies</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 text-sm">Poor Structure</h3>
              <p className="text-xs text-red-700">Unclear organization, missing transitions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Writing Guide</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            This feature is coming soon! You'll have access to detailed writing guides, 
            interactive tutorials, and personalized writing tips to help you improve your essay writing skills.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">What's Coming:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Interactive writing tutorials</li>
                <li>• Grammar and style guides</li>
                <li>• Essay type-specific tips</li>
                <li>• Citation and formatting guides</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Video tutorials</li>
                <li>• Practice exercises</li>
                <li>• Progress tracking</li>
                <li>• Expert writing tips</li>
              </ul>
            </div>
          </div>
          
          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
            <ArrowRight className="h-5 w-5" />
            <span>Coming Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
} 