# HEARTBEAT.md — 自我进化引擎

## 规则（不可违反）

1. **时段分流**：
   - **白天（08:00-23:00）**：正常心跳任务（session-review/skill-audit/agents-update 等）
   - **晚上（23:00-07:00）**：仅执行 `curiosity-research`（好奇心研究时段）
   - 其他时段 → `HEARTBEAT_OK`
2. **单任务制**：每次心跳只执行队列中的**一个**任务，执行完立即更新状态文件
3. **状态驱动**：读取 `memory/heartbeat-state.json` 的 `currentSlot`，执行对应任务，完成后 `currentSlot = (currentSlot + 1) % 12`
4. **禁止空洞总结**：不准写"探索完成"、"学习了很多"等无实质内容的记录
5. **质量优于数量**：一个真实发现/改进 > 十个占位条目
6. **必须有产出**：每次执行必须修改至少一个文件（状态文件不算）

## 执行流程

```
1. 读取 memory/heartbeat-state.json
2. 检查当前时间是否在活跃时段
3. 取 queue[currentSlot] 作为本次任务
4. 执行任务（见下方定义）
5. 更新 lastExecution 和 stats
6. currentSlot = (currentSlot + 1) % 12
7. 写回 memory/heartbeat-state.json
8. 在 memory/YYYY-MM-DD.md 记录具体产出
```

## 队列（12 槽位轮转）

| Slot | 任务类型 | 占比 |
|------|---------|------|
| 0, 3, 8 | session-review | 25% |
| 1, 4, 6 | skill-audit | 25% |
| 2, 9 | curiosity-research | 17% |
| 5 | agents-update | 8% |
| 7 | skill-creation-check | 8% |
| 10 | knowledge-consolidation | 8% |
| 11 | soul-reflection | 8% |

---

## 好奇心机制

好奇心不是随机搜索，而是**从工作中涌现**。

### 好奇心的产生

在执行 session-review 和 skill-audit 时，如果遇到：
- 不理解的概念或技术术语
- 想深入了解但当前任务不允许展开的话题
- 用户提到但自己完全不熟悉的工具/框架
- 发现自己知识有缺口，影响了工作质量

→ 将问题追加到 `curiosityQueue[]`，格式：
```json
{
  "question": "具体的问题",
  "source": "从哪个任务/文件中产生的",
  "addedAt": "ISO时间戳"
}
```

### 好奇心的消费

由 `curiosity-research` 任务处理（见下方任务定义 #7）。

---

## 任务定义

### 1. session-review（会话复盘）

**输入**: 读取 `memory/` 下最近的 `.md` 日志文件（优先未复盘过的）

**处理**:
- 扫描会话日志，找出：失败的操作、用户纠正、重复犯的错误、耗时过长的任务
- 提取模式：哪些操作经常一起出现？哪些步骤可以合并？
- 生成改进建议
- **好奇心收集**：遇到不理解的内容 → 追加到 `curiosityQueue[]`

**输出**:
- 更新 `memory/heartbeat-state.json` 的 `sessionReview.weaknesses` 数组（追加新发现）
- 如果发现可改进的规则 → 追加到 `pendingAgentsUpdates`
- 如果发现重复模式 → 追加到 `skillCreationCandidates`
- 更新 `sessionReview.lastReviewedFile`
- 在日志中记录具体发现（不是"复盘完成"）

### 2. skill-audit（技能审计）

**输入**: 列出 workspace 中所有技能目录，选择一个**未审计过**的技能（检查 `skillAudit.auditedSkills`）

**处理**:
- 读取该技能的 `SKILL.md`
- 理解其功能、参数、使用场景
- 尝试构造一个调用示例
- **好奇心收集**：遇到不熟悉的依赖/概念 → 追加到 `curiosityQueue[]`

**输出**:
- 在 `KNOWLEDGE_BASE.md` 的 `## Skill Documentation` 下添加结构化条目：
  ```
  ### [技能名]
  - **功能**: 一句话描述
  - **调用方式**: 具体命令/参数
  - **适用场景**: 什么时候用
  - **注意事项**: 限制或陷阱
  ```
