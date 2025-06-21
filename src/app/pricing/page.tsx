export default function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for students getting started",
      features: [
        "5 essay evaluations per month",
        "Basic grammar checking",
        "Structure analysis",
        "24-hour support response time"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "12",
      description: "For serious students and educators",
      features: [
        "Unlimited essay evaluations",
        "Advanced grammar & style checking",
        "Plagiarism detection",
        "Custom rubric creation",
        "1-hour support response time",
        "Export to PDF"
      ],
      cta: "Start Pro Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Contact us",
      description: "Custom solutions for schools",
      features: [
        "Everything in Pro",
        "Custom API access",
        "Advanced analytics dashboard",
        "Dedicated account manager",
        "Custom integration support",
        "Training sessions"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 ${
                tier.highlighted
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-600"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <h2 className="text-2xl font-bold">{tier.name}</h2>
              <p className={`mt-4 ${tier.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
                {tier.description}
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold">
                  {typeof tier.price === "number" ? `$${tier.price}` : tier.price}
                </span>
                {typeof tier.price === "number" && (
                  <span className={tier.highlighted ? "text-indigo-100" : "text-gray-500"}>
                    /month
                  </span>
                )}
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      className={`h-5 w-5 ${
                        tier.highlighted ? "text-indigo-200" : "text-indigo-600"
                      }`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full py-3 px-6 rounded-lg font-medium ${
                  tier.highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } transition-colors`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 