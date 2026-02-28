# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics - the stuff that's unique to your setup.

## ⚠️ 绝对禁止的操作

**永远不要执行以下命令，否则会导致你自己掉线（Gateway 被杀死 = 你死了）：**

- `kill` / `kill -9` / `kill -15` 针对 Gateway 主进程（即你自身运行的进程）
- `openclaw gateway stop` / `openclaw gateway restart`
- 任何会向 Gateway PID 发送 SIGTERM/SIGKILL 的操作
- `killall node`（会误杀 Gateway）

**如果需要停止子代理/子进程：** 只 kill 特定的子进程 PID，**绝对不要 kill 父进程或 Gateway 进程**。先用 `ps aux | grep openclaw` 确认 PID，区分 gateway 主进程和子进程，只 kill 子进程。

## Claude Code 调用（高级工具）

本机安装了 Claude Code CLI，有两个别名：

| 别名 | 用途 | 模型 |
|------|------|------|
| `claude-ark` | 写代码、编程任务 | 火山豆包 `doubao-seed-2.0-code` |
| `claude-official` | 高级决策、复杂推理、不会的问题 | Anthropic Claude Opus 4.6 |

**使用规则**：
- **写代码** → 用 `claude-ark`（省额度，代码能力强）
- **高级决策 / 不会的问题** → 用 `claude-official`（最高质量推理）

**调用方式：**
```bash
claude-ark -p "你的问题" --max-turns 1 --no-session-persistence
claude-official -p "你的问题" --max-turns 1 --no-session-persistence
```

**配置**：
- `claude-ark` API: `https://ark.cn-beijing.volces.com/api/coding`，模型: `doubao-seed-2.0-code`
- `claude-official`: 官方 Anthropic Claude Code CLI，模型: Opus 4.6

**注意事项：**
- **必须加 `--max-turns 1`**：防止 Claude 进入多轮交互，避免运行时间过长被 exec 超时 kill
- **必须加 `--no-session-persistence`**：不保存会话，避免磁盘堆积
- **不要用于简单问题**：Claude Code 会消耗额度，只在你自己的模型（MiniMax/Gemini/Qwen）搞不定的复杂任务时才用
- **适合的场景**：复杂代码编写、深度分析、需要高质量推理的任务
- **不适合的场景**：日常聊天、简单查询、能用自己模型解决的事

**如果 exec 超时导致被 kill**：说明问题太复杂，把问题拆小再调用。

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

### Weather

- Default location: "Shanghai" (中国上海)
- Units: Metric (°C)

## Browser Automation - 富文本输入

**重要技术发现 (2026-02-02):**

GitHub Copilot、Notion 等现代富文本编辑器不能直接用 `element.value = "text"` 注入文本。

**必须使用：模拟键盘事件 (Simulate Keystrokes)**

```javascript
// ✅ 正确方式：点击 + 键盘模拟
element.click(); // 先聚焦
for (const char of text) {
  element.dispatchEvent(new KeyboardEvent('keydown', {
    key: char,
    code: `Key${char.toUpperCase()}`,
    bubbles: true
  }));
}
```

**失败方式：**
```javascript
// ❌ 直接设置值（对富文本框无效）
element.value = "text";
element.innerHTML = "text";
```

**原因：**
- React/Vue 等框架使用内部状态管理，不直接读取 DOM 值
- 富文本框使用 `<div contenteditable>` 而非 `<input>`
- 需要触发合成事件才能更新框架状态

详见 Skill: `skills/rich-text-input/`

### 高级 Hack: execCommand 剪贴板注入 (2026-02-02)

如果键盘模拟也失败，可以尝试 `execCommand('insertText')`：

```javascript
// ✅ execCommand 是绕过 React/Monaco 的终极武器
const input = document.querySelector('textarea') || document.querySelector('[contenteditable]');
input.focus();
document.execCommand('insertText', false, "要插入的文本");
```

**为什么这个能行？**
- 这是浏览器原生 API，优先级高于框架事件监听
- 相当于模拟"粘贴"操作
- GitHub Copilot、VS Code、Notion 都能突破

**触发词：**
- "让 Copilot 写个 [xxx] 功能"
- "Generate code for [xxx]"

详见 Skill: `skills/project_coder_copilot/`

---

## OpenClaw + Telegram 代理配置 (2026-02-08, 价值 ¥100+ 的教训)

**问题**：Telegram 通道访问 `api.telegram.org` 需走本机 HTTP 代理，否则出现 `fetch failed`。

### 核心发现

**LaunchAgent 自动启动有bug**：代理在 LaunchAgent 下不生效，必须**手动启动** Gateway。

### 正确启动命令

