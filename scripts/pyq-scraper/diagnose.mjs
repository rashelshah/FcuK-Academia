#!/usr/bin/env node
/**
 * Diagnostic v2 — test the button-click strategy on ONE subject
 * Run: node scripts/pyq-scraper/diagnose.mjs
 */
import puppeteer from 'puppeteer';

const SUBJECT_URL = 'https://thehelpers.vercel.app/semesters/3/subjects/Operating%20Systems';

async function main() {
  console.log('🔍 Testing button-click PYQ extraction...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ── Step 1: Load subject page, get button labels ──────────
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  page.setDefaultNavigationTimeout(30000);

  console.log('📖 Loading subject page...');
  await page.goto(SUBJECT_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('button', { timeout: 10000 });

  const buttonData = await page.evaluate(() => {
    const results = [];
    const allButtons = Array.from(document.querySelectorAll('button'));
    const viewButtons = allButtons.filter(b => b.textContent?.trim() === 'View');

    viewButtons.forEach((btn, idx) => {
      let el = btn;
      let label = '';
      for (let depth = 0; depth < 6; depth++) {
        el = el.parentElement;
        if (!el) break;
        const clone = el.cloneNode(true);
        clone.querySelectorAll('button').forEach(b => b.remove());
        const text = clone.textContent?.trim();
        if (text && text.length > 2 && text.length < 120) {
          label = text;
          break;
        }
      }
      results.push({ label: label || `Item_${idx}`, idx });
    });
    return results;
  });

  console.log(`\n✅ Found ${buttonData.length} View buttons:\n`);
  buttonData.forEach(b => console.log(`  [${b.idx}] "${b.label}"`));
  await page.close();

  // ── Step 2: Click the FIRST PYQ button and capture URL ────
  const firstPYQ = buttonData.find(b => {
    const l = b.label.toLowerCase();
    return l.includes('pyq') || l.includes('ct') || /20\d{2}/.test(l);
  });

  if (!firstPYQ) {
    console.log('\n⚠️  No PYQ button found to test click');
    await browser.close();
    return;
  }

  console.log(`\n🖱️  Clicking button [${firstPYQ.idx}]: "${firstPYQ.label}"`);

  const viewPage = await browser.newPage();
  await viewPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  viewPage.setDefaultNavigationTimeout(30000);

  await viewPage.goto(SUBJECT_URL, { waitUntil: 'networkidle2' });
  await viewPage.waitForSelector('button', { timeout: 10000 });

  const allBtns = await viewPage.$$('button');
  const viewBtns = [];
  for (const btn of allBtns) {
    const text = await btn.evaluate(el => el.textContent?.trim());
    if (text === 'View') viewBtns.push(btn);
  }

  console.log(`   Total View buttons on page: ${viewBtns.length}`);

  const navPromise = viewPage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
  await viewBtns[firstPYQ.idx].click();
  await navPromise;
  await new Promise(r => setTimeout(r, 2000));

  const finalUrl = viewPage.url();
  console.log(`\n📍 Final URL after click: ${finalUrl}`);

  // Try extracting from URL params
  try {
    const u = new URL(finalUrl);
    const urlParam = u.searchParams.get('url');
    if (urlParam) console.log(`   → url param: ${urlParam}`);
  } catch {}

  // Try iframe
  const iframeSrc = await viewPage.evaluate(() => {
    return document.querySelector('iframe')?.src ||
           document.querySelector('embed')?.src ||
           'none';
  });
  console.log(`   → iframe src: ${iframeSrc}`);

  // Page text snippet
  const bodyText = await viewPage.evaluate(() => document.body?.innerText?.slice(0, 300));
  console.log(`\n   Page text snippet:\n${bodyText}`);

  await viewPage.close();
  await browser.close();
  console.log('\n✅ Diagnosis complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
