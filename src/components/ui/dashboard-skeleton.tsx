import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header Skeleton */}
      <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-7 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Message Skeleton */}
        <div className="lg:col-span-3 mb-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 shadow-lg p-8 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center bg-gray-300 rounded-full h-16 w-16 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-gray-300 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Left/Main Column Skeleton */}
        <section className="lg:col-span-2 space-y-8">
          {/* Essay Generation Card Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/4 animate-pulse"></div>
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-6 w-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <ul className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right/Sidebar Column Skeleton */}
        <aside className="space-y-8">
          {/* Generation Trends Chart Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-6 w-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
