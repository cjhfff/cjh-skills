// 内存缓存服务 - 带 TTL 支持和 LRU  eviction

interface CacheEntry<T> {
  value: T;
  expiry: number;
  /** Last access timestamp for LRU tracking */
  lastAccessed: number;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  /** Maximum number of entries allowed in cache */
  maxSize: 1000,
  /** Default TTL in milliseconds (1 hour) */
  defaultTTL: 3600000,
  /** Cleanup interval in milliseconds (1 minute) */
  cleanupInterval: 60000,
};

class CacheService {
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;
  private maxSize: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(defaultTTL: number = CACHE_CONFIG.defaultTTL, maxSize: number = CACHE_CONFIG.maxSize) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    
    // 定期清理过期缓存和 LRU eviction
    setInterval(() => this.cleanup(), CACHE_CONFIG.cleanupInterval);
  }

  /**
   * Evicts oldest entries when cache exceeds maxSize (LRU-like behavior)
   * Removes approximately 10% of entries when full
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxSize) {
      // Sort by lastAccessed time and remove oldest 10%
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const evictCount = Math.ceil(this.maxSize * 0.1);
      const toEvict = entries.slice(0, evictCount);
      
      for (const [key] of toEvict) {
        this.cache.delete(key);
      }
      
      console.log(`[Cache] Evicted ${evictCount} old entries (LRU), current size: ${this.cache.size}`);
    }
  }

  // 设置缓存
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    
    // Evict old entries if needed before adding new one
    this.evictIfNeeded();
    
    this.cache.set(key, { 
      value, 
      expiry,
      lastAccessed: Date.now(),
    });
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    // Update last accessed time for LRU tracking
    entry.lastAccessed = Date.now();
    this.hitCount++;
    
    return entry.value as T;
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 检查缓存是否存在
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`[Cache] Cleaned up ${removedCount} expired entries`);
    }
  }

  // 获取缓存统计
  getStats(): { 
    size: number; 
    hits: number; 
    misses: number;
    hitRate: number;
    maxSize: number;
  } {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    
    return { 
      size: this.cache.size, 
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      maxSize: this.maxSize,
    };
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log('[Cache] All entries cleared');
  }
}

// 导出单例
const cache = new CacheService(CACHE_CONFIG.defaultTTL, CACHE_CONFIG.maxSize);
export default cache;

// 辅助函数：生成缓存 key
export function makeCacheKey(prefix: string, ...args: string[]): string {
  return `${prefix}:${args.join(':')}`;
}
