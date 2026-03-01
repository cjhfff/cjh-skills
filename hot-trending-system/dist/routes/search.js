"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_1 = require("../services/search");
const db_1 = __importDefault(require("../db"));
const intent_1 = require("../services/intent");
const router = (0, express_1.Router)();
// 常量定义
const MAX_KEYWORD_LENGTH = 200;
const REQUEST_LIMIT_PER_MINUTE = 30;
// 简单的内存限流器
const requestCounts = new Map();
function checkRateLimit(ip) {
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
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
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
        const intent = (0, intent_1.detectIntent)(keyword);
        let results = [];
        let responseData = {};
        if (intent === 'papers') {
            const searchResponse = await (0, search_1.searchPapers)(keyword);
            results = searchResponse.results;
            responseData = { type: 'papers', results };
        }
        else {
            const searchResponse = await (0, search_1.searchNews)(keyword);
            results = searchResponse.results;
            responseData = { type: 'news', results };
        }
        // 保存到数据库
        try {
            const insertStmt = db_1.default.prepare(`
        INSERT INTO search_history (keyword, results, type, intent, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
            insertStmt.run(keyword, JSON.stringify(results), intent, intent);
            // 概率清理旧数据（10% 概率执行）
            if (Math.random() < 0.1) {
                const deleteStmt = db_1.default.prepare(`
          DELETE FROM search_history WHERE created_at < datetime('now', '-7 days')
        `);
                deleteStmt.run();
            }
        }
        catch (dbError) {
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
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Search failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// 获取搜索历史
router.get('/history/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_1.default.prepare('SELECT * FROM search_history WHERE id = ?');
        const history = stmt.get(id);
        if (!history) {
            return res.status(404).json({ error: 'History not found' });
        }
        res.json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});
// 获取热门搜索
router.get('/trending', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const stmt = db_1.default.prepare(`
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
    }
    catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ error: 'Failed to get trending' });
    }
});
// 获取统计信息
router.get('/stats', (req, res) => {
    try {
        // 总搜索次数
        const totalStmt = db_1.default.prepare('SELECT COUNT(*) as total FROM search_history');
        const total = totalStmt.get();
        // 今日搜索
        const todayStmt = db_1.default.prepare(`
      SELECT COUNT(*) as today FROM search_history
      WHERE date(created_at) = date('now')
    `);
        const today = todayStmt.get();
        // 本周搜索
        const weekStmt = db_1.default.prepare(`
      SELECT COUNT(*) as week FROM search_history
      WHERE created_at >= datetime('now', '-7 days')
    `);
        const week = weekStmt.get();
        // 热门意图
        const intentStmt = db_1.default.prepare(`
      SELECT intent, COUNT(*) as count
      FROM search_history
      GROUP BY intent
      ORDER BY count DESC
    `);
        const intents = intentStmt.all();
        res.json({
            success: true,
            data: {
                total: total.total,
                today: today.today,
                week: week.week,
                intents,
            },
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
exports.default = router;
