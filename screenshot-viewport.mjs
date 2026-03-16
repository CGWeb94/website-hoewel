import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Chris/AppData/Roaming/npm/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const chromeBase = 'C:/Users/Chris/.cache/puppeteer/chrome';
const versions = fs.readdirSync(chromeBase).filter(d => fs.statSync(path.join(chromeBase, d)).isDirectory());
const chromePath = path.join(chromeBase, versions[versions.length - 1], 'chrome-win64', 'chrome.exe');

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function shot(label, scrollY = 0) {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate((sy) => {
    if (window.gsap) { gsap.globalTimeline.progress(1, true); gsap.globalTimeline.pause(); }
    window.scrollTo(0, sy);
  }, scrollY);
  await new Promise(r => setTimeout(r, 600));
  const out = path.join(dir, `vp-${label}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('Saved:', out);
}

await shot('hero', 0);
await shot('services', 950);
await shot('about', 2200);
await shot('testimonials', 3500);
await shot('contact', 5000);
