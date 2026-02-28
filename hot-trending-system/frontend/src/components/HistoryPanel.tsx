import React from 'react';
import type { HistoryItem, Stats } from '../api';

interface HistoryPanelProps {
  history: HistoryItem[];
  stats: Stats | null;
  loading: boolean;
  onSelectHistory: (keyword: string) => void;
  onRefresh: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  stats,
  loading,
  onSelectHistory,
  onRefresh,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 小于1小时
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分钟前`;
      }
      // 小于24小时
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
      }
      // 小于7天
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
      }
      
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      {/* 统计信息 */}
      {stats && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">📊 搜索统计</h3>
            <button
              onClick={onRefresh}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
              title="刷新"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">{stats.todaySearches}</p>
              <p className="text-xs text-gray-600">今日搜索</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{stats.totalSearches}</p>
              <p className="text-xs text-gray-600">总搜索量</p>
            </div>
          </div>

          {/* 热门关键词 */}
          {stats.topKeywords && stats.topKeywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">🔥 热门搜索</h4>
              <div className="flex flex-wrap gap-1.5">
                {stats.topKeywords.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectHistory(item.keyword)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition flex items-center gap-1"
                  >
                    <span>{item.keyword}</span>
                    <span className="text-gray-400">({item.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 搜索历史 */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">🕐 最近搜索</h3>
        
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">暂无搜索记录</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item.keyword)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-between group"
              >
                <span className="text-sm text-gray-700 truncate flex-1">{item.keyword}</span>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 ml-2">
                  {formatDate(item.created_at)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
