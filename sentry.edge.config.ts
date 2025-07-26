import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Lower sample rate for server-side
  // Disable session replay on the server
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,
  // Disable browser integrations on the server
  integrations: [],
});
