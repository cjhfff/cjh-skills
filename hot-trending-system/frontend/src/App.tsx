import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import ResultsList from './components/ResultsList';
import HistoryPanel from './components/HistoryPanel';
import { useSearch } from './hooks/useSearch';
import { useHistory } from './hooks/useHistory';
import { api } from './api';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { results, loading, error, cached, search } = useSearch();
  const { history, stats, loading: historyLoading, refetch } = useHistory();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // 检查后端状态
  useEffect(() => {
    api.health()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleSearch = async (keyword: string, type: 'news' | 'papers' | 'both') => {
    await search({ keyword, type });
    // 刷新历史
    refetch();
  };

  const handleSelectHistory = (keyword: string) => {
    handleSearch(keyword, 'both');
    // 移动端关闭侧边栏
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 状态提示 */}
        {backendStatus === 'offline' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <span>⚠️</span>
            <span>后端服务未连接，请确保后端正在运行</span>
          </div>
        )}
        
        {cached && results && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700 text-sm">
            <span>💾</span>
            <span>结果来自缓存</span>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧边栏 - 历史和统计 */}
          <aside className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6 space-y-4">
              <SearchBox onSearch={handleSearch} loading={loading} />
              <HistoryPanel
                history={history}
                stats={stats}
                loading={historyLoading}
                onSelectHistory={handleSelectHistory}
                onRefresh={refetch}
              />
            </div>
          </aside>

          {/* 主内容区 - 搜索结果 */}
          <section className="lg:col-span-3">
            {loading ? (
              // 加载状态
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-gray-100 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : results ? (
              // 搜索结果
              <ResultsList
                newsResults={results.news?.results || []}
                papersResults={results.papers?.results || []}
                intent={results.intent}
              />
            ) : (
              // 初始状态
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔥</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎使用热点追踪系统</h2>
                <p className="text-gray-500 mb-6">实时热点新闻 + 学术论文，一站式搜索</p>
                <div className="flex justify-center gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl mb-1">📰</div>
                    <div className="text-sm text-gray-600">热点新闻</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl mb-1">📚</div>
                    <div className="text-sm text-gray-600">学术论文</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
