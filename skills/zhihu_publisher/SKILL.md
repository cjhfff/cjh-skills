# Zhihu_Publisher

**Category:** content-publishing
**Target:** host
**Trigger:** `发布知乎` | `发到知乎` | `知乎发布`

## Description

将言情短篇小说发布到知乎专栏，包含封面图选择、话题添加、创作声明设置。

## Workflow

### Step 1: 准备内容
从文件读取完整文章内容：
- 文件路径：`~/Desktop/婆婆跪求我别离婚_知乎文章.md`
- 或从 workspace 读取：`/Users/yangyue/.openclaw/workspace/romance_story_final.md`

### Step 2: 打开知乎编辑器
访问：https://zhuanlan.zhihu.com/write

### Step 3: 输入标题
标题：`婆婆跪求我别离婚，我笑着打开手机录音`

### Step 4: 输入正文
使用 JavaScript 注入完整内容：

```javascript
const content = `【完整文章内容】`;

const editors = document.querySelectorAll('[contenteditable]');
if (editors.length > 0) {
  editors[0].focus();
  document.execCommand('selectAll');
  document.execCommand('insertText', false, content);
}
```

### Step 5: 添加话题
选择话题：
- 言情小说
- 出轨
- 婚姻
- 复仇爽文

### Step 6: 添加封面
选择或上传封面图片

### Step 7: 发布文章
点击发布按钮

## Content Template

**文章结构：**
```
开头 → 发展 → 高潮 → 结尾 → 金句
```

**字数要求：** 1000-2000字

**话题标签：** 言情小说、出轨、婚姻、复仇、爽文

## Example

**触发词：**
```
发布知乎
发到知乎
知乎发布
zhihu_publisher
```

**自动执行：**
1. 读取文章文件
2. 打开知乎编辑器
3. 输入标题和正文
4. 添加话题
5. 发布

## Notes

- 需要已登录知乎账号
- 封面图片建议选择情感/婚姻相关
- 话题选择热门标签增加曝光
- 建议勾选"原创"声明
