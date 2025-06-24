import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
} 