// Browser checks. Run them against a running site; exits 1 if any check fails.
// 1. On laptop windows 776–896 px tall, the pinned footer showed above the page: over the deadline strip and through the top bar.
// 2. With reduced motion, How it works still faded its phone cards in and drew its arrows.
// 3. The big hero logo pushed the hero buttons and photo below the first screen.
// 4. The hero intro: the logo glides into the top bar while the tagline types in, once per visit.
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

// 3. The hero fits the first screen: both buttons, and the main photo on laptops (the photo starts on screen on phones).
// Reduced motion shows the final layout at once.
for (const [width, height] of [[1440, 790], [1280, 720], [1366, 657], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const buttons = [...hero.querySelectorAll('a, button')].filter((el) => /Order a cake|Design your cake/.test(el.textContent));
    const photo = hero.querySelector('img[src*="hero-cake"]').getBoundingClientRect();
    return { buttons: Math.round(Math.max(...buttons.map((el) => el.getBoundingClientRect().bottom))), top: Math.round(photo.top), bottom: Math.round(photo.bottom) };
  });
  check(r.buttons <= height, `${width}×${height}: both hero buttons are on the first screen (bottom at ${r.buttons})`);
  if (width >= 1024) check(r.bottom <= height, `${width}×${height}: the main hero photo is on the first screen (bottom at ${r.bottom})`);
  else check(r.top <= height - 120, `${width}×${height}: the hero photo starts on the first screen (top at ${r.top})`);
  await page.close();
}

// 4. The hero intro. The typed letters sit in [data-typed] spans; the rest of each line waits, invisible, beside them.
const typed = (page) => page.evaluate(() => [...document.querySelectorAll('#hero-title [data-typed]')].map((s) => s.textContent).join('|'));
const DONE = 'Made with heart,|not haste.';
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#hero-title');
  const start = await page.evaluate(() => {
    const logo = document.getElementById('intro-logo');
    return { top: logo ? Math.round(logo.getBoundingClientRect().top) : null, bar: (document.getElementById('bar-logo') ? getComputedStyle(document.getElementById('bar-logo')).opacity : 'missing') };
  });
  check(start.top !== null && start.top > 130 && start.bar === '0', `1440×900: the page opens with the big logo in the hero (top at ${start.top}) and the top-bar logo hidden`);
  // Follow the glide frame by frame: where the big logo was last seen must be where the top-bar logo is.
  const landing = await page.evaluate(
    () =>
      new Promise((done) => {
        let last = null;
        const frame = () => {
          const logo = document.getElementById('intro-logo');
          if (logo) {
            last = logo.getBoundingClientRect();
            requestAnimationFrame(frame);
            return;
          }
          const bar = document.getElementById('bar-logo')?.getBoundingClientRect();
          done(last && bar && { dx: Math.abs(last.left - bar.left), dy: Math.abs(last.top - bar.top), dh: Math.abs(last.height - bar.height) });
        };
        frame();
      }),
  );
  const off = landing ? Math.max(landing.dx, landing.dy, landing.dh) : Infinity;
  check(off < 2, `1440×900: the logo lands exactly on the top-bar logo (off by ${landing ? off.toFixed(1) : '—'} px)`);
  const mid = await typed(page);
  await page.waitForTimeout(2600);
  const end = await page.evaluate(() => ({ bar: (document.getElementById('bar-logo') ? getComputedStyle(document.getElementById('bar-logo')).opacity : 'missing'), caret: !!document.querySelector('#hero-title [data-caret]') }));
  const text = await typed(page);
  check(mid !== DONE && text === DONE && end.bar === '1' && !end.caret, `1440×900: the tagline types in ("${mid}" → "${text}"), then the caret goes`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#hero-title');
  const again = await page.evaluate(() => !!document.getElementById('intro-logo'));
  check(!again && (await typed(page)) === DONE, '1440×900: a reload in the same visit shows the finished hero at once');
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const started = await page.waitForSelector('#intro-logo', { timeout: 3000 }).then(() => true, () => false);
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(150);
  const logo = await page.evaluate(() => !!document.getElementById('intro-logo'));
  check(started && !logo && (await typed(page)) === DONE, '1440×900: a scroll during the intro jumps to the end');
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#hero-title');
  const r = await page.evaluate(() => ({ logo: !!document.getElementById('intro-logo'), bar: (document.getElementById('bar-logo') ? getComputedStyle(document.getElementById('bar-logo')).opacity : 'missing') }));
  check(!r.logo && r.bar === '1' && (await typed(page)) === DONE, '390×844, reduced motion: no intro; the tagline and the top-bar logo show at once');
  await page.close();
}

await browser.close();
console.log(failed ? `${failed} check(s) failed` : 'All checks passed.');
process.exit(failed ? 1 : 0);
