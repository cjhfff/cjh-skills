# Harvest_Zhihu_Page

**Category:** browser-automation
**Target:** host
**Trigger:** `爬取知乎` | `抓取回答` | `提取素材`

## Description

自动滚动当前页面以触发懒加载，然后提取所有回答的纯文本并下载为本地 TXT 文件。

## Workflow

### Step 1: 输出提示
```
正在启动自动滚屏与抓取任务，请稍候...
```

### Step 2: 执行 JavaScript 脚本

```javascript
(function() {
  // 配置：滚动次数和间隔
  const config = {
    maxScrolls: 6,          // 滚动次数，约覆盖30-50个回答
    interval: 1500,         // 每次滚动间隔(毫秒)
    outputName: "zhihu_data_" + new Date().toISOString().slice(0,10) + ".txt"
  };

  console.log("ClewdBot: 开始执行自动滚动...");

  let scrollCount = 0;
  let scroller = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    scrollCount++;
    console.log(`ClewdBot: 滚动进度 ${scrollCount}/${config.maxScrolls}`);

    if (scrollCount >= config.maxScrolls) {
      clearInterval(scroller);
      // 停止后给一点缓冲时间加载图片和文字
      setTimeout(extractAndDownload, 2000);
    }
  }, config.interval);

  function extractAndDownload() {
    console.log("ClewdBot: 开始提取文本...");

    const answers = document.querySelectorAll('.RichContent-inner');
    if (answers.length === 0) {
      alert("ClewdBot: 未检测到有效回答内容，请确认在问题页面运行。");
      return;
    }

    let content = `SOURCE: ${document.title}\n`;
    content += `URL: ${window.location.href}\n`;
    content += `TIME: ${new Date().toLocaleString()}\n`;
    content += "--------------------------------------------------\n";

    answers.forEach((ans, index) => {
      // 简单的文本清洗，去除多余空行
      let text = ans.innerText.replace(/\s+/g, ' ');
      content += `=== 回答 #${index + 1} ===\n${text}\n`;
      content += "--------------------------------------------------\n";
    });

    // 创建并触发下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = config.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`任务完成！ 已抓取 ${answers.length} 条回答。 文件已自动下载: ${config.outputName}`);
  }
})();
```

## Notes

- 确保在知乎问题页面运行（需要包含 `.RichContent-inner` 元素）
- 滚动次数可根据页面长度调整（当前配置约覆盖30-50个回答）
- 文件会自动下载到浏览器默认下载目录
