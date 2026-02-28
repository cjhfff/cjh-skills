# 记忆档案 - 小热 (Xiaore)

## 创建时间
2026-03-01

## 重要技能与配置

### 1. Claude Ark Wrapper
**位置**: `~/.openclaw/workspace/skills/claude-ark-wrapper/`

**功能**: Volcengine 火山引擎方舟 Claude Code 包装脚本，支持 5 个国产模型动态切换。

**使用方式**:
```bash
claude-ark [model] [claude-args...]

# 可用模型
claude-ark kimi           # Kimi K2.5 - 通用对话
claude-ark kimi-thinking  # Kimi K2 Thinking - 深度推理
claude-ark deepseek       # DeepSeek V3.2 - 代码生成
claude-ark glm            # GLM 4.7 - 中文生成
claude-ark doubao         # 豆包 Seed Code - 代码生成 (默认)
```

**创建记录**: 2026-02-28 至 2026-03-01，解决别名配置和模型选择问题。

---

## 模型配置总览

### 可用模型 (11个)

| 提供商 | 模型 | 特长 | 上下文 |
|--------|------|------|--------|
| **MiniMax** | M2.5 / M2.1 | 超长上下文(20万)、代码生成 | 200K |
| **Volcengine** | Kimi K2.5 | 通用对话、中文理解 | 128K |
| **Volcengine** | Kimi K2 Thinking | 深度推理、数学逻辑 | 128K |
| **Volcengine** | DeepSeek V3.2 | 代码能力、技术文档 | 128K |
| **Volcengine** | GLM 4.7 | 中文生成、学术写作 | 128K |
| **Volcengine** | Doubao Seed Code | 代码生成、快速响应 | 128K |
| **Google** | Gemini 3 Flash | 多模态、图像理解 | 1M |
| **Google** | Gemini 2.5 Pro | 高端推理、复杂任务 | 1M |

### 模型选择策略

| 任务类型 | 推荐模型 | 原因 |
|----------|----------|------|
| **日常对话/中文** | Kimi K2.5 | 平衡好，中文强 |
| **代码生成** | DeepSeek V3.2 / Doubao | 代码能力突出 |
| **超长文本处理** | MiniMax M2.5 | 20万token上下文 |
| **推理/数学** | Kimi K2 Thinking | 带思考链 |
| **多模态/图像** | Gemini 3 Flash | 多模态能力 |
| **超长代码重构** | MiniMax M2.1 Coding | 超长上下文+代码 |
| **使用 claude-ark** | 5个国产模型 | 省额度，动态切换 |

---

## 工具别名规则 (根据 TOOLS.md)

| 别名 | 用途 | 模型 |
|------|------|------|
| `claude-ark` | 写代码、编程任务 | 火山5模型动态切换 |
| `claude-official` | 高级决策、不会的问题 | Anthropic Opus 4.6 |

**使用规则**：
- **写代码** → `claude-ark`（省额度，代码能力强）
- **高级决策 / 不会的问题** → `claude-official`（最高质量推理）

---

## 重要发现

### 1. claude-ark 工作原理
- **本质**：shell 别名 + 环境变量注入
- **关键**：强制禁用代理 (`env -u http_proxy`) 避免火山 API 冲突
- **模型切换**：通过 `ANTHROPIC_MODEL` 环境变量动态指定

### 2. 为什么之前调用失败
- **原因**：`exec` 每次是新 shell 会话，**不会自动加载 `~/.zshrc`**
- **解决**：使用 `source ~/.zshrc && claude-ark` 或完整路径调用

### 3. 创建独立脚本的意义
- 不依赖 shell 配置，**任何环境都能直接运行**
- 支持动态模型选择参数（`kimi`/`deepseek`/`glm`/`doubao`）
- 已加入 `~/.local/bin/`，**全局可用**

---

## 待办事项

- [ ] 使用 `claude-ark` 执行热点搜集系统代码审查
- [ ] 根据审查结果修复 Critical 和 High 优先级问题
- [ ] 验证前端 Dashboard 完整功能

---

*记录时间：2026-03-01*
*记录者：小热 (Xiaore)*
