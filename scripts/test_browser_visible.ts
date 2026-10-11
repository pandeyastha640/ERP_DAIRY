import { chromium } from 'playwright';

async function main() {
  console.log('Testing Playwright Chrome Launch...');
  try {
    const browser = await chromium.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--window-position=960,0',
        '--window-size=960,1040',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
    console.log('Browser launched successfully!');
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('Page Title:', title);
    await page.waitForTimeout(3000);
    await browser.close();
    console.log('Test completed successfully.');
  } catch (err) {
    console.error('Launch Error:', err);
    process.exit(1);
  }
}

main();
