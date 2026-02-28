---
name: code-assistant
trigger: "代码助手" | "帮我写代码" | "代码补全"
description: 使用 OpenCode 和 Aider 提供智能代码辅助，包括代码生成、补全、版本管理和错误检测。
category: development
---

# Skill: Code Assistant

## 功能列表
1. **代码生成**：使用 OpenCode 快速生成代码片段
2. **代码补全**：实时补全代码并提供建议
3. **版本管理**：使用 Aider 简化 Git 操作
4. **错误检测**：自动检查代码中的潜在问题

## 使用方法
- 触发词：`代码助手` 或 `帮我写代码`
- 示例指令：
  - `帮我写一个Python函数来计算斐波那契数列`
  - `初始化Git仓库并提交更改`
  - `检查这段代码是否有问题`

## 工具调用
```json
{
  "tool": "exec",
  "command": "/Applications/OpenCode.app/Contents/MacOS/opencode-cli generate --language python --task \"fibonacci function\""
}
```

## 注意事项
1. 确保 OpenCode 和 Aider 已正确安装
2. 定期更新工具版本
3. 避免在敏感项目中使用自动化工具