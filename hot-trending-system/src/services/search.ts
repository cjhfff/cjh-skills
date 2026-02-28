import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import cache, { makeCacheKey } from './cache';
import { detectIntent, SearchIntent } from './intent';

dotenv.config();

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  source?: string;
  citationCount?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: string;
  type: 'news' | 'papers';
}

// ============ TypeScript Interfaces for External APIs ============

/** Serper API 响应中的 organic 项 */
export interface SerperOrganicItem {
  title?: string;
  link?: string;
  url?: string;
  snippet?: string;
  date?: string;
  source?: string;
  position?: number;
}

/** Semantic Scholar API 响应中的 paper 项 */
export interface SemanticScholarPaper {
  paperId?: string;
  title?: string;
  abstract?: string;
  year?: number;
  authors?: Array<{ name?: string; authorId?: string }>;
  citationCount?: number;
  url?: string;
  externalIds?: {
    DOI?: string;
    arXiv?: string;
    CorpusId?: string;
  };
}

/** arXiv API 响应中的 entry 项 (XML 解析后) */
export interface ArxivEntry {
  title?: { _?: string } | string;
  id?: { _?: string } | string;
  summary?: { _?: string } | string;
  published?: { _?: string } | string;
  author?: Array<{ name?: string }>;
}

/** OpenAlex API 响应中的 work 项 */
export interface OpenAlexWork {
  id?: string;
  doi?: string;
  display_name?: string;
  title?: string;
  publication_year?: number;
  abstract?: string;
  cited_by_count?: number;
  authorships?: Array<{
    author?: { display_name?: string };
  }>;
}

/** NewsAPI API 响应中的 article 项 */
export interface NewsApiArticle {
  source?: { id?: string; name?: string };
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  content?: string;
}

// ============ Serper 搜索 (热点新闻) ============

// Serper API 请求间隔控制
let lastSerperRequest = 0;
const SERPER_MIN_INTERVAL = 1000; // 1秒间隔

async function throttleSerper(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastSerperRequest;
  if (timeSinceLastRequest < SERPER_MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, SERPER_MIN_INTERVAL - timeSinceLastRequest));
  }
  lastSerperRequest = Date.now();
}

export async function searchNews(keyword: string): Promise<SearchResponse> {
  // 检查缓存
  const cacheKey = makeCacheKey('news', keyword);
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] news: ${keyword}`);
    return cached;
  }

  await throttleSerper();
  
  try {
    const response = await axios.post<{ organic: SerperOrganicItem[] }>(
      SERPER_API_URL,
      {
        q: keyword,
        num: 20,
        autocorrect: true,
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const results: SearchResult[] = (response.data.organic || []).map((item: SerperOrganicItem) => ({
      title: item.title || '',
      url: item.link || item.url || '',
      snippet: item.snippet || '',
      publishedDate: item.date,
      source: item.source,
    }));

    const searchResponse: SearchResponse = {
      results,
      query: keyword,
      timestamp: new Date().toISOString(),
      type: 'news',
    };

    // 缓存结果 (1小时)
    cache.set(cacheKey, searchResponse, 3600000);
    
    return searchResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Serper search error:', errorMessage);
    throw error;
  }
}

// ============ Semantic Scholar 搜索 (学术论文) - 带重试逻辑 ============

// 请求队列和速率限制
type QueueItem = () => Promise<SearchResult[]>;
const requestQueue: QueueItem[] = [];
let isProcessingQueue = false;
const SEMANTIC_MIN_INTERVAL = 3000; // 3秒间隔，避免触发 429
let lastSemanticRequest = 0;

// 重试配置
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // 初始延迟 2 秒
const BACKOFF_FACTOR = 2;

async function throttleSemantic(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastSemanticRequest;
  if (timeSinceLastRequest < SEMANTIC_MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, SEMANTIC_MIN_INTERVAL - timeSinceLastRequest));
  }
  lastSemanticRequest = Date.now();
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 带重试的请求函数
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_DELAY
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error: unknown) {
    if (retries > 0 && isRateLimitError(error)) {
      console.log(`[Rate Limit] Retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return fetchWithRetry(fetchFn, retries - 1, delay * BACKOFF_FACTOR);
    }
    throw error;
  }
}

