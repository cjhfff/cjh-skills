export type SearchIntent = 'news' | 'papers' | 'both';
/**
 * 分析查询意图
 */
export declare function detectIntent(query: string): SearchIntent;
/**
 * 提取查询关键词
 */
export declare function extractKeywords(query: string): string[];
/**
 * 建议相关搜索词
 */
export declare function suggestRelated(query: string): string[];
