import React, { useState, useCallback } from 'react';

interface SearchBoxProps {
  onSearch: (keyword: string, type: 'news' | 'papers' | 'both') => void;
  loading?: boolean;
}

type SearchType = 'news' | 'papers' | 'both';

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, loading }) => {
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('both');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && !loading) {
      onSearch(keyword.trim(), searchType);
    }
  }, [keyword, searchType, onSearch, loading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const quickSearches = [
    { label: 'AI', keyword: 'artificial intelligence' },
    { label: 'Bitcoin', keyword: 'bitcoin price' },
    { label: 'COVID', keyword: 'covid-19 latest' },
    { label: 'Climate', keyword: 'climate change 2024' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入搜索关键词..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-lg"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!keyword.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            搜索
          </button>
        </div>

        {/* 搜索类型选择 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center">搜索类型:</span>
          {[
            { value: 'both', label: '🔍 综合', color: 'from-orange-500 to-red-500' },
            { value: 'news', label: '📰 热点', color: 'from-blue-500 to-cyan-500' },
            { value: 'papers', label: '📚 论文', color: 'from-purple-500 to-pink-500' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSearchType(type.value as SearchType)}
              disabled={loading}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                searchType === type.value
                  ? `bg-gradient-to-r ${type.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 快捷搜索 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-500 self-center">快捷搜索:</span>
          {quickSearches.map((item) => (
            <button
              key={item.keyword}
              type="button"
              onClick={() => {
                setKeyword(item.keyword);
                onSearch(item.keyword, searchType);
              }}
              disabled={loading}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default SearchBox;
