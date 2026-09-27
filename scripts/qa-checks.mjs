// Browser checks for two bugs the final review found. Run them against a running site; exits 1 if any check fails.
// 1. On laptop windows 776–896 px tall, the pinned footer showed above the page: over the deadline strip and through the top bar.
// 2. With reduced motion, How it works still faded its phone cards in and drew its arrows.
// Usage: node scripts/qa-checks.mjs [url]
import { chromium } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:5173/';
const browser = await chromium.launch({ channel: 'chrome' });
let failed = 0;
const check = (ok, text) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${text}`);
  if (!ok) failed++;
};

// 1. Scroll the whole page. Above the page's lace edge (#page-end) the footer must never be seen. With the lace edge
// 250 px up the window, a footer that fits must be pinned to the window bottom (the page lifts off it).
for (const height of [790, 850, 900]) {
  const page = await browser.newPage({ viewport: { width: 1440, height } });
  await page.goto(url, { waitUntil: 'networkidle' });
  const r = await page.evaluate(async () => {
    const frames = () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    const wait = (ms) => new Promise((done) => setTimeout(done, ms));
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const end = document.getElementById('page-end');
    const fab = () => !!document.querySelector('a[aria-label^="Chat with our team on WhatsApp"]');
    const max = document.documentElement.scrollHeight - innerHeight;
    const leaks = [];
    for (let y = 0; y < max + 250; y += 250) {
      const top = Math.min(y, max);
      window.scrollTo({ top, behavior: 'instant' });
      await frames();
      await frames();
      const edge = end.getBoundingClientRect().top;
      for (const py of [4, 22, 44, 60, 80, 110, 200, 400, 600, innerHeight - 10]) {
        if (py >= edge) continue;
        const stack = document.elementsFromPoint(700, py);
        // Seen = the footer is at this point and the page (<main>, solid Butter, drawn above the footer) is not.
        if (stack.some((el) => footer.contains(el)) && !stack.includes(main)) leaks.push(`scroll ${top}, y ${py}`);
      }
    }
    document.getElementById('faq').scrollIntoView({ behavior: 'instant' });
    await wait(700);
    const fabMid = fab();
    window.scrollTo({ top: end.getBoundingClientRect().top + scrollY - innerHeight + 250, behavior: 'instant' });
    await wait(700);
    const box = footer.getBoundingClientRect();
    return { leaks, fabMid, fabEnd: fab(), fits: box.height <= innerHeight, bottom: Math.round(box.bottom) };
  });
  check(r.leaks.length === 0, `1440×${height}: the footer is never seen above the page end${r.leaks.length ? ` (seen at ${r.leaks.slice(0, 3).join('; ')})` : ''}`);
  check(!r.fits || r.bottom === height, `1440×${height}: near the end, the footer is pinned to the window bottom`);
  check(r.fabMid && !r.fabEnd, `1440×${height}: the WhatsApp button shows mid-page and hides over the footer`);
  await page.close();
}

// 2. Reduced motion: How it works is in its final state as soon as it is on screen.
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await phone.goto(url, { waitUntil: 'networkidle' });
await phone.evaluate(() => {
  const card = document.querySelector('#how ol li');
  window.scrollTo({ top: card.getBoundingClientRect().top + scrollY - 300, behavior: 'instant' });
});
await phone.waitForTimeout(60);
const opacity = await phone.evaluate(() => Number(getComputedStyle(document.querySelector('#how ol li > div')).opacity));
check(opacity > 0.99, `390×844, reduced motion: the How it works cards show at full strength at once (opacity ${opacity})`);
await phone.close();

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await desk.goto(url, { waitUntil: 'networkidle' });
await desk.evaluate(() => document.getElementById('how').scrollIntoView({ behavior: 'instant' }));
const arrow = () => desk.evaluate(() => document.querySelector('#how svg path')?.getAttribute('stroke-dasharray') ?? 'none');
await desk.waitForTimeout(150);
const early = await arrow();
await desk.waitForTimeout(2500);
const late = await arrow();
check(early === late, `1440×900, reduced motion: the How it works arrow is drawn at once (${early} → ${late})`);
await desk.close();

await browser.close();
console.log(failed ? `${failed} check(s) failed` : 'All checks passed.');
process.exit(failed ? 1 : 0);
