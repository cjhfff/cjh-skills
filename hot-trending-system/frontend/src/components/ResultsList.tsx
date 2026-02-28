import React from 'react';
import ResultCard from './ResultCard';
import type { SearchResult } from '../api';

interface ResultsListProps {
  newsResults: SearchResult[];
  papersResults: SearchResult[];
  intent?: 'news' | 'papers' | 'both';
}

export const ResultsList: React.FC<ResultsListProps> = ({ 
  newsResults, 
  papersResults,
  intent = 'both',
}) => {
  const handleSave = (result: SearchResult) => {
    // 可以在这里添加收藏成功的提示
    console.log('Saved:', result.title);
  };

  // 根据意图决定显示哪些结果
  const showNews = intent === 'both' || intent === 'news';
  const showPapers = intent === 'both' || intent === 'papers';

  if (newsResults.length === 0 && papersResults.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🔍</div>
        <p>暂无搜索结果</p>
        <p className="text-sm">请输入关键词开始搜索</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 热点新闻 */}
      {showNews && newsResults.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📰</span>
            <h2 className="text-xl font-bold text-gray-800">热点新闻</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {newsResults.length} 条
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {newsResults.slice(0, 10).map((result, index) => (
              <ResultCard
                key={`news-${index}`}
                result={result}
                type="news"
                onSave={handleSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* 学术论文 */}
      {showPapers && papersResults.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-gray-800">学术论文</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
              {papersResults.length} 篇
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {papersResults.slice(0, 10).map((result, index) => (
              <ResultCard
                key={`papers-${index}`}
                result={result}
                type="papers"
                onSave={handleSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* 空结果提示 */}
      {showNews && newsResults.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>没有找到相关热点新闻</p>
        </div>
      )}
      
      {showPapers && papersResults.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>没有找到相关学术论文</p>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
