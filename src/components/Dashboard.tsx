'use client';
import React, { useEffect, useState } from 'react';
import {
  Home,
  FileText,
  Settings,
  Activity,
  PlusCircle,
  Loader2,
  LogOut,
} from 'lucide-react';
import Link from "next/link";
import { signOut } from 'next-auth/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Add types for activity and trends
interface ActivityItem {
  title: string;
  date: string;
  status: string;
}
interface TrendItem {
  week: string;
  count: number;
}

// Add helper for relative date formatting
function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return 'Yesterday';
  return date.toLocaleDateString();
}

// Main App component for Dashboard Overview and Essay Generation
const App = () => {
  // --- Dashboard State ---
  const [metrics, setMetrics] = useState({
    essaysGenerated: 0,
    wordsWritten: 0,
    averageScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/essays/metrics')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Dashboard metrics fetch failed:', res.status, text);
          throw new Error('Failed to fetch dashboard metrics');
        }
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentActivity(data.recentActivity);
        setTrends(data.trends);
      })
      .catch((err) => {
        console.error('Dashboard metrics fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Essay Generation State ---
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState(500);
  const [tone, setTone] = useState('Neutral');
  const [loadingEssay, setLoadingEssay] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState('');
  const [errorEssay, setErrorEssay] = useState('');

  // --- Essay Generation Handler ---
  const handleGenerate = async () => {
    setErrorEssay('');
    setGeneratedEssay('');
    if (!topic.trim()) {
      setErrorEssay('Please enter an essay topic.');
      return;
    }
    setLoadingEssay(true);
    try {
      // Call the Next.js API route for essay generation
      const response = await fetch('/api/generateEssay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format: 'clean' }),
      });
      if (!response.ok) throw new Error('Failed to generate essay.');
      const data = await response.json();
      setGeneratedEssay(data.essay || 'No essay generated.');
      // Update metrics and recent activity
      setMetrics((prev) => ({
        ...prev,
        essaysGenerated: prev.essaysGenerated + 1,
        wordsWritten: prev.wordsWritten + length,
      }));
      setRecentActivity((prev: ActivityItem[]) => [
        { title: topic, date: new Date().toISOString().slice(0, 10), status: 'Generated' },
        ...prev.slice(0, 9),
      ]);
      setTrends((prev: TrendItem[]) => {
        // Update the latest week count
        const last = [...prev].pop();
        if (last) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, count: last.count + 1 };
          return updated;
        }
        return prev;
      });
    } catch (err) {
      setErrorEssay('Failed to generate essay. Please try again.');
    } finally {
      setLoadingEssay(false);
    }
  };

  // --- UI ---
  // Remove full-page loading spinner. Render layout instantly and show skeletons for data sections.
  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center gap-3">
          <Home className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Settings className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
          </Link>
          <button
            title="Sign Out"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Sign Out"
          >
            <LogOut className="h-5 w-5 text-gray-400 hover:text-red-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Message */}
        <div className="lg:col-span-3 mb-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg p-8 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center bg-white/20 rounded-full h-16 w-16">
              <Home className="h-10 w-10 text-white drop-shadow" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-1 drop-shadow">Welcome to Essai!</h2>
              <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow">
                Your AI-powered platform for essay evaluation, improvement, and generation. Get instant feedback, track your progress, and create high-quality essays with ease.
              </p>
            </div>
          </div>
        </div>
        {/* Left/Main Column */}
        <section className="lg:col-span-2 space-y-8">
          {/* Essay Generation Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" /> Essay Generation
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Essay Topic</label>
                <input
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter your essay topic"
                />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Desired Length (words)</label>
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          type="number"
          min={50}
          max={5000}
          step={50}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          placeholder="e.g. 500"
          list="length-options"
        />
        <datalist id="length-options">
          <option value="250" />
          <option value="500" />
          <option value="750" />
          <option value="1000" />
        </datalist>
      </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Tone</label>
                <select
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                >
                  <option value="Neutral">Neutral</option>
                  <option value="Formal">Formal</option>
                  <option value="Informal">Informal</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>
            </div>
            )}
            <button
              className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-2 font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 disabled:opacity-60"
              onClick={handleGenerate}
              disabled={loadingEssay || loading}
            >
              {loadingEssay ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />} Generate Essay
            </button>
            {errorEssay && <div className="text-red-600 text-sm mt-2">{errorEssay}</div>}
            {generatedEssay && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedEssay)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <FileText className="h-4 w-4" />
                  <span>Copy</span>
                </button>
              </div>
            )}
            {generatedEssay && (
              <div className="mt-6 max-h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-line">
                {generatedEssay}
              </div>
            )}
          </div>

          {/* Metrics (skeletons if loading) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {loading ? (
              <>
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              </>
            ) : (
              <>
                <Link href="/dashboard/essay-history" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
                  <FileText className="h-8 w-8 mb-2" />
                  <div className="text-3xl font-bold">{metrics.essaysGenerated}</div>
                  <div className="text-sm opacity-80">Essays Generated</div>
                </Link>
                <Link href="/dashboard/essay-history" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
                  <Activity className="h-8 w-8 mb-2" />
                  <div className="text-3xl font-bold">{metrics.wordsWritten}</div>
                  <div className="text-sm opacity-80">Words Written</div>
                </Link>
                <Link href="/dashboard/essay-history" className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <div className="text-3xl font-bold">{metrics.averageScore}%</div>
                  <div className="text-sm opacity-80">Average Score</div>
                </Link>
              </>
            )}
          </div>

          {/* Recent Activity - Modern Timeline (skeletons if loading) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" /> Recent Activity
            </h3>
            {loading ? (
              <ul className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm animate-pulse">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium whitespace-nowrap h-5 w-16" />
                </li>
              ))}
            </ul>
            ) : (
              <ul className="relative border-l-2 border-blue-100 pl-6 max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <li className="text-gray-400 text-center py-8">No recent activity yet.</li>
                ) : (
                  recentActivity.map((item, idx) => (
                    <li key={idx} className="mb-8 last:mb-0 relative">
                      <span className="absolute -left-3 top-1.5 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white shadow"></span>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatRelativeDate(item.date)}</div>
                        </div>
                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                          item.status === 'Generated'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </section>

        {/* Right/Sidebar Column */}
        <aside className="space-y-8">
          {/* Generation Trends Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" /> Generation Trends
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
        </main>
    </div>
  );
};

export default App;
