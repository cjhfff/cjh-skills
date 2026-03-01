/**
 * 内存缓存服务 - 带容量限制
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    // 每 60 秒清理过期条目
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * 获取缓存值
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒），默认 30 分钟
   */
  set<T>(key: string, value: T, ttl: number = 1800000): void {
    // 如果达到容量且是新增 key，删除最旧的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) { this.cache.delete(firstKey); }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * 删除缓存值
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取当前缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 销毁缓存实例（清理定时器）
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// 创建单例实例
const cache = new Cache(1000);

// 辅助函数：创建缓存键
export function makeCacheKey(type: string, keyword: string): string {
  return `${type}:${keyword.toLowerCase().trim()}`;
}

export default cache;
