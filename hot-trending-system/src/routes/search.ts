import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { smartSearch, searchByType, searchNews, searchPapers } from '../services/search';
import { detectIntent } from '../services/intent';
import cache, { makeCacheKey } from '../services/cache';
import db from '../db';

const router = Router();

// ============ Configuration Constants ============

/** Maximum allowed keyword length to prevent abuse */
const MAX_KEYWORD_LENGTH = 200;

/** Probability of running DELETE cleanup (10% chance) */
const CLEANUP_PROBABILITY = 0.1;

// ============ Rate Limiting Middleware ============

/**
 * Rate limiter for search endpoints
 * Limits to 30 requests per minute per IP
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============ Input Validation Helpers ============

/**
 * Validates and sanitizes the keyword parameter
 * @param keyword - The raw keyword from request query
 * @returns Validated keyword or null if invalid
 */
function validateKeyword(keyword: unknown): string | null {
  if (!keyword || typeof keyword !== 'string') {
    return null;
  }
  
  // Trim whitespace and check length
  const trimmed = keyword.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_KEYWORD_LENGTH) {
    return null;
  }
  
  return trimmed;
}

// ============ Database Cleanup (Probabilistic Execution) ============

/**
 * Cleans up old search history with probabilistic execution
 * Only runs 10% of the time to reduce database load
 */
function maybeCleanupHistory(): void {
  // Skip cleanup for non-production environments or random chance
  if (Math.random() > CLEANUP_PROBABILITY) {
    return;
  }
  
  try {
    const deleteStmt = db.prepare(`
      DELETE FROM search_history 
      WHERE created_at < datetime('now', '-3 days')
    `);
    deleteStmt.run();
    console.log('[DB] Cleanup executed: removed old search history');
  } catch (dbError) {
    console.error('[DB] Cleanup error:', dbError);
  }
}

// ============ Search Endpoints ============

// 智能搜索 - 根据意图自动选择搜索类型
router.get('/search', searchLimiter, async (req, res) => {
  const { keyword, type, force } = req.query;

  // Validate keyword with length limit
  const validatedKeyword = validateKeyword(keyword);
  if (!validatedKeyword) {
    return res.status(400).json({ 
      success: false,
      error: `Keyword is required and must be ${MAX_KEYWORD_LENGTH} characters or less` 
    });
  }

  try {
    let results;
    let intent;

    // 检查是否强制刷新
    if (force !== 'true') {
      // 尝试从缓存获取
      const cacheKey = makeCacheKey('search', validatedKeyword, (type as string) || 'auto');
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] search: ${validatedKeyword}`);
        return res.json({ success: true, data: cached, cached: true });
      }
    }

    // 如果显式指定了 type，使用指定类型
    if (type === 'news') {
      results = await searchByType(validatedKeyword, 'news');
      intent = 'news';
    } else if (type === 'papers') {
      results = await searchByType(validatedKeyword, 'papers');
      intent = 'papers';
    } else {
      // 使用智能搜索
      const smartResults = await smartSearch(validatedKeyword);
      results = smartResults;
      intent = smartResults.intent;
    }

    const responseData = {
      ...results,
      intent,
    };

    // 保存搜索历史
    try {
      const stmt = db.prepare(
        'INSERT INTO search_history (keyword, results) VALUES (?, ?)'
      );
      stmt.run(validatedKeyword, JSON.stringify(responseData));

      // Probabilistic cleanup - only runs 10% of the time
      maybeCleanupHistory();
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    // 缓存结果 (30分钟)
    if (force !== 'true') {
      const cacheKey = makeCacheKey('search', validatedKeyword, (type as string) || 'auto');
      cache.set(cacheKey, responseData, 1800000);
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    console.error('Search error:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// 热点新闻搜索
router.get('/news', searchLimiter, async (req, res) => {
  const { keyword } = req.query;

  // Validate keyword with length limit
  const validatedKeyword = validateKeyword(keyword);
  if (!validatedKeyword) {
    return res.status(400).json({ 
      success: false,
      error: `Keyword is required and must be ${MAX_KEYWORD_LENGTH} characters or less` 
    });
  }

  try {
    const results = await searchNews(validatedKeyword);
    res.json({ success: true, data: results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 学术论文搜索
router.get('/papers', searchLimiter, async (req, res) => {
  const { keyword } = req.query;

  // Validate keyword with length limit
  const validatedKeyword = validateKeyword(keyword);
  if (!validatedKeyword) {
    return res.status(400).json({ 
      success: false,
      error: `Keyword is required and must be ${MAX_KEYWORD_LENGTH} characters or less` 
    });
  }

  try {
    const results = await searchPapers(validatedKeyword);
    res.json({ success: true, data: results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 意图检测接口
router.get('/intent', (req, res) => {
  const { keyword } = req.query;

  // Validate keyword with length limit
  const validatedKeyword = validateKeyword(keyword);
  if (!validatedKeyword) {
    return res.status(400).json({ 
      success: false,
      error: `Keyword is required and must be ${MAX_KEYWORD_LENGTH} characters or less` 
    });
  }

  try {
    const intent = detectIntent(validatedKeyword);
    res.json({ success: true, data: { keyword: validatedKeyword, intent } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Intent detection failed';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 获取搜索历史
router.get('/history', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, keyword, created_at 
      FROM search_history 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    const history = stmt.all();
    res.json({ success: true, data: history });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history';
    console.error('History error:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 获取搜索统计
router.get('/stats', (req, res) => {
  try {
    // 统计搜索次数
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM search_history');
    const totalResult = totalStmt.get() as { total: number };

    // 热门搜索词
    const topKeywordsStmt = db.prepare(`
      SELECT keyword, COUNT(*) as count 
      FROM search_history 
      GROUP BY keyword 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const topKeywords = topKeywordsStmt.all();

    // 今日搜索
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as today 
      FROM search_history 
      WHERE date(created_at) = date('now')
    `);
    const todayResult = todayStmt.get() as { today: number };

    res.json({
      success: true,
      data: {
        totalSearches: totalResult.total,
        todaySearches: todayResult.today,
        topKeywords,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
    console.error('Stats error:', errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 获取单条搜索详情
router.get('/history/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM search_history WHERE id = ?');
    const result = stmt.get(id);
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const row = result as { results: string };
    let parsedResults: unknown;
    try {
      parsedResults = JSON.parse(row.results);
    } catch {
      parsedResults = null;
    }
    
    res.json({
      success: true,
      data: {
        ...result,
        results: parsedResults,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history item';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// 清除缓存
router.post('/cache/clear', (req, res) => {
  try {
    cache.clear();
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear cache';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
