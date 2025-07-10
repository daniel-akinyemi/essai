'use client';

import { FileText, TrendingUp, Clock, Award, BookOpen, Edit3, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface MainContentProps {
  activePage: string;
  userName?: string;
}

export default function MainContent({ activePage, userName }: MainContentProps) {
  const router = useRouter();
  const renderOverview = () => (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋</h1>
        <p className="text-blue-100">Essai helps you evaluate, improve, and generate essays with AI. Get started below!</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <FileText className="h-10 w-10 text-blue-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Essay Scoring</h3>
          <p className="text-gray-600 mb-4">Get instant, AI-powered feedback and scores for your essays.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={() => router.push('/dashboard/score-essay')}
          >
            Score Essay
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <Edit3 className="h-10 w-10 text-green-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Essay Rewriting</h3>
          <p className="text-gray-600 mb-4">Improve your writing with smart AI rewriting suggestions.</p>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={() => router.push('/dashboard/essay-rewriter')}
          >
            Rewrite Essay
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <Sparkles className="h-10 w-10 text-purple-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Essay Generation</h3>
          <p className="text-gray-600 mb-4">Generate high-quality essays on any topic with AI assistance.</p>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            onClick={() => router.push('/dashboard/essay-generator')}
          >
            Generate Essay
          </button>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <BookOpen className="h-10 w-10 text-orange-500 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Writing Guide</h3>
          <p className="text-gray-600 mb-4">Access tips, best practices, and guides for better essay writing.</p>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            onClick={() => router.push('/dashboard/writing-guide')}
          >
            Writing Guide
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => router.push('/dashboard/score-essay')}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Submit New Essay</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => router.push('/dashboard/essay-rewriter')}
            >
              <div className="flex items-center space-x-3">
                <Edit3 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Rewrite Essay</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => router.push('/dashboard/essay-generator')}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Generate Essay</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => router.push('/dashboard/writing-guide')}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Writing Guide</span>
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
                <p className="text-sm font-medium text-gray-900">Essay rewritten</p>
                <p className="text-xs text-gray-500">"Modern Education Systems" - 3 days ago</p>
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