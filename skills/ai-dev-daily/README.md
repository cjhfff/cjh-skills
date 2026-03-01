# AI Dev Daily - 开发者实用 AI 日报

为开发者提供的实用 AI 资源日报，关注免费 API、开源模型、实用工具和省钱资源。

## ✅ 安装完成

```bash
# 生成日报并显示
ai-dev-daily

# 生成并保存到文件
ai-dev-daily --save

# 查看生成的文件
ls ~/.openclaw/workspace/memory/ai-dev-daily-*.md
```

## 📋 日报内容

### 1. 🆓 免费 API / 开源模型
- 新发布的免费 API
- 开源模型更新
- 免费额度变化

### 2. 🛠️ 实用工具 / 插件
- VSCode 插件
- CLI 工具
- 开发效率工具

### 3. 💰 省钱资源
- 免费替代方案
- 学生/开发者优惠
- 开源替代商业软件

### 4. 📚 实用教程
- 快速上手指南
- 最佳实践
- 常见问题解决

## 📁 文件结构

```
~/.openclaw/workspace/skills/ai-dev-daily/
├── ai-dev-daily              # 主命令脚本
├── SKILL.md                  # Skill 说明文档
├── README.md                 # 本文件
└── scripts/
    └── generate-daily.js     # 日报生成脚本
```

## ⚙️ 配置定时任务（可选）

编辑 `~/.openclaw/openclaw.json` 添加定时任务：

```json
{
  "cron": {
    "ai-dev-daily": {
      "schedule": "0 9 * * *",
      "command": "ai-dev-daily --save",
      "enabled": true
    }
  }
}
```

这会在每天早上 9 点自动生成日报。

## 📝 更新日志

- **2026-03-01**: 初始版本，完成基础框架和静态数据

## 💬 反馈

有任何建议或想要特定类型的资源？随时告诉我！
