import React from 'react';
import type { SearchResult } from '../api';

/** 单个收藏项的结构 */
export interface FavoriteItem {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  source?: string;
  citationCount?: number;
  type: 'news' | 'papers';
  savedAt: string;
}

interface ResultCardProps {
  result: SearchResult;
  type: 'news' | 'papers';
  onSave?: (result: SearchResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, type, onSave }) => {
  const isNews = type === 'news';
  
  // 格式化日期
  const formatDate = (date?: string) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return date;
    }
  };

  // 处理收藏
  const handleSave = () => {
    if (onSave) {
      let favorites: FavoriteItem[] = [];
      
      // Safe JSON parsing with try-catch
      try {
        const stored = localStorage.getItem('favorites');
        if (stored) {
          favorites = JSON.parse(stored);
        }
      } catch (parseError) {
        console.error('Failed to parse favorites from localStorage:', parseError);
        // Reset to empty array if parsing fails
        favorites = [];
      }
      
      // Check if already favorited
      const exists = favorites.some((f: FavoriteItem) => f.url === result.url);
      
      if (!exists) {
        const newFavorite: FavoriteItem = {
          ...result,
          type,
          savedAt: new Date().toISOString(),
        };
        favorites.push(newFavorite);
        
        try {
          localStorage.setItem('favorites', JSON.stringify(favorites));
          onSave(result);
        } catch (saveError) {
          console.error('Failed to save favorite to localStorage:', saveError);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* 类型标签 */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              isNews 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {isNews ? '📰 热点' : '📚 论文'}
            </span>
            {result.publishedDate && (
              <span className="text-xs text-gray-500">
                {formatDate(result.publishedDate)}
              </span>
            )}
          </div>

          {/* 标题 */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600 transition-colors"
            >
              {result.title}
            </a>
          </h3>

          {/* 摘要 */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {result.snippet || '暂无摘要'}
          </p>

          {/* 来源和引用 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">
              {result.source || (isNews ? '来源未知' : '作者未知')}
            </span>
            {!isNews && result.citationCount !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded">
                引用: {result.citationCount}
              </span>
            )}
          </div>
        </div>

        {/* 收藏按钮 */}
        {onSave && (
          <button
            onClick={handleSave}
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            title="收藏"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
