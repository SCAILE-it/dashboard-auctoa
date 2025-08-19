/**
 * Simple request deduplication and caching utility
 * Prevents multiple identical API calls from happening simultaneously
 */

interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
  data?: any;
}

class RequestCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data or make new request
   */
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if still fresh
    if (cached && cached.data && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    // Return in-flight promise if request is already happening
    if (cached && cached.promise && !cached.data) {
      return cached.promise;
    }

    // Make new request
    const promise = fetcher().then(data => {
      // Update cache with successful result
      this.cache.set(key, {
        promise,
        timestamp: now,
        data
      });
      return data;
    }).catch(error => {
      // Remove failed request from cache
      this.cache.delete(key);
      throw error;
    });

    // Store in-flight promise
    this.cache.set(key, {
      promise,
      timestamp: now
    });

    return promise;
  }

  /**
   * Clear expired entries (garbage collection)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Global instance
export const requestCache = new RequestCache();

// Cleanup every 10 minutes
setInterval(() => requestCache.cleanup(), 10 * 60 * 1000);
