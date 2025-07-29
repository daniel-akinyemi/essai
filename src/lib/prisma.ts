import { PrismaClient, Prisma } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure Prisma client with minimal logging
export const prisma = globalThis.prisma || new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Only enable query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    // You can optionally log queries in development if needed
    // console.log('Query: ' + e.query)
    // console.log('Params: ' + e.params)
    // console.log('Duration: ' + e.duration + 'ms')
  });
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}