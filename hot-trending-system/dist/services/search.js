"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNews = searchNews;
exports.searchPapers = searchPapers;
exports.smartSearch = smartSearch;
exports.searchByType = searchByType;
const axios_1 = __importStar(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cache_1 = __importStar(require("./cache"));
const intent_1 = require("./intent");
dotenv_1.default.config();
const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';
// ============ Serper 搜索 (热点新闻) ============
// Serper API 请求间隔控制
let lastSerperRequest = 0;
const SERPER_MIN_INTERVAL = 1000; // 1秒间隔
async function throttleSerper() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastSerperRequest;
    if (timeSinceLastRequest < SERPER_MIN_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, SERPER_MIN_INTERVAL - timeSinceLastRequest));
    }
    lastSerperRequest = Date.now();
}
async function searchNews(keyword) {
    // 检查缓存
    const cacheKey = (0, cache_1.makeCacheKey)('news', keyword);
    const cached = cache_1.default.get(cacheKey);
    if (cached) {
        console.log(`[Cache HIT] news: ${keyword}`);
        return cached;
    }
    await throttleSerper();
    try {
        const response = await axios_1.default.post(SERPER_API_URL, {
            q: keyword,
            num: 20,
            autocorrect: true,
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });
        const results = (response.data.organic || []).map((item) => ({
            title: item.title || '',
            url: item.link || item.url || '',
            snippet: item.snippet || '',
            publishedDate: item.date,
            source: item.source,
        }));
        const searchResponse = {
            results,
            query: keyword,
            timestamp: new Date().toISOString(),
            type: 'news',
        };
        // 缓存结果 (1小时)
        cache_1.default.set(cacheKey, searchResponse, 3600000);
        return searchResponse;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Serper search error:', errorMessage);
        throw error;
    }
}
const requestQueue = [];
let isProcessingQueue = false;
const SEMANTIC_MIN_INTERVAL = 3000; // 3秒间隔，避免触发 429
let lastSemanticRequest = 0;
// 重试配置
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // 初始延迟 2 秒
const BACKOFF_FACTOR = 2;
async function throttleSemantic() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastSemanticRequest;
    if (timeSinceLastRequest < SEMANTIC_MIN_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, SEMANTIC_MIN_INTERVAL - timeSinceLastRequest));
    }
    lastSemanticRequest = Date.now();
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// 带重试的请求函数
async function fetchWithRetry(fetchFn, retries = MAX_RETRIES, delay = INITIAL_DELAY) {
    try {
        return await fetchFn();
    }
    catch (error) {
        if (retries > 0 && isRateLimitError(error)) {
            console.log(`[Rate Limit] Retrying in ${delay}ms... (${retries} retries left)`);
            await sleep(delay);
            return fetchWithRetry(fetchFn, retries - 1, delay * BACKOFF_FACTOR);
        }
        throw error;
    }
}
// 判断是否是速率限制错误
function isRateLimitError(error) {
    if (error instanceof axios_1.AxiosError) {
        return error.response?.status === 429 ||
            error.message.includes('429') ||
            error.message.includes('rate limit') ||
            error.message.includes('Too Many Requests');
    }
    if (error instanceof Error) {
        return error.message.includes('429') ||
            error.message.includes('rate limit') ||
            error.message.includes('Too Many Requests');
    }
    return false;
}
// 备用学术 API
const FALLBACK_APIS = [
    {
        name: 'arXiv',
        search: async (keyword) => {
            const response = await axios_1.default.get('http://export.arxiv.org/api/query', {
                params: {
                    search_query: `all:${keyword}`,
                    max_results: 20,
                    sortBy: 'submittedDate',
                    sortOrder: 'descending',
                },
                timeout: 15000,
            });
            // 解析 XML 响应
            const entries = response.data.feed?.entry || [];
            const entriesArray = Array.isArray(entries) ? entries : [entries];
            const results = entriesArray
                .filter((e) => e !== undefined && e !== null)
                .map((item) => ({
                title: typeof item.title === 'object' ? (item.title._ || '') : (item.title || ''),
                url: typeof item.id === 'object' ? (item.id._ || '') : (item.id || ''),
                snippet: typeof item.summary === 'object' ? (item.summary._ || '') : (item.summary || ''),
                publishedDate: typeof item.published === 'object' ? (item.published._ || '') : (item.published || ''),
                source: 'arXiv',
            }));
            return results;
        },
    },
];
async function searchPapers(keyword) {
    // 检查缓存
    const cacheKey = (0, cache_1.makeCacheKey)('papers', keyword);
    const cached = cache_1.default.get(cacheKey);
    if (cached) {
        console.log(`[Cache HIT] papers: ${keyword}`);
        return cached;
    }
    try {
        const results = await fetchWithRetry(() => fetchSemanticScholar(keyword));
        const searchResponse = {
            results,
            query: keyword,
            timestamp: new Date().toISOString(),
            type: 'papers',
        };
        // 缓存结果 (1小时)
        cache_1.default.set(cacheKey, searchResponse, 3600000);
        return searchResponse;
    }
    catch (error) {
        console.error('All paper search methods failed:', error);
        throw error;
    }
}
// Semantic Scholar API 调用
async function fetchSemanticScholar(keyword) {
    await throttleSemantic();
    const response = await axios_1.default.get('https://api.semanticscholar.org/graph/v1/paper/search', {
        params: {
            query: keyword,
            fields: 'title,abstract,year,authors,citationCount,externalIds',
            limit: 20,
        },
        timeout: 15000,
    });
    return (response.data?.data || []).map((paper) => ({
        title: paper.title || '',
        url: paper.externalIds?.DOI
            ? `https://doi.org/${paper.externalIds.DOI}`
            : `https://www.semanticscholar.org/paper/${paper.paperId}`,
        snippet: paper.abstract || '',
        publishedDate: paper.year?.toString(),
        source: paper.authors?.map((a) => a.name).join(', ') || 'Unknown',
        citationCount: paper.citationCount,
    }));
}
// 智能搜索 - 自动检测意图并选择搜索类型
async function smartSearch(keyword) {
    const intent = (0, intent_1.detectIntent)(keyword);
    if (intent === 'papers') {
        const results = await searchPapers(keyword);
        return { ...results, intent };
    }
    else {
        // 默认搜索新闻
        const results = await searchNews(keyword);
        return { ...results, intent };
    }
}
// 根据类型搜索
async function searchByType(keyword, type) {
    if (type === 'papers') {
        return searchPapers(keyword);
    }
    return searchNews(keyword);
}
