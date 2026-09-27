// Screenshots of a running site at phone, tablet and desktop widths. It scrolls through first,
// so every scroll-triggered section has appeared, then saves one viewport shot per screen height.
// Usage: node scripts/qa-shots.mjs [url] [outDir] [--reduced] [--height=760]
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const [url = 'http://localhost:5173/', out = 'qa-shots'] = args.filter((a) => !a.startsWith('--'));
const reduced = args.includes('--reduced');
const fixedHeight = Number(args.find((a) => a.startsWith('--height='))?.split('=')[1]) || 0;
const screens = [
  [390, 844, 'phone'],
  [768, 1024, 'tablet'],
  [1440, 900, 'desktop'],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [width, baseHeight, name] of screens) {
  const height = fixedHeight || baseHeight;
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.goto(url, { waitUntil: 'networkidle' });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += Math.round(height * 0.5)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const fonts = await page.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))]);
  let i = 0;
  for (let y = 0; y < total; y += height) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}${reduced ? '-reduced' : ''}-${String(i++).padStart(2, '0')}.png` });
  }
  console.log(`${name}: ${width}×${height}, page ${total}px, horizontal overflow ${overflow}px, fonts ${fonts.join(', ')}, ${i} shots`);
  await page.close();
}
await browser.close();
