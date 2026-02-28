import React, { useState, useEffect } from 'react';
import { SearchResult } from '../../services/search';
import { formatDate } from '../../utils/date';
import './ResultCard.css';

interface ResultCardProps {
  result: SearchResult;
  type: 'news' | 'papers';
  onSave?: (result: SearchResult) => void;
}

/** 收藏项接口 */
interface FavoriteItem extends SearchResult {
  type: 'news' | 'papers';
  savedAt: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, type, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);

  useEffect(() => {
    // 检查是否已收藏
    const checkFavorite = () => {
      try {
        const favoritesJson = localStorage.getItem('favorites');
        if (!favoritesJson) {
          setIsSaved(false);
          return;
        }

        let favorites: FavoriteItem[] = [];
        try {
          const parsed = JSON.parse(favoritesJson);
          if (Array.isArray(parsed)) {
            favorites = parsed;
          }
        } catch (parseError) {
          console.warn('Failed to parse favorites, resetting:', parseError);
          localStorage.setItem('favorites', '[]');
          setIsSaved(false);
          return;
        }

        const exists = favorites.some((f: FavoriteItem) => f.url === result.url);
        setIsSaved(exists);
      } catch (error) {
        console.error('Error checking favorite:', error);
        setIsSaved(false);
      }
    };

    checkFavorite();
  }, [result.url]);

  const handleSave = () => {
    try {
      const favoritesJson = localStorage.getItem('favorites') || '[]';
      let favorites: FavoriteItem[] = [];
      
      try {
        const parsed = JSON.parse(favoritesJson);
        if (Array.isArray(parsed)) {
          favorites = parsed;
        }
      } catch (parseError) {
        console.warn('Failed to parse favorites, resetting:', parseError);
        favorites = [];
      }

      if (isSaved) {
        // 取消收藏
        const newFavorites = favorites.filter((f: FavoriteItem) => f.url !== result.url);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsSaved(false);
      } else {
        // 添加收藏
        const newFavorite: FavoriteItem = {
          ...result,
          type,
          savedAt: new Date().toISOString(),
        };
        favorites.push(newFavorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setIsSaved(true);
      }

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const renderPaperMeta = () => {
    if (type !== 'papers') return null;

    return (
      <div className="result-card__meta">
        {result.publishedDate && (
          <span className="result-card__date">
            {formatDate(result.publishedDate)}
          </span>
        )}
        {result.citationCount !== undefined && (
          <span className="result-card__citations">
            被引 {result.citationCount} 次
          </span>
        )}
      </div>
    );
  };

  const renderNewsMeta = () => {
    if (type !== 'news') return null;

    return (
      <div className="result-card__meta">
        {result.publishedDate && (
          <span className="result-card__date">
            {formatDate(result.publishedDate)}
          </span>
        )}
        {result.source && (
          <span className="result-card__source">
            {result.source}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`result-card result-card--${type}`}>
      <div className="result-card__header">
        <h3 className="result-card__title">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="result-card__link"
          >
            {result.title}
          </a>
        </h3>
        <button
          className={`result-card__save-btn ${isSaved ? 'result-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          title={isSaved ? '取消收藏' : '收藏'}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>

      <div className="result-card__content">
        <p className="result-card__snippet">
          {result.snippet}
        </p>

        {type === 'papers' && result.snippet && (
          <div className="result-card__abstract-toggle">
            <button
              className="result-card__toggle-btn"
              onClick={() => setShowAbstract(!showAbstract)}
            >
              {showAbstract ? '隐藏摘要' : '显示摘要'}
            </button>
            {showAbstract && (
              <div className="result-card__abstract">
                {result.snippet}
              </div>
            )}
          </div>
        )}
      </div>

      {type === 'papers' ? renderPaperMeta() : renderNewsMeta()}
    </div>
  );
};

export default ResultCard;