// 判断是否是速率限制错误
function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError) {
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
    search: async (keyword: string): Promise<SearchResult[]> => {
      const response = await axios.get<{ feed?: { entry?: ArxivEntry | ArxivEntry[] } }>(
        'http://export.arxiv.org/api/query',
        {
          params: {
            search_query: `all:${keyword}`,
            max_results: 20,
            sortBy: 'submittedDate',
            sortOrder: 'descending',
          },
          timeout: 15000,
        }
      );
      
      // 解析 XML 响应
      const entries = response.data.feed?.entry || [];
      const entriesArray = Array.isArray(entries) ? entries : [entries];
      
      const results: SearchResult[] = entriesArray
        .filter((e): e is ArxivEntry => e !== undefined && e !== null)
        .map((item: ArxivEntry) => ({
          title: typeof item.title === 'object' ? (item.title._ || '') : (item.title || ''),
          url: typeof item.id === 'object' ? (item.id._ || item.id || '') : (item.id || ''),
          snippet: typeof item.summary === 'object' ? (item.summary._ || item.summary || '') : (item.summary || ''),
          publishedDate: typeof item.published === 'object' ? (item.published._ || item.published || '') : (item.published || ''),
          source: 'arXiv',
        }));
      
      return results;
    }
  },
  {
    name: 'OpenAlex',
    search: async (keyword: string): Promise<SearchResult[]> => {
      const response = await axios.get<{ results: OpenAlexWork[] }>(
        'https://api.openalex.org/works',
        {
          params: {
            search: keyword,
            per_page: 20,
            select: 'id,title,display_name,publication_year,abstract,authorships,cited_by_count,doi',
          },
          timeout: 15000,
        }
      );
      
      const results: SearchResult[] = (response.data.results || []).map((item: OpenAlexWork) => ({
        title: item.display_name || item.title || '',
        url: item.doi ? `https://doi.org/${item.doi}` : item.id || '',
        snippet: item.abstract ? item.abstract.substring(0, 300) : '',
        publishedDate: item.publication_year?.toString(),
        source: `Citations: ${item.cited_by_count || 0}`,
      }));
      
      return results;
    }
  },
];

export async function searchPapers(keyword: string): Promise<SearchResponse> {
  // 检查缓存
  const cacheKey = makeCacheKey('papers', keyword);
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] papers: ${keyword}`);
    return cached;
  }

  await throttleSemantic();

  // 尝试 Semantic Scholar
  try {
    const response = await fetchWithRetry<{ data: { data: SemanticScholarPaper[] } }>(async () => {
      return axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
        params: {
          query: keyword,
          limit: 20,
          fields: 'title,abstract,year,authors,citationCount,url,externalIds',
        },
        timeout: 15000,
      });
    });

    const results: SearchResult[] = (response.data.data || []).map((item: SemanticScholarPaper) => ({
      title: item.title || '',
      url: item.url || (item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : ''),
      snippet: item.abstract?.substring(0, 300) || '',
      publishedDate: item.year?.toString(),
      source: item.authors?.[0]?.name 
        ? `Authors: ${item.authors[0].name}${item.authors.length > 1 ? ` +${item.authors.length - 1}` : ''}` 
        : '',
      citationCount: item.citationCount,
    }));

    const searchResponse: SearchResponse = {
      results,
      query: keyword,
      timestamp: new Date().toISOString(),
      type: 'papers',
    };

    // 缓存结果 (1小时)
    cache.set(cacheKey, searchResponse, 3600000);
    
    return searchResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Semantic Scholar error:', errorMessage);
    
    // 尝试备用 API
    for (const fallback of FALLBACK_APIS) {
      try {
        console.log(`[Fallback] Trying ${fallback.name}...`);
        const results = await fallback.search(keyword);
        
        const searchResponse: SearchResponse = {
          results,
          query: keyword,
          timestamp: new Date().toISOString(),
          type: 'papers',
        };
        
        // 缓存备用结果 (30分钟)
        cache.set(cacheKey, searchResponse, 1800000);
        
        return searchResponse;
      } catch (fallbackError: unknown) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        console.error(`${fallback.name} error:`, fallbackMessage);
        continue;
      }
    }
    
    // 所有 API 都失败
    throw new Error('All academic search APIs failed. Please try again later.');
  }
}

// ============ 智能搜索 - 根据意图路由 ============

export async function smartSearch(keyword: string): Promise<{
  news: SearchResponse;
  papers: SearchResponse;
  intent: SearchIntent;
}> {
  // 检测意图
  const intent = detectIntent(keyword);
  console.log(`[Intent] "${keyword}" -> ${intent}`);

  // 根据意图决定搜索策略
  const promises: Promise<SearchResponse>[] = [];
  
  if (intent === 'news' || intent === 'both') {
    promises.push(
      searchNews(keyword).catch(() => ({
        results: [],
        query: keyword,
        timestamp: new Date().toISOString(),
        type: 'news' as const
      }))
    );
  }
  
  if (intent === 'papers' || intent === 'both') {
    promises.push(
      searchPapers(keyword).catch(() => ({
        results: [],
        query: keyword,
        timestamp: new Date().toISOString(),
        type: 'papers' as const
      }))
    );
  }

  const results = await Promise.all(promises);
  
  const news = intent === 'papers' 
    ? { results: [], query: keyword, timestamp: new Date().toISOString(), type: 'news' as const } 
    : results[0];
  const papers = intent === 'news' 
    ? { results: [], query: keyword, timestamp: new Date().toISOString(), type: 'papers' as const } 
    : results[intent === 'both' ? 1 : 0];

  return { news, papers, intent };
}

// ============ 显式类型搜索 (绕过意图检测) ============

export async function searchByType(
  keyword: string, 
  type: 'news' | 'papers'
): Promise<SearchResponse> {
  if (type === 'news') {
    return searchNews(keyword);
  } else {
    return searchPapers(keyword);
  }
}
