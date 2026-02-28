import axios from 'axios';

const API_BASE = '/api';

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

export interface SmartSearchResponse {
  news: SearchResponse;
  papers: SearchResponse;
  intent: 'news' | 'papers' | 'both';
}

export interface HistoryItem {
  id: number;
  keyword: string;
  created_at: string;
}

export interface Stats {
  totalSearches: number;
  todaySearches: number;
  topKeywords: Array<{ keyword: string; count: number }>;
}

export interface SearchParams {
  keyword: string;
  type?: 'news' | 'papers' | 'both';
  force?: boolean;
}

export const api = {
  // 智能搜索
  search: async (params: SearchParams): Promise<{ success: boolean; data: SmartSearchResponse; cached?: boolean }> => {
    const response = await axios.get(`${API_BASE}/search`, { params });
    return response.data;
  },

  // 热点新闻搜索
  searchNews: async (keyword: string): Promise<{ success: boolean; data: SearchResponse }> => {
    const response = await axios.get(`${API_BASE}/news`, { params: { keyword } });
    return response.data;
  },

  // 学术论文搜索
  searchPapers: async (keyword: string): Promise<{ success: boolean; data: SearchResponse }> => {
    const response = await axios.get(`${API_BASE}/papers`, { params: { keyword } });
    return response.data;
  },

  // 意图检测
  detectIntent: async (keyword: string): Promise<{ success: boolean; data: { keyword: string; intent: string } }> => {
    const response = await axios.get(`${API_BASE}/intent`, { params: { keyword } });
    return response.data;
  },

  // 获取搜索历史
  getHistory: async (): Promise<{ success: boolean; data: HistoryItem[] }> => {
    const response = await axios.get(`${API_BASE}/history`);
    return response.data;
  },

  // 获取搜索统计
  getStats: async (): Promise<{ success: boolean; data: Stats }> => {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  },

  // 获取单条历史详情
  getHistoryItem: async (id: number): Promise<{ success: boolean; data: any }> => {
    const response = await axios.get(`${API_BASE}/history/${id}`);
    return response.data;
  },

  // 清除缓存
  clearCache: async (): Promise<{ success: boolean }> => {
    const response = await axios.post(`${API_BASE}/cache/clear`);
    return response.data;
  },

  // 健康检查
  health: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await axios.get('/health');
    return response.data;
  },
};
