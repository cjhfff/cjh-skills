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

/** arXiv API 响应接口 */
export interface ArxivResponse {
  feed?: {
    entry?: ArxivEntry | ArxivEntry[];
  };
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

/** OpenAlex API 响应接口 */
export interface OpenAlexResponse {
  results?: OpenAlexWork[];
  meta?: {
    count?: number;
  };
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

/** NewsAPI API 响应接口 */
export interface NewsApiResponse {
  status?: string;
  totalResults?: number;
  articles?: NewsApiArticle[];
}

/** Fallback API 接口 */
interface FallbackApi {
  name: string;
  search: (keyword: string) => Promise<SearchResult[]>;
}

/** Fallback API 响应接口 */
interface FallbackResponse {
  data: {
    data: SemanticScholarPaper[];
  };
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
    const response = await axios.post<SerperResponse>(
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
const FALLBACK_APIS: FallbackApi[] = [
  {
    name: 'arXiv',
    search: async (keyword: string): Promise<SearchResult[]> => {
      const response = await axios.get<ArxivResponse>(
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
      const entriesArray: ArxivEntry[] = Array.isArray(entries) ? entries : [entries];
      
      const results: SearchResult[] = entriesArray
        .filter((e: ArxivEntry | null | undefined): e is ArxivEntry => e !== undefined && e !== null)
        .map((item: ArxivEntry) => ({
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

export async function searchPapers(keyword: string): Promise<SearchResponse> {
  // 检查缓存
  const cacheKey = makeCacheKey('papers', keyword);
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] papers: ${keyword}`);
    return cached;
  }

  try {
    const results = await fetchWithRetry(() => fetchSemanticScholar(keyword));
    
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
    console.error('All paper search methods failed:', error);
    throw error;
  }
}

// Semantic Scholar API 调用
async function fetchSemanticScholar(keyword: string): Promise<SearchResult[]> {
  await throttleSemantic();
  
  const response = await axios.get<FallbackResponse>(
    'https://api.semanticscholar.org/graph/v1/paper/search',
    {
      params: {
        query: keyword,
        fields: 'title,abstract,year,authors,citationCount,externalIds',
        limit: 20,
      },
      timeout: 15000,
    }
  );
  
  return (response.data?.data || []).map((paper: SemanticScholarPaper) => ({
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
export async function smartSearch(keyword: string): Promise<SearchResponse & { intent: SearchIntent }> {
  const intent = detectIntent(keyword);
  
  if (intent === 'papers') {
    const results = await searchPapers(keyword);
    return { ...results, intent };
  } else {
    // 默认搜索新闻
    const results = await searchNews(keyword);
    return { ...results, intent };
  }
}

// 根据类型搜索
export async function searchByType(keyword: string, type: 'news' | 'papers'): Promise<SearchResponse> {
  if (type === 'papers') {
    return searchPapers(keyword);
  }
  return searchNews(keyword);
}
