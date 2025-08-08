import { Skeleton } from "./skeleton";

export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="h-12 w-3/4 bg-gray-100 rounded-lg mb-6 mx-auto lg:mx-0"></div>
              <div className="h-4 w-5/6 bg-gray-100 rounded mb-4 mx-auto lg:mx-0"></div>
              <div className="h-4 w-4/6 bg-gray-100 rounded mb-8 mx-auto lg:mx-0"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <div className="h-12 w-32 bg-blue-100 rounded-lg"></div>
                <div className="h-12 w-32 bg-white border border-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6">
              <div className="aspect-w-10 aspect-h-6 rounded-lg bg-gray-100"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-100 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-3/4 max-w-2xl bg-gray-100 rounded mx-auto mb-12"></div>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-white mx-auto">
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="mt-4">
                        <div className="h-5 w-3/4 bg-gray-100 rounded mx-auto"></div>
                        <div className="mt-2 h-3 w-5/6 bg-gray-100 rounded mx-auto"></div>
                        <div className="mt-2 h-3 w-2/3 bg-gray-100 rounded mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section Skeleton */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <div className="h-10 w-3/4 max-w-md bg-gray-100 rounded-lg mx-auto mb-6"></div>
          <div className="h-4 w-2/3 max-w-sm bg-gray-100 rounded mx-auto mb-8"></div>
          <div className="h-12 w-48 bg-blue-100 rounded-lg mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
