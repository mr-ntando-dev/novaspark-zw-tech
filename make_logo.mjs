import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

// Transparent background
await page.setViewport({ width: 600, height: 200, deviceScaleFactor: 3 });
await page.goto('file://' + path.join(__dirname, 'logo.html'), { waitUntil: 'networkidle0' });

// Wait for Google Fonts
await new Promise(r => setTimeout(r, 2000));

// Full logo (dark bg for preview)
await page.evaluate(() => document.body.style.background = '#0a0e17');
await page.screenshot({ path: 'public/images/logo-dark.png', omitBackground: false });

// Transparent version
await page.evaluate(() => document.body.style.background = 'transparent');
await page.screenshot({ path: 'public/images/logo-transparent.png', omitBackground: true });

// Icon only (square crop)
await page.setViewport({ width: 200, height: 200, deviceScaleFactor: 3 });
await page.evaluate(() => {
  document.querySelector('.wordmark').style.display = 'none';
  document.querySelector('.logo-wrap').style.justifyContent = 'center';
  document.querySelector('.logo-wrap').style.width = '200px';
  document.querySelector('.logo-wrap').style.padding = '40px';
  document.body.style.width = '200px';
  document.body.style.background = 'transparent';
});
await page.screenshot({ path: 'public/images/logo-icon.png', omitBackground: true });

await browser.close();
console.log('Done');
