import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Chris/AppData/Roaming/npm/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url   = process.argv[2] || 'http://localhost:3002';
const label = process.argv[3] || '';

// Auto-increment screenshot filename
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = path.join(dir, filename);

// Chrome path detection
const chromeBase = 'C:/Users/Chris/.cache/puppeteer/chrome';
const versions = fs.readdirSync(chromeBase).filter(d => fs.statSync(path.join(chromeBase, d)).isDirectory());
const chromePath = path.join(chromeBase, versions[versions.length - 1], 'chrome-win64', 'chrome.exe');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Force all GSAP ScrollTrigger animations to complete
  await page.evaluate(() => {
    // Force all reveal elements visible immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0px)';
    });
    if (window.gsap) {
      gsap.globalTimeline.progress(1, true);
    }
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('Saved:', outPath);
})();
