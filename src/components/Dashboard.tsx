'use client';
import React, { useState } from 'react';
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

// Main App component for Dashboard Overview and Essay Generation
const App = () => {
  // --- Dashboard State ---
  // Mock metrics
  const [metrics, setMetrics] = useState({
    essaysGenerated: 8,
    wordsWritten: 4200,
    averageScore: 87,
  });
  // Mock recent activity
  const [recentActivity, setRecentActivity] = useState([
    { title: 'The Future of AI', date: '2024-06-01', status: 'Generated' },
    { title: 'Climate Change Solutions', date: '2024-05-29', status: 'Generated' },
    { title: 'Education in the Digital Age', date: '2024-05-27', status: 'Generated' },
  ]);
  // Mock trends data
  const [trends, setTrends] = useState([
    { week: 'Apr 29', count: 1 },
    { week: 'May 6', count: 2 },
    { week: 'May 13', count: 1 },
    { week: 'May 20', count: 2 },
    { week: 'May 27', count: 1 },
    { week: 'Jun 3', count: 1 },
  ]);

  // --- Essay Generation State ---
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState(500);
  const [tone, setTone] = useState('Neutral');
  const [loading, setLoading] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState('');
  const [error, setError] = useState('');

  // --- Essay Generation Handler ---
  const handleGenerate = async () => {
    setError('');
    setGeneratedEssay('');
    if (!topic.trim()) {
      setError('Please enter an essay topic.');
      return;
    }
    setLoading(true);
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
      setRecentActivity((prev) => [
        { title: topic, date: new Date().toISOString().slice(0, 10), status: 'Generated' },
        ...prev.slice(0, 9),
      ]);
      setTrends((prev) => {
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
      setError('Failed to generate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
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
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a href="/dashboard/essay-history" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <FileText className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{metrics.essaysGenerated}</div>
              <div className="text-sm opacity-80">Essays Generated</div>
            </a>
            <a href="/dashboard/essay-history" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <Activity className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{metrics.wordsWritten}</div>
              <div className="text-sm opacity-80">Words Written</div>
            </a>
            <a href="/dashboard/essay-history" className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <PlusCircle className="h-8 w-8 mb-2" />
              <div className="text-3xl font-bold">{metrics.averageScore}%</div>
              <div className="text-sm opacity-80">Average Score</div>
            </a>
          </div>

          {/* Essay Generation Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" /> Essay Generation
            </h2>
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
            <button
              className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-2 font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 disabled:opacity-60"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />} Generate Essay
            </button>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            {generatedEssay && (
              <div className="mt-6 max-h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-line">
                {generatedEssay}
              </div>
            )}
          </div>
        </section>

        {/* Right/Sidebar Column */}
        <aside className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" /> Recent Activity
            </h3>
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((item, idx) => (
                <li key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <a href="/dashboard/essay-history" className="block group">
                    <div className="font-medium text-gray-900 group-hover:underline">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </a>
                  <span className="inline-block mt-1 sm:mt-0 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-medium">
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Generation Trends Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" /> Generation Trends
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
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
