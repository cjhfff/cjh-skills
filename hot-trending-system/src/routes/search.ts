import { Router, Request, Response } from 'express';
import { searchNews, searchPapers, smartSearch, SearchResult } from '../services/search';
import cache, { makeCacheKey } from '../services/cache';
import db from '../db';
import { detectIntent } from '../services/intent';

const router = Router();

// 常量定义
const MAX_KEYWORD_LENGTH = 200;
const REQUEST_LIMIT_PER_MINUTE = 30;

// 简单的内存限流器
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    // 新周期
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + 60000 // 1分钟后重置
    });
    return true;
  }

  if (record.count >= REQUEST_LIMIT_PER_MINUTE) {
    return false;
  }

  record.count++;
  return true;
}

// 搜索路由
router.get('/search', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;

    // 输入验证
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (keyword.length > MAX_KEYWORD_LENGTH) {
      return res.status(400).json({ error: `Keyword too long (max ${MAX_KEYWORD_LENGTH} characters)` });
    }

    // 限流检查
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // 检测意图并搜索
    const intent = detectIntent(keyword);
    let results: SearchResult[] = [];
    let responseData: any = {};

    if (intent === 'papers') {
      const searchResponse = await searchPapers(keyword);
      results = searchResponse.results;
      responseData = { type: 'papers', results };
    } else {
      const searchResponse = await searchNews(keyword);
      results = searchResponse.results;
      responseData = { type: 'news', results };
    }

    // 保存到数据库
    try {
      const insertStmt = db.prepare(`
        INSERT INTO search_history (keyword, results, type, intent, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      insertStmt.run(keyword, JSON.stringify(results), intent, intent);

      // 概率清理旧数据（10% 概率执行）
      if (Math.random() < 0.1) {
        const deleteStmt = db.prepare(`
          DELETE FROM search_history WHERE created_at < datetime('now', '-7 days')
        `);
        deleteStmt.run();
      }
    } catch (dbError) {
      // 数据库错误不应影响搜索响应
      console.error('Database error:', dbError);
    }

    res.json({
      success: true,
      ...responseData,
      query: keyword,
      intent,
      total: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 获取搜索历史
router.get('/history/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM search_history WHERE id = ?');
    const history = stmt.get(id);

    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// 获取热门搜索
router.get('/trending', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const stmt = db.prepare(`
      SELECT keyword, COUNT(*) as count
      FROM search_history
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT ?
    `);
    
    const trending = stmt.all(limit);
    
    res.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to get trending' });
  }
});

// 获取统计信息
router.get('/stats', (req: Request, res: Response) => {
  try {
    // 总搜索次数
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM search_history');
    const totalResult = totalStmt.get() as { total: number };
    
    // 今日搜索
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as today FROM search_history
      WHERE date(created_at) = date('now')
    `);
    const todayResult = todayStmt.get() as { today: number };
    
    // 本周搜索
    const weekStmt = db.prepare(`
      SELECT COUNT(*) as week FROM search_history
      WHERE created_at >= datetime('now', '-7 days')
    `);
    const weekResult = weekStmt.get() as { week: number };
    
    // 热门意图
    const intentStmt = db.prepare(`
      SELECT intent, COUNT(*) as count
      FROM search_history
      GROUP BY intent
      ORDER BY count DESC
    `);
    const intents = intentStmt.all();
    
    res.json({
      success: true,
      data: {
        total: totalResult.total,
        today: todayResult.today,
        week: weekResult.week,
        intents,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
