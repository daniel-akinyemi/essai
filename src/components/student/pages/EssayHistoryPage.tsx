'use client';

import { History, FileText, TrendingUp, Calendar, Award } from "lucide-react";

export default function EssayHistoryPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Essay History</h1>
        <p className="text-gray-600">View and track your submitted essays, scores, and writing progress over time.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Essay Journey</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This feature is coming soon! You'll be able to view all your submitted essays, 
            track your progress, and analyze your writing improvements.
          </p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Total Essays</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-500">Submitted</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Average Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-gray-500">Improving</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Best Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">92%</p>
                <p className="text-sm text-gray-500">Achieved</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">What you'll be able to do:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• View all submitted essays</li>
                  <li>• Track score progression</li>
                  <li>• Download essays and feedback</li>
                  <li>• Compare different versions</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Analyze writing patterns</li>
                  <li>• View detailed feedback</li>
                  <li>• Export progress reports</li>
                  <li>• Share with teachers</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Sample Essay Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">"The Impact of Technology on Education"</p>
                    <p className="text-xs text-gray-500">Score: 88% • Submitted 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">"Climate Change Solutions"</p>
                    <p className="text-xs text-gray-500">Score: 92% • Submitted 1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">"The Future of Remote Work"</p>
                    <p className="text-xs text-gray-500">Score: 85% • Submitted 2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 