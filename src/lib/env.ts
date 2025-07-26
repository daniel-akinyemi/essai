import { z } from 'zod';

// Define the shape of required environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),
  
  // Optional but recommended
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  
  // Sentry (optional but recommended for production)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  
  // Add other environment variables as needed
});

// Type for TypeScript type checking
type Env = z.infer<typeof envSchema>;

// Validate environment variables
const validateEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      
      console.error('❌ Invalid environment variables:\n', missingVars);
      
      if (process.env.NODE_ENV === 'production') {
        // In production, we want to fail fast if env vars are missing
        process.exit(1);
      } else {
        console.warn('⚠️  Running in development mode with missing/invalid environment variables');
      }
    } else {
      console.error('❌ Unexpected error validating environment variables:', error);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
    
    // Return a partial type in development to allow the app to start
    return {} as Env;
  }
};

// Export validated environment variables
export const env = validateEnv();

// Helper function to get environment variables with type safety
export function getEnvVar<T extends keyof Env>(key: T): Env[T] {
  const value = env[key];
  
  if (value === undefined && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

// Log environment status on startup
if (typeof window === 'undefined') {
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Running in production mode');
    
    // Check for common misconfigurations in production
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      console.warn('⚠️  Warning: NEXTAUTH_URL points to localhost in production');
    }
    
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.warn('⚠️  Warning: Sentry DSN not configured. Error tracking will not work.');
    }
  }
}
