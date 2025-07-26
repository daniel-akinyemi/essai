// Simple in-memory cache implementation
// In production, you might want to use Redis or a similar distributed cache

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function getCache(key: string): Promise<string | null> {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return entry.value;
}

export async function setCache(
  key: string, 
  value: string, 
  ttl: number = 60 // Default TTL: 60 seconds
): Promise<void> {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl * 1000,
  });}

export async function deleteCache(key: string): Promise<void> {
  cache.delete(key);
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes
