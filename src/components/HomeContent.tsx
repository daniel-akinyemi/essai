import Image from "next/image";
import Link from "next/link";

export default function HomeContent() {
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
                <span className="relative z-10">Get Started for Free</span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-gray-700 font-medium hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 group"
              >
                Learn More
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powerful Features for Better Writing
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to improve your writing in one place
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI-Powered Feedback",
                description: "Get instant, detailed feedback on your writing from advanced AI models.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: "Detailed Scoring",
                description: "Receive comprehensive scores across multiple writing dimensions.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Grammar & Style",
                description: "Improve your grammar, style, and clarity with targeted suggestions.",
                icon: (
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to improve your writing?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Join thousands of writers who have already enhanced their skills with Essai.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-gray-50 transition-colors duration-200 md:py-4 md:text-lg md:px-10"
            >
              Start Writing for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
