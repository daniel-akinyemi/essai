'use client';

import { FileText, TrendingUp, Clock, Award, BookOpen, Users, Edit3, Sparkles } from "lucide-react";

interface StudentMainContentProps {
  activePage: string;
}

export default function StudentMainContent({ activePage }: StudentMainContentProps) {
  const renderOverview = () => (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Student! 👋</h1>
        <p className="text-blue-100">Ready to improve your essay writing skills? Let's get started!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Essays Submitted</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Submit New Essay</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Edit3 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Rewrite Essay</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <span className="font-medium">View Assignments</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Essay submitted</p>
                <p className="text-xs text-gray-500">"The Impact of Technology on Education" - 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Score received</p>
                <p className="text-xs text-gray-500">"Climate Change Solutions" - Score: 88% - 1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Joined class</p>
                <p className="text-xs text-gray-500">English Literature 101 - 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Features Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
            <p className="text-purple-100 mb-4">Unlock AI essay generation, advanced analytics, and unlimited submissions.</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
          <div className="hidden md:block">
            <Sparkles className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="p-6">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-500">This feature is coming soon. Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  );

  // Render content based on active page
  switch (activePage) {
    case 'overview':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderOverview()}
        </main>
      );
    
    case 'submit-essay':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Submit Essay',
            'Submit your essays for AI-powered scoring and feedback.'
          )}
        </main>
      );
    
    case 'essay-rewriter':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Essay Rewriter',
            'Improve your essays with AI-powered rewriting suggestions.'
          )}
        </main>
      );
    
    case 'essay-generator':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Essay Generator',
            'Generate essays with AI assistance. (Pro feature)'
          )}
        </main>
      );
    
    case 'essay-history':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Essay History',
            'View and manage your submitted essays and scores.'
          )}
        </main>
      );
    
    case 'assignments':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Assignments',
            'View and submit assignments from your teachers.'
          )}
        </main>
      );
    
    case 'join-class':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Join Class',
            'Join a class using your class code.'
          )}
        </main>
      );
    
    case 'writing-guide':
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPlaceholder(
            'Writing Guide',
            'Access essay writing tips, guides, and best practices.'
          )}
        </main>
      );
    
    default:
      return (
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderOverview()}
        </main>
      );
  }
} 