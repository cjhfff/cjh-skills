const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.douyin.com');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: '/Users/yangyue/.openclaw/workspace/douyin_headed.png' });
  console.log('Screenshot saved');
  await browser.close();
})();
