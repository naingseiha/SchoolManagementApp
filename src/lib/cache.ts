/**
 * Simple in-memory cache with TTL (Time To Live)
 * Improves performance by caching API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get a value from the cache
   * Returns null if expired or not found
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get or fetch pattern - fetch data only if not cached
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss - fetch new data
    console.log(`🔄 Cache MISS: ${key} - Fetching...`);
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

// Create singleton instance
export const apiCache = new Cache();

// Clear expired entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    apiCache.clearExpired();
    console.log(`🧹 Cache cleanup: ${apiCache.size()} entries remaining`);
  }, 5 * 60 * 1000);
}

/**
 * Cache decorator for API functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    keyPrefix?: string;
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const keyPrefix = options?.keyPrefix || fn.name;
    const key = options?.keyGenerator
      ? `${keyPrefix}:${options.keyGenerator(...args)}`
      : `${keyPrefix}:${JSON.stringify(args)}`;

    return apiCache.getOrFetch(key, () => fn(...args), options?.ttl);
  }) as T;
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `${prefix}:${sortedParams}`;
}