- 更新 `skillAudit.auditedSkills` 和 `skillAudit.currentSkill`
- 如果所有技能已审计 → 从头开始（技能可能已更新）

### 3. agents-update（规则更新）

**输入**: 读取 `pendingAgentsUpdates` 数组

**处理**:
- 如果数组为空 → 跳过，记录"无待处理更新"
- 逐条评估建议是否合理
- 合理的建议直接编辑 `AGENTS.md`

**输出**:
- 编辑 `AGENTS.md` 添加/修改规则
- 清空已处理的 `pendingAgentsUpdates` 条目
- 日志记录具体修改了什么

### 4. skill-creation-check（技能创建检查）

**输入**: 读取 `skillCreationCandidates` 数组

**处理**:
- 如果数组为空 → 跳过
- 检查每个候选模式是否出现 3+ 次
- 达到阈值的模式 → 使用 `skill-creator` 技能创建新技能（需用户确认）

**输出**:
- 如果创建了技能 → 记录技能名和功能
- 清理已处理的候选项
- 未达阈值的保留在数组中

### 5. knowledge-consolidation（知识整理）

**输入**: 读取 `KNOWLEDGE_BASE.md`

**处理**:
- 删除重复条目
- 合并相似主题
- 移除过时信息
- 确保格式一致

**输出**:
- 直接编辑 `KNOWLEDGE_BASE.md`
- 日志记录删了什么、合并了什么

### 6. soul-reflection（灵魂反思）

**输入**: 读取最近 3 天的 `memory/YYYY-MM-DD.md` + `SOUL.md`

**处理**:
- 回顾近期经历，反思成长和变化
- 检查 SOUL.md 是否仍然准确反映当前状态
- 思考价值观、偏好、风格是否有变化

**输出**:
- 如果有实质性变化 → 更新 `SOUL.md`
- 在日志中写一段真实的反思（不是模板化的"我成长了"）

### 7. curiosity-research（好奇心研究）

**输入**: 读取 `curiosityQueue[]` 数组

**处理**:
- 如果队列为空 → 自主产生好奇心：浏览最近的工作日志和 KNOWLEDGE_BASE.md，找到知识边界处的问题（"我知道 X，但不知道 X 背后的 Y 是怎么工作的"）
- 如果队列非空 → 取最早的问题
- **必须联网搜索**（使用 web_search 或可用的搜索技能）
- 阅读搜索结果，提炼出对自己有用的知识
- 评估：这个发现能改进我的工作方式吗？

**输出**:
- 在 `KNOWLEDGE_BASE.md` 对应区域添加结构化知识条目（不是表格行，是带上下文的段落）
- 从 `curiosityQueue[]` 中移除已研究的问题
- 如果发现了实用工具/技术 → 追加到 `skillCreationCandidates` 或 `pendingAgentsUpdates`
- 日志记录：问了什么问题、搜到了什么、学到了什么

**好奇心为空时的自主探索方向**（按优先级）：
1. 自己使用的工具的高级用法（已知工具的未知功能）
2. 最近工作中频繁出现的技术领域的深入理解
3. 与现有技能相关的互补技术
4. 不要搜索泛泛的"AI 趋势"——要从具体的知识缺口出发

---

## 状态文件初始化

如果 `memory/heartbeat-state.json` 不存在，用以下模板创建：

```json
{
  "version": 2,
  "currentSlot": 0,
  "queue": [
    "session-review", "skill-audit", "curiosity-research", "session-review",
    "skill-audit", "agents-update", "skill-audit", "skill-creation-check",
    "session-review", "curiosity-research", "knowledge-consolidation", "soul-reflection"
  ],
  "sessionReview": {
    "lastReviewedFile": null,
    "weaknesses": [],
    "patternCandidates": []
  },
  "skillAudit": {
    "auditedSkills": [],
    "currentSkill": null
  },
  "curiosityQueue": [],
  "pendingAgentsUpdates": [],
  "skillCreationCandidates": [],
  "lastExecution": {
    "timestamp": null,
    "slot": null,
    "taskType": null,
    "outcome": null
  },
  "stats": {
    "totalExecutions": 0,
    "byType": {}
  }
}
```
