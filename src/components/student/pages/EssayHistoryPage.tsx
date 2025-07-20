"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Calendar, Award, TrendingUp, BadgeCheck, Frown, ArrowRightLeft, Search, Sparkles, ChevronDown, ChevronUp, SortAsc, SortDesc, Trash2, AlertTriangle, History, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function scoreLabel(score: number) {
  if (score >= 85) return <span className="text-emerald-600 font-semibold">🟢 Good</span>;
  if (score >= 70) return <span className="text-amber-600 font-semibold">🟡 Average</span>;
  return <span className="text-red-600 font-semibold">🔴 Poor</span>;
}

// Helper function to determine if an essay should show a score
function shouldShowScore(essay: any) {
  // Only show scores for essays that were actually scored (like submitted essays)
  // Generated, rewritten, and paragraph analysis essays don't have meaningful scores
  return essay.type === 'Scored' || essay.type === 'Submitted';
}

// Helper function to get score display
function getScoreDisplay(essay: any) {
  if (!shouldShowScore(essay)) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300">
        No Score
      </span>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-gray-800">{essay.score}/100</span>
      {scoreLabel(essay.score)}
    </div>
  );
}

export default function EssayHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'date' | 'score'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const take = 10;
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/essays?sort=${sort}&order=${order}&take=${take}&skip=${(page-1)*take}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch essays");
        const data = await res.json();
        setEssays(data.essays);
        setHasMore(data.essays.length === take);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, sort, order, page, router]);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const response = await fetch('/api/essays', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear history');
      }

      setEssays([]);
      setShowClearConfirm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  if (status === "loading" || loading) {
    // Show skeleton cards instead of full-page spinner
  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-xl border border-white/20 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
            <History className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Essay History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All your generated, scored, and rewritten essays in one place
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Action Buttons */}
          <div className="flex gap-4 items-center">
            {/* Clear History Button */}
            {essays.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            )}
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-3 items-center">
          <div className="relative">
            <button
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
              id="sort-menu"
              aria-haspopup="listbox"
              aria-expanded={sortMenuOpen}
              type="button"
              onClick={() => setSortMenuOpen((open) => !open)}
              onBlur={() => setTimeout(() => setSortMenuOpen(false), 100)}
            >
                <span className="font-semibold text-gray-700">Sort by:</span>
                <span className="ml-1 text-indigo-700 font-bold capitalize">{sort === 'date' ? 'Date' : 'Score'}</span>
              {sortMenuOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {sortMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-2xl bg-white/90 backdrop-blur-sm ring-1 ring-black ring-opacity-5 z-10 animate-fade-in-up" role="listbox" aria-labelledby="sort-menu">
                <button
                    className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-indigo-50 transition-colors ${sort === 'date' ? 'bg-indigo-100 font-bold' : ''}`}
                  onClick={() => { setSort('date'); setPage(1); setSortMenuOpen(false); }}
                  role="option"
                  aria-selected={sort === 'date'}
                >
                  Date
                </button>
                <button
                    className={`w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-indigo-50 transition-colors ${sort === 'score' ? 'bg-indigo-100 font-bold' : ''}`}
                  onClick={() => { setSort('score'); setPage(1); setSortMenuOpen(false); }}
                  role="option"
                  aria-selected={sort === 'score'}
                >
                  Score
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => { setOrder(o => o === 'asc' ? 'desc' : 'asc'); setPage(1); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
            aria-label={order === 'desc' ? 'Sort Descending' : 'Sort Ascending'}
            type="button"
          >
            {order === 'desc' ? <SortDesc className="w-4 h-4 text-indigo-600" /> : <SortAsc className="w-4 h-4 text-indigo-600" />}
              <span className="text-sm font-semibold text-gray-600">{order === 'desc' ? 'Newest/Highest' : 'Oldest/Lowest'}</span>
          </button>
        </div>
      </div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Clear Essay History</h3>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Are you sure you want to delete all your essay history? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  disabled={clearing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="flex-1 py-3 rounded-xl font-semibold"
                >
                  {clearing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
            <span className="text-red-700 font-semibold">{error}</span>
          </div>
        )}
        
      {essays.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mb-6">
              <Frown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">No Essays Yet</h2>
            <p className="text-gray-600 text-lg mb-6">📝 You haven't submitted any essays yet. Start by using the Essay Generator or Essay Scoring tool.</p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => router.push('/dashboard/essay-generator')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Essay
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/score-essay')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-xl font-semibold"
              >
                Score New Essay
              </Button>
            </div>
              </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {essays.map((essay) => (
            <Card key={essay.id} className="shadow-xl border border-white/20 bg-white/80 backdrop-blur-sm flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    {essay.type === 'Rewritten' ? (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200">
                            <ArrowRightLeft className="w-4 h-4" /> Rewritten
                          </span>
                    ) : essay.type === 'Scored' ? (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200">
                            <BadgeCheck className="w-4 h-4" /> Scored
                          </span>
                    ) : essay.type === 'Paragraph Analysis' ? (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200">
                            <Search className="w-4 h-4" /> Analyzed
                          </span>
                    ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200">
                            <Sparkles className="w-4 h-4" /> Generated
                          </span>
                    )}
                  <span className="ml-auto text-xs text-gray-500">{formatDate(essay.submittedAt)}</span>
                </div>
                <CardTitle className="truncate" title={essay.topic}>{essay.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Score: </span>
                        {getScoreDisplay(essay)}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Feedback: </span>
                  <span className="text-gray-700">{essay.feedback.length > 80 ? essay.feedback.slice(0, 80) + '…' : essay.feedback}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 mt-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/dashboard/essay-history/feedback/${essay.id}`)} 
                            className="hover:bg-indigo-100 border-indigo-200 text-indigo-700 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            Feedback
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => router.push(`/dashboard/essay-history/rewrite/${essay.id}`)} 
                            className="hover:bg-pink-100 bg-pink-50 text-pink-700 rounded-lg px-3 py-2 text-sm font-semibold"
                          >
                            Rewrite
                          </Button>
              </CardFooter>
            </Card>
              ))}
                  </div>
      )}
        
      {essays.length > 0 && (
          <div className="flex justify-center mt-8 gap-4">
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-6 py-3 rounded-xl font-semibold"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              disabled={!hasMore && essays.length < take} 
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 rounded-xl font-semibold"
            >
              Next
            </Button>
        </div>
      )}
      </div>
    </div>
  );
} 