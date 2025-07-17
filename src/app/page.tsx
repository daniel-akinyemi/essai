import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradient Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl translate-x-1/2" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Transform Your Writing
              </span>
              <br />
              <span className="text-gray-900">with AI-Powered Feedback</span>
            </h1>
            <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Essai helps writers improve their essays with AI-powered feedback, scoring, and analysis.
              Perfect for students, professionals, and anyone looking to enhance their writing skills.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                href="/auth/signup"
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium overflow-hidden hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <span className="relative">Get Started Free</span>
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white/50 hover:border-indigo-600 hover:text-indigo-600 transition-all backdrop-blur-sm hover:-translate-y-1"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-indigo-50/30 to-white/0 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything You Need to Excel
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comprehensive tools for every step of the writing process
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Essay Scoring",
                description: "Get instant, accurate scores based on multiple criteria using advanced AI algorithms.",
                icon: "✨"
              },
              {
                title: "Detailed Feedback",
                description: "Receive specific suggestions to improve grammar, structure, and content.",
                icon: "📝"
              },
              {
                title: "Writing Analytics",
                description: "Track progress over time with detailed performance metrics and insights.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/20 hover:-translate-y-1 animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="absolute inset-0 border-2 border-indigo-500/0 rounded-2xl group-hover:border-indigo-500/50 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-purple-50/30 to-white/0 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900">
              Powerful API Integration
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Integrate Essai's writing analysis capabilities directly into your applications
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">Simple Integration</h3>
                <p className="text-gray-600">
                  Get started quickly with our RESTful API. Analyze essays, get feedback, and track progress programmatically.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Comprehensive documentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Secure authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Rate limiting and usage monitoring</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/key"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  <span>Get Your API Key</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-gray-900 p-6 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-sm font-mono">
                <code className="text-indigo-300">
{`// Example API request
fetch('https://api.essai.com/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Your essay content",
    type: "analysis"
  })
})`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-white">
            Ready to Improve Your Writing?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Join thousands of students and educators who are already using Essai
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-block px-8 py-4 rounded-xl bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-900/20 hover:-translate-y-1"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