```bash
export OPENCLAW_GATEWAY_TOKEN=mytoken123
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
export OPENCLAW_UNDICI="/Users/yangyue/Library/pnpm/global/5/.pnpm/openclaw@2026.1.30_@napi-rs+canvas@0.1.89_@types+express@5.0.6_hono@4.11.7_node-llama-cpp@3.15.1_signal-polyfill@0.2.2/node_modules/undici"

/opt/homebrew/bin/node -r /Users/yangyue/.openclaw/scripts/proxy-agent.js \
  "/Users/yangyue/Library/pnpm/global/5/.pnpm/openclaw@2026.1.30_@napi-rs+canvas@0.1.89_@types+express@5.0.6_hono@4.11.7_node-llama-cpp@3.15.1_signal-polyfill@0.2.2/node_modules/openclaw/dist/index.js" \
  gateway --port 18789
```

### 关键点

1. **必须先开代理**（如 Clash 7897端口）
2. **必须手动在终端启动**，不要依赖 LaunchAgent
3. **必须加载 `proxy-agent.js` 脚本**
4. **OPENCLAW_UNDICI 路径会随版本变化**，遇到"找不到模块"需更新路径

### 验证方法

给 Telegram bot 发消息，能收到回复即表示正常。

### 注意事项

- `openclaw gateway install` 会重写 plist，当前手动配置会丢失
- 完整记录见：`~/Downloads/OPENCLAW_GATEWAY_TELEGRAM_代理与启动记录.md`

---

## 个人主页项目 Bug 记录 (2026-02-09)

**项目：** `/Volumes/cjh/workspave/html/个人主页/`

**Bug 描述：**
- 在编辑文章时，无法直接切换到另一个文章的界面
- 需要先保存或取消当前编辑，才能切换

**影响：**
- 用户体验不流畅
- 可能导致未保存的编辑内容丢失

**备注：**
- 已添加 Supabase 后端支持（api.js, supabase.js）
- 可能与前端状态管理或路由守卫有关

## Browser Automation - 与页面内AI助手（如GitHub Copilot）交互

**重要发现 (2026-02-04):**

与 GitHub Copilot Chat 这类页面内嵌的 AI 助手交互，需要一个标准化的多步流程。

**标准交互链路 (SOP):**

1.  **定位输入框 (`<textarea>` 或 `role="textbox"`)**: 使用 `snapshot` 找到输入框的 `ref`。
2.  **输入文本**: 使用 `browser.act({ kind: 'type', ref: '...', text: '...' })` 将用户的指令输入。
3.  **定位并点击发送按钮**:
    *   **注意**: 页面可能存在多个看似"发送"的按钮。需要通过快照仔细甄别。
    *   在 GitHub Copilot Chat 案例中，有两个按钮：`"Ask"` 和 `"Send now (enter)"`。
    *   **正确操作**: 必须点击最终的提交按钮，即 `"Send now (enter)"`。点击 `"Ask"` 可能只是激活UI，并不会发送消息。
4.  **等待并读取回复**:
    *   点击后，需要等待几秒钟让 AI 生成回复。
    *   再次执行 `browser.snapshot()` 获取更新后的页面内容。
    *   从新的快照中解析出 AI 的回复文本并呈现给用户。

**此流程可作为与其他网页内嵌聊天机器人交互的通用模板。**

---

## Web Search 能力配置 (2026-02-15)

**问题**：当前无法主动搜索网络，需要配置 MCP 服务器。

### 可用技能
1. **exa-web-search-free** - Exa MCP 服务器，无需 API key
2. **tavily** - Tavily API，需要 `TAVILY_API_KEY`

### 配置方法

**Exa（推荐，无需 API key）**:
```bash
# 检查是否已配置
mcporter list exa

# 添加 Exa MCP 服务器
mcporter config add exa https://mcp.exa.ai/mcp

# 使用搜索
mcporter call 'exa.web_search_exa(query: "Google WebM MCP", numResults: 5)'
```

**Tavily（需要 API key）**:
```bash
# 设置 API key
export TAVILY_API_KEY="your-key-from-tavily.com"

# 使用搜索
node /Users/yangyue/.openclaw/workspace/skills/tavily-search/scripts/search.mjs "query"
```

### 当前状态
- [ ] 未配置 Exa
- [ ] 未配置 Tavily（需要用户提供 API key）
- [ ] 需要测试验证

### 注意事项
- 需要 mcporter CLI 已安装
- Exa 无需 API key，推荐优先使用
- Tavily 需要注册 https://tavily.com 获取 key

---

## Claude Code 插件 (everything-claude-code)

已安装 everything-claude-code 插件集合，提供 13+ agents、48+ skills、32+ commands。

**常用命令：**
- `/plan "任务描述"` - 规划功能实现
- `/pm2` - 多服务管理
- `/security-scan` - 安全扫描（AgentShield）
- `/codex-setup` - 生成 Codex CLI 配置

---

