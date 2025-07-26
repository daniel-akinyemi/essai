import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Lower sample rate for server-side
  // Disable session replay on the server
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,
  // Add server-side specific integrations
  integrations: [
    // The Prisma integration is now automatically included in @sentry/nextjs
  ],
});
