#!/usr/bin/env node
/**
 * AI Dev Daily - 生成开发者实用 AI 日报
 * 关注：免费API、开源模型、实用工具、省钱资源
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  outputDir: process.env.AI_DAILY_OUTPUT || path.join(process.env.HOME || '.', '.openclaw/workspace/memory'),
};

// 实用资源数据库
const RESOURCES = {
  // 免费 API
  freeApis: [
    {
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      url: 'https://ai.google.dev/',
      freeTier: '1,500 requests/day',
      description: 'Google最新轻量级模型，支持多模态',
    },
    {
      name: 'OpenAI GPT-4o mini',
      provider: 'OpenAI',
      url: 'https://platform.openai.com/',
      freeTier: '新用户$5额度',
      description: 'OpenAI经济型模型，性价比高',
    },
    {
      name: 'Anthropic Claude Haiku',
      provider: 'Anthropic',
      url: 'https://claude.ai/',
      freeTier: '免费版可用',
      description: 'Anthropic轻量模型，响应快速',
    },
  ],

  // 实用工具
  devTools: [
    {
      name: 'Ollama',
      type: 'CLI工具',
      url: 'https://ollama.com/',
      install: 'curl -fsSL https://ollama.com/install.sh | sh',
      description: '本地运行大模型，一行命令部署Llama、Qwen等',
    },
    {
      name: 'Continue.dev',
      type: 'VSCode插件',
      url: 'https://continue.dev/',
      install: 'VSCode扩展商店搜索"Continue"',
      description: '开源AI编程助手，支持Claude/GPT/Ollama',
    },
    {
      name: 'ChatGPT-Next-Web',
      type: 'Web应用',
      url: 'https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web',
      install: 'Docker一键部署',
      description: '一键部署私人ChatGPT网页应用，支持多模型',
    },
  ],

  // 省钱资源
  savings: {
    student: [
      {
        name: 'GitHub Student Pack',
        url: 'https://education.github.com/pack',
        benefits: ['GitHub Copilot 免费', 'JetBrains 全家桶', 'AWS $100', 'Azure $100'],
        value: '$20K+',
      },
    ],
    alternatives: [
      { commercial: 'ChatGPT Plus ($20/月)', openSource: 'Ollama + 本地模型', savings: '$20/月' },
      { commercial: 'GitHub Copilot ($10/月)', openSource: 'Continue.dev + 免费API', savings: '$10/月' },
      { commercial: 'Midjourney ($10/月)', openSource: 'Stable Diffusion WebUI', savings: '$10/月' },
    ],
  },
};

// 格式化日期
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// 生成日报
function generateDailyReport() {
  const today = new Date();
  const dateStr = formatDate(today);
  const weekday = today.toLocaleDateString('zh-CN', { weekday: 'long' });

  let report = `# 🤖 AI Dev Daily | ${dateStr} ${weekday}

> 为开发者精选的实用 AI 资源 —— 免费 API、开源模型、实用工具、省钱攻略

---

`;

  // 免费 API
  report += `## 🆓 今日精选免费 API

`;
  RESOURCES.freeApis.forEach(api => {
    report += `### [${api.name}](${api.url})
- **提供商**: ${api.provider}
- **免费额度**: ${api.freeTier}
- **简介**: ${api.description}

`;
  });

  // 实用工具
  report += `## 🛠️ 本周推荐工具

`;
  RESOURCES.devTools.forEach(tool => {
    report += `### [${tool.name}](${tool.url}) (${tool.type})
- **简介**: ${tool.description}
- **安装**: \`${tool.install}\`

`;
  });

  // 省钱攻略
  report += `## 💰 今日省钱攻略

### 🎓 学生优惠

`;
  RESOURCES.savings.student.forEach(item => {
    report += `**[${item.name}](${item.url})** (价值 ${item.value})
- 权益: ${item.benefits.join('、')}

`;
  });

  report += `### 💸 免费替代方案

| 商业软件 | 开源替代 | 月省 |
|---------|---------|------|
`;
  RESOURCES.savings.alternatives.forEach(item => {
    report += `| ${item.commercial} | ${item.openSource} | ${item.savings} |
`;
  });

  // 每日提示
  report += `

## 💡 每日提示

### 🚀 今日命令行技巧
\`\`\`bash
# 快速测试各 AI API 延迟
for api in "openai" "anthropic" "google"; do
  echo -n "$(echo $api | cut -d/ -f3): "
  curl -o /dev/null -s -w "%{time_total}s\n" "https://api.$api.com/v1/models"
done
\`\`\`

### 🔧 今日 VSCode 技巧
- 选中代码 → \`Ctrl+K\` → 问 AI 问题
- \`Ctrl+Shift+P\` → ">Continue" → 打开 AI 助手

---

*生成时间: ${today.toLocaleString('zh-CN')} | 数据来源: GitHub, Product Hunt, 开发者社区*

> 💬 想要特定类型的资源？随时告诉我！
`;

  return report;
}

// 保存日报
function saveDailyReport() {
  const report = generateDailyReport();
  const today = new Date();
  const dateStr = formatDate(today);
  const filename = `ai-dev-daily-${dateStr}.md`;
  const filepath = path.join(CONFIG.outputDir, filename);

  // 确保目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(filepath, report, 'utf-8');

  // 同时输出到控制台
  console.log(report);

  return { filepath, filename, report };
}

// 主函数
function main() {
  try {
    const { filepath, filename } = saveDailyReport();

    console.error('✅ AI Dev Daily 生成成功！');
    console.error(`📄 文件: ${filepath}`);

    return 0;
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    return 1;
  }
}

// 运行
process.exit(main());
