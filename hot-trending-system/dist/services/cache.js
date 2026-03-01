"use strict";
/**
 * 内存缓存服务 - 带容量限制
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCacheKey = makeCacheKey;
class Cache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        // 每 60 秒清理过期条目
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    /**
     * 获取缓存值
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        // 检查是否过期
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }
    /**
     * 设置缓存值
     * @param key 缓存键
     * @param value 缓存值
     * @param ttl 过期时间（毫秒），默认 30 分钟
     */
    set(key, value, ttl = 1800000) {
        // 如果达到容量且是新增 key，删除最旧的条目
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        const entry = {
            value,
            expiresAt: Date.now() + ttl,
        };
        this.cache.set(key, entry);
    }
    /**
     * 删除缓存值
     */
    delete(key) {
        this.cache.delete(key);
    }
    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
    }
    /**
     * 获取当前缓存大小
     */
    size() {
        return this.cache.size;
    }
    /**
     * 清理过期条目
     */
    cleanup() {
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
    destroy() {
        clearInterval(this.cleanupInterval);
        this.clear();
    }
}
// 创建单例实例
const cache = new Cache(1000);
// 辅助函数：创建缓存键
function makeCacheKey(type, keyword) {
    return `${type}:${keyword.toLowerCase().trim()}`;
}
exports.default = cache;
