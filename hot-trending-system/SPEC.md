# 实时热点搜集系统 - 需求与架构设计

## 📊 需求分析

### 核心功能
1. **关键词搜索**：用户输入关键词，返回相关热点 + 学术论文
2. **智能路由**：自动识别搜索意图（热点新闻 vs 学术论文）
3. **数据聚合**：去重、排序、按类型分组
4. **历史记录**：保留3天搜索历史
5. **可视化展示**：搜索结果 Dashboard

### 用户场景
- 用户输入 "AI" → 返回 Google News 热点 + Semantic Scholar 论文
- 用户输入 "CRISPR 基因编辑" → 优先返回学术论文

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户输入层                                │
│              关键词输入 → 意图识别 → API 分发                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────┐                   ┌─────────────────────┐
│    热点搜索          │                   │    学术论文          │
│   (Serper.dev)      │                   │ (Semantic Scholar)  │
│  Google News         │                   │   + Fallback:       │
│                      │                   │   arXiv, OpenAlex   │
└─────────┬───────────┘                   └─────────┬───────────┘
          │                                         │
          ▼                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据处理层                                   │
│         数据清洗 → 去重 → 排序 → 分类 → 缓存                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      缓存层 (内存缓存 + SQLite)                  │
│              搜索结果缓存 (1小时) + 搜索历史 (3天)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 搜索策略

### 1. 热点搜索 (Serper.dev)
- **用途**：搜索各平台热点新闻
- **API**：Google News + 网页搜索
- **免费额度**：每月 1500 次
- **中文支持**：设置语言参数为中文
- **缓存**：1小时

### 2. 学术论文 (Semantic Scholar)
- **用途**：搜索专业论文
- **API**：免费 (有 rate limit)
- **返回**：标题、摘要、引用量、PDF链接
- **降级方案**：arXiv + OpenAlex 备用
- **重试机制**：指数退避 (2s → 4s → 8s)
- **缓存**：1小时

### 3. 智能路由 (Intent Detection)
- **学术关键词模式**：paper, research, study, algorithm, theory, etc.
- **新闻关键词模式**：news, latest, breaking, update, etc.
- **默认策略**：同时返回热点和论文

---

## 🛠️ 技术栈

| 组件 | 技术选型 | 备注 |
|------|---------|------|
| **搜索入口** | Serper.dev | 免费额度，支持 Google News，中文友好 |
| **学术搜索** | Semantic Scholar API | 免费 + Fallback: arXiv/OpenAlex |
| **数据库** | SQLite | 搜索历史存储 |
| **缓存** | In-Memory Cache | TTL 支持 |
| **Web 框架** | Express | API 服务 |
| **前端** | React + Vite + Tailwind | Dashboard |

---

## 📁 项目结构

```
hot-trending-system/
├── src/
│   ├── index.ts                 # Express 入口
│   ├── db/index.ts             # SQLite 连接
│   ├── routes/
│   │   └── search.ts          # API 路由
│   └── services/
│       ├── search.ts           # Serper + 论文搜索
│       ├── intent.ts           # 意图识别
│       └── cache.ts            # 内存缓存
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── api/               # API 客户端
│   │   ├── components/        # UI 组件
│   │   ├── hooks/             # React Hooks
│   │   └── App.tsx            # 主应用
│   └── package.json
├── package.json
├── tsconfig.json
└── .env                       # API keys
```

---

## 📋 API 接口

### 基础接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/search` | 智能搜索 (支持 type=news/papers/both) |
| GET | `/api/news` | 仅搜索热点新闻 |
| GET | `/api/papers` | 仅搜索学术论文 |
| GET | `/api/history` | 获取搜索历史 |
| GET | `/api/stats` | 获取搜索统计 |
| GET | `/api/intent` | 意图检测 |
| POST | `/api/cache/clear` | 清除缓存 |

### 请求示例

```bash
# 智能搜索 (自动识别意图)
curl "http://localhost:3000/api/search?keyword=AI"

# 仅搜索新闻
curl "http://localhost:3000/api/search?keyword=bitcoin&type=news"

# 仅搜索论文
curl "http://localhost:3000/api/search?keyword=machine+learning&type=papers"

# 强制刷新缓存
curl "http://localhost:3000/api/search?keyword=test&force=true"
```

---

## ⚙️ 环境变量

在 `.env` 文件中配置：

```
PORT=3000
SERPER_API_KEY=your_serper_api_key
```

---

## 🚀 运行指南

### 后端启动

```bash
cd hot-trending-system
npm install
npm run dev
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### 生产构建

```bash
# 后端
npm run build

# 前端
cd frontend
npm run build
```

---

## ✅ 实现状态

- [x] 项目初始化 (Node.js + TypeScript + Express)
- [x] SQLite 数据库搭建
- [x] Serper 集成
- [x] Semantic Scholar 集成 + 降级方案
- [x] 意图识别
- [x] 内存缓存
- [x] React + Vite 前端
- [x] 搜索统计

---

## 📝 更新日志

### 2026-02-28
- 添加 Semantic Scholar 速率限制重试机制 (指数退避)
- 添加 arXiv 和 OpenAlex 备用 API
- 实现意图识别 (intent.ts)
- 实现内存缓存 (cache.ts)
- 创建 React + Vite 前端
- 添加搜索统计 API
