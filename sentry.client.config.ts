// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a page is visited.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  tracesSampleRate: 1.0,
  
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.yourdomain\.com\/api/
  ],
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Session tracking and instrumentation are automatically configured by @sentry/nextjs
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Disable performance monitoring in development
  enabled: process.env.NODE_ENV !== 'development',
  
  // Configure the release
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Configure the server name
  serverName: process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost',
});
