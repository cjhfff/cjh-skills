/**
 * 内存缓存服务 - 带容量限制
 */
declare class Cache {
    private cache;
    private maxSize;
    private cleanupInterval;
    constructor(maxSize?: number);
    /**
     * 获取缓存值
     */
    get<T>(key: string): T | undefined;
    /**
     * 设置缓存值
     * @param key 缓存键
     * @param value 缓存值
     * @param ttl 过期时间（毫秒），默认 30 分钟
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * 删除缓存值
     */
    delete(key: string): void;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 获取当前缓存大小
     */
    size(): number;
    /**
     * 清理过期条目
     */
    private cleanup;
    /**
     * 销毁缓存实例（清理定时器）
     */
    destroy(): void;
}
declare const cache: Cache;
export declare function makeCacheKey(type: string, keyword: string): string;
export default cache;
