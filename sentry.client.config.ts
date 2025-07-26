import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust this value in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay(),
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/api\.yourdomain\.com\/api/],
    }),
  ],
});
