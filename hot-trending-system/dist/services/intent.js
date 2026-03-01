"use strict";
// 意图识别服务 - 分析用户查询类型
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntent = detectIntent;
exports.extractKeywords = extractKeywords;
exports.suggestRelated = suggestRelated;
// 学术关键词模式
const ACADEMIC_PATTERNS = [
    /\b(paper|research|study|article|thesis|dissertation)\b/i,
    /\b(academic|scientific|journal|conference|proceedings)\b/i,
    /\b(arxiv|doi|semantic scholar|pubmed|ieee|acm)\b/i,
    /\b(citation|cited by|published in)\b/i,
    /\b(theory|method|algorithm|model|framework)\b/i,
    /\b(professor|phd|researcher|author)\b/i,
];
// 新闻热点关键词模式
const NEWS_PATTERNS = [
    /\b(news|latest|breaking|trending|hot)\b/i,
    /\b(update|announcement|revealed|released)\b/i,
    /\b(2024|2025|2026)\b/, // 年份通常是新闻
    /\b(today|yesterday|this week|recent)\b/i,
    /\b(covid|pandemic|election|war|climate)\b/i,
];
// 学术关键词列表
const ACADEMIC_KEYWORDS = [
    'machine learning', 'deep learning', 'neural network', 'ai', 'artificial intelligence',
    'algorithm', 'data science', 'blockchain', 'quantum', 'physics', 'biology', 'chemistry',
    'mathematics', 'statistics', 'engineering', 'computer science', 'software',
    'medicine', 'clinical', 'psychology', 'sociology', 'economics',
    'paper', 'research', 'thesis', 'dissertation', 'publication',
];
// 新闻关键词列表
const NEWS_KEYWORDS = [
    'news', 'update', 'breaking', 'trending', 'latest',
    'announcement', 'launch', 'release', 'event', 'election',
    'stock', 'market', 'economy', 'price', 'deal',
];
/**
 * 分析查询意图
 */
function detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    let academicScore = 0;
    let newsScore = 0;
    // 检查学术模式
    for (const pattern of ACADEMIC_PATTERNS) {
        if (pattern.test(lowerQuery)) {
            academicScore += 2;
        }
    }
    // 检查新闻模式
    for (const pattern of NEWS_PATTERNS) {
        if (pattern.test(lowerQuery)) {
            newsScore += 2;
        }
    }
    // 检查学术关键词
    for (const keyword of ACADEMIC_KEYWORDS) {
        if (lowerQuery.includes(keyword)) {
            academicScore += 1;
        }
    }
    // 检查新闻关键词
    for (const keyword of NEWS_KEYWORDS) {
        if (lowerQuery.includes(keyword)) {
            newsScore += 1;
        }
    }
    // 判断意图
    if (academicScore >= 3 && newsScore >= 3) {
        return 'both';
    }
    else if (academicScore > newsScore + 1) {
        return 'papers';
    }
    else if (newsScore > academicScore + 1) {
        return 'news';
    }
    else if (academicScore > 0 && newsScore === 0) {
        return 'papers';
    }
    else if (newsScore > 0 && academicScore === 0) {
        return 'news';
    }
    // 默认返回 both（综合搜索）
    return 'both';
}
/**
 * 提取查询关键词
 */
function extractKeywords(query) {
    // 移除停用词
    const stopWords = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
        'about', 'above', 'after', 'again', 'against', 'all', 'also', 'any',
        'because', 'before', 'below', 'between', 'both', 'each', 'few', 'more',
        'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than',
        'too', 'very', 'just', 'what', 'which', 'who', 'whom', 'this', 'that',
        'these', 'those', 'am', 'your', 'you', 'i', 'we', 'they', 'he', 'she',
        'it', 'its', 'my', 'our', 'their', 'his', 'her', 'news', 'latest',
        'trending', 'search', 'find', 'look', 'up', 'how', 'when', 'where', 'why',
    ];
    const words = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word));
    // 去除重复，保留顺序
    return [...new Set(words)];
}
/**
 * 建议相关搜索词
 */
function suggestRelated(query) {
    const keywords = extractKeywords(query);
    const suggestions = [];
    // 基于关键词扩展
    const expansions = {
        'ai': ['artificial intelligence', 'machine learning', 'deep learning'],
        'ml': ['machine learning', 'deep learning', 'neural network'],
        'nlp': ['natural language processing', 'transformer', 'llm'],
        'cv': ['computer vision', 'image recognition', 'object detection'],
        'crypto': ['cryptocurrency', 'bitcoin', 'blockchain'],
        'quantum': ['quantum computing', 'quantum physics', 'qubit'],
    };
    for (const keyword of keywords) {
        if (expansions[keyword]) {
            suggestions.push(...expansions[keyword]);
        }
    }
    return [...new Set(suggestions)].slice(0, 5);
}
