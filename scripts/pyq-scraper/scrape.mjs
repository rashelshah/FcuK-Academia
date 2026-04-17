#!/usr/bin/env node
/**
 * FcuK Academia — PYQ Scraper v2
 * ============================================================
 * Fixed: "View" buttons are React-controlled <button> elements
 * with no href/data attrs. Strategy: click each button, wait
 * for the /view page to load, extract the Google Drive URL from
 * the iframe/embed, then download and upload the PDF.
 *
 * Usage:
 *   node scripts/pyq-scraper/scrape.mjs
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

// ── Load env ──────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'https://thehelpers.vercel.app';
const BUCKET = 'pyqs';
const TMP_DIR = path.resolve(__dirname, '.tmp_pdfs');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Bail out early if placeholder values are still there
if (SUPABASE_URL.includes('YOUR_PROJECT_ID') || SERVICE_KEY.includes('YOUR_')) {
  console.error('❌  Please fill in REAL Supabase credentials in .env.local before running!');
  process.exit(1);
}

fs.mkdirSync(TMP_DIR, { recursive: true });

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────

function normalizeSubject(raw) {
  return raw.trim().replace(/\s+/g, ' ');
}

function extractYear(label) {
  const match = label.match(/\b(20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function detectExamType(label) {
  const l = label.toLowerCase();
  if (l.includes('ct') || l.includes('cycle test')) return 'CT';
  if (l.includes('pyq') || l.includes('previous')) return 'PYQ';
  return 'Other';
}

/** Filter: only keep PYQ/CT labels, skip notes/strategies/syllabus */
function isPYQLabel(label) {
  const l = label.toLowerCase();
  return (
    l.includes('pyq') ||
    l.includes('ct') ||
    l.includes('cycle') ||
    l.includes('more pyq') ||
    /\b20\d{2}\b/.test(label) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(label)
  );
}

/** Download a URL to a local file, following redirects */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const doRequest = (reqUrl) => {
      const proto = reqUrl.startsWith('https') ? https : http;
      proto.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try { fs.unlinkSync(dest); } catch {}
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, reqUrl).href;
          return downloadFile(next, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      }).on('error', (e) => {
        try { fs.unlinkSync(dest); } catch {}
        reject(e);
      });
    };

    doRequest(url);
  });
}

/** Convert any Google Drive view URL → direct download URL */
function toDownloadUrl(viewerUrl) {
  if (!viewerUrl) return null;

  // Pattern: /view?url=https://drive.google.com/...
  let parsed;
  try { parsed = new URL(viewerUrl); } catch { return null; }

  const urlParam = parsed.searchParams.get('url');
  const target = urlParam || viewerUrl;

  // Extract Drive file ID
  const patterns = [
    /\/file\/d\/([-\w]{15,})/,
    /[?&]id=([-\w]{15,})/,
    /open\?id=([-\w]{15,})/,
  ];
  for (const pattern of patterns) {
    const m = target.match(pattern);
    if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  }

  // docs.google.com/document export
  if (target.includes('docs.google.com')) {
    const idMatch = target.match(/\/d\/([-\w]{15,})/);
    if (idMatch) return `https://docs.google.com/document/d/${idMatch[1]}/export?format=pdf`;
  }

  return target; // fallback
}

/** Upload buffer to Supabase Storage */
async function uploadToSupabase(fileBuffer, storagePath) {
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: 'application/pdf',
    upsert: false,
  });

  if (error && !error.message.includes('already exists')) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return publicUrl;
}

/** Insert metadata; skip on duplicate */
async function insertPYQ({ semester, subjectName, subjectRaw, examType, year, sourceLabel, fileUrl, storagePath }) {
  const { error } = await supabase.from('pyqs').insert({
    semester,
    subject_name: subjectName,
    subject_raw: subjectRaw,
    exam_type: examType,
    year,
    source_label: sourceLabel,
    file_url: fileUrl,
    storage_path: storagePath,
  });

  if (error) {
    if (error.code === '23505') return 'duplicate';
    throw error;
  }
  return 'inserted';
}

// ── Core: extract PYQ info by CLICKING each View button ────────

/**
 * For a given subject page:
 * 1. Read the "Previous Year Questions" section
 * 2. Get all (label, buttonIndex) pairs for PYQ/CT items
 * 3. For each: click the button on a NEW PAGE, wait for /view navigation,
 *    capture the URL, extract the Drive file ID
 */
async function extractPYQsFromPage(browser, subjectPageUrl) {
  // Load subject page to extract button order + labels
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(15000);
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(subjectPageUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button', { timeout: 10000 });

    // Get all button text labels in DOM order
    // We'll correlate label with the preceding text node in the same row
    const buttonData = await page.evaluate(() => {
      const results = [];

      // The page structure is a list of rows. Each row has:
      //   [label text node / span]  [View button]
      // Strategy: walk all buttons, and for each "View" button,
      // look at surrounding DOM to find its label.

      const allButtons = Array.from(document.querySelectorAll('button'));
      const viewButtons = allButtons.filter(b => b.textContent?.trim() === 'View');

      viewButtons.forEach((btn, idx) => {
        // Walk up to find the row container, then get its text excluding "View"
        let el = btn;
        let label = '';

        for (let depth = 0; depth < 6; depth++) {
          el = el.parentElement;
          if (!el) break;

          // Get all text from this container excluding the button's own text
          const clone = el.cloneNode(true);
          // Remove all buttons from clone
          clone.querySelectorAll('button').forEach(b => b.remove());
          const text = clone.textContent?.trim();
          if (text && text.length > 2 && text.length < 120) {
            label = text;
            break;
          }
        }

        results.push({
          label: label || `Item ${idx + 1}`,
          buttonIndexAmongViewButtons: idx,
        });
      });

      return results;
    });

    return { page, buttonData };
  } catch (err) {
    await page.close();
    throw err;
  }
}

/**
 * Click the Nth "View" button on the page, intercept the navigation to /view,
 * and extract the real Google Drive URL from the viewer page.
 */
async function extractUrlFromViewButton(browser, subjectPageUrl, buttonIndex) {
  const viewPage = await browser.newPage();
  viewPage.setDefaultNavigationTimeout(30000);
  await viewPage.setUserAgent('Mozilla/5.0');

  let capturedUrl = null;
  const setCaptured = (u) => {
    if (!capturedUrl && u && (u.includes('drive.google') || u.includes('docs.google'))) {
      capturedUrl = u;
    }
  };

  viewPage.on('request', r => setCaptured(r.url()));
  viewPage.on('response', r => setCaptured(r.url()));

  try {
    await viewPage.goto(subjectPageUrl, { waitUntil: 'networkidle2' });
    await viewPage.waitForSelector('button', { timeout: 10000 });

    // Catch window.open
    await viewPage.evaluate(() => {
      window.open = (url) => { window.__capturedUrl = url; return null; };
    });

    const viewButtons = await viewPage.$$('button');
    const filteredViewBtns = [];
    for (const btn of viewButtons) {
      if (await btn.evaluate(el => el.textContent?.trim() === 'View')) {
        filteredViewBtns.push(btn);
      }
    }

    if (buttonIndex >= filteredViewBtns.length) {
      await viewPage.close();
      return null;
    }

    // Click "View" natively
    await viewPage.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }, filteredViewBtns[buttonIndex]);

    // Poll for up to 10 seconds checking network, window.open, URL changes, and the DOM
    for (let i = 0; i < 50; i++) {
      if (capturedUrl) break;

      const state = await viewPage.evaluate(() => {
        if (window.__capturedUrl) return window.__capturedUrl;
        
        const loc = window.location.href;
        if (loc.includes('drive.google') || loc.includes('docs.google')) return loc;

        // Check if there's a Download button and click it to trigger network request
        const btnsAndLinks = Array.from(document.querySelectorAll('button, a'));
        for (const el of btnsAndLinks) {
           if (el.textContent?.toLowerCase().includes('download')) {
              // If it's a link, we might just be able to grab href
              if (el.tagName === 'A' && el.href && !el.href.startsWith('javascript')) {
                 if (el.href.includes('drive') || el.href.includes('google')) return el.href;
              }
              // Just click it!
              el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
           }
        }
        
        // Also look for iframes injected into the modal
        const driveIframe = Array.from(document.querySelectorAll('iframe')).find(f => f.src?.includes('drive.google'));
        if (driveIframe) return driveIframe.src;

        return null;
      });

      if (state) setCaptured(state);
      await new Promise(r => setTimeout(r, 200));
    }

    await viewPage.close();
    return capturedUrl;
  } catch (err) {
    try { await viewPage.close(); } catch {}
    throw err;
  }
}


// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  FcuK Academia — PYQ Scraper v2 starting...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  try {
    // ── Step 1: Get semesters ────────────────────────────────
    console.log('📖  Fetching semester list...');
    const listPage = await browser.newPage();
    await listPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
    listPage.setDefaultNavigationTimeout(30000);

    await listPage.goto(`${BASE_URL}/semesters`, { waitUntil: 'networkidle2' });
    await listPage.waitForSelector('a[href*="/semesters/"]', { timeout: 15000 });

    const semesterLinks = await listPage.$$eval('a[href*="/semesters/"]', anchors =>
      anchors
        .map(a => ({ href: a.href, text: a.textContent?.trim() }))
        .filter(a => /\/semesters\/\d+$/.test(a.href))
        .filter((a, i, arr) => arr.findIndex(b => b.href === a.href) === i)
    );
    console.log(`✅  Found ${semesterLinks.length} semesters\n`);

    // ── Step 2: For each semester → subjects ─────────────────
    for (const semLink of semesterLinks) {
      const semesterNum = parseInt(semLink.href.match(/\/semesters\/(\d+)/)?.[1] || '0', 10);
      if (!semesterNum) continue;

      console.log(`\n📚  === Semester ${semesterNum} ===`);

      await listPage.goto(semLink.href, { waitUntil: 'networkidle2' });
      await listPage.waitForSelector('a[href*="/subjects/"]', { timeout: 15000 });

      const subjectLinks = await listPage.$$eval('a[href*="/subjects/"]', anchors =>
        anchors
          .map(a => ({ href: a.href, text: a.textContent?.trim() }))
          .filter(a => a.text && !a.text.toLowerCase().includes('back'))
          .filter((a, i, arr) => arr.findIndex(b => b.href === a.href) === i)
      );

      console.log(`   Found ${subjectLinks.length} subjects`);

      // ── Step 3: For each subject → get PYQ buttons ─────────
      for (const subLink of subjectLinks) {
        const subjectRaw = decodeURIComponent(subLink.href.split('/subjects/')[1] || '').trim();
        const subjectName = normalizeSubject(subjectRaw);

        console.log(`\n   📂  ${subjectName}`);

        try {
          // Load subject page, find all View button labels
          const { page: subjectPage, buttonData } = await extractPYQsFromPage(browser, subLink.href);
          await subjectPage.close();

          // Filter to only PYQ/CT items
          const pyqButtonData = buttonData.filter(b => isPYQLabel(b.label));

          if (pyqButtonData.length === 0) {
            console.log(`      ℹ️  No PYQ buttons found (${buttonData.length} total buttons)`);
            continue;
          }

          console.log(`      Found ${pyqButtonData.length} PYQ/CT buttons`);

          // ── Step 4: Click each PYQ button and extract URL ──
          for (const btnInfo of pyqButtonData) {
            const sourceLabel = btnInfo.label;
            const examType = detectExamType(sourceLabel);
            const year = extractYear(sourceLabel);

            process.stdout.write(`      ⬇️   "${sourceLabel}" ... `);

            let driveUrl;
            try {
              driveUrl = await extractUrlFromViewButton(
                browser,
                subLink.href,
                btnInfo.buttonIndexAmongViewButtons
              );
            } catch (err) {
              console.log(`\n         ⚠️  Click failed: ${err.message}`);
              totalErrors++;
              continue;
            }

            if (!driveUrl) {
              console.log('⚠️  Could not extract URL, skipping');
              totalErrors++;
              continue;
            }

            const downloadUrl = toDownloadUrl(driveUrl);
            if (!downloadUrl) {
              console.log(`⚠️  Unrecognised URL pattern: ${driveUrl}`);
              totalErrors++;
              continue;
            }

            // Build storage path
            const safeSubject = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
            const safeLabel = sourceLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
            const storagePath = `${semesterNum}/${safeSubject}/${safeLabel}.pdf`;
            const tmpFile = path.join(TMP_DIR, `${semesterNum}_${safeSubject}_${safeLabel}.pdf`);

            try {
              console.log(`\n         [DEBUG] Downloading: ${downloadUrl}`);
              // Download
              await downloadFile(downloadUrl, tmpFile);
              const fileBuffer = fs.readFileSync(tmpFile);

              // Validate PDF
              if (fileBuffer.length < 10 || fileBuffer.slice(0, 4).toString('ascii') !== '%PDF') {
                console.log('⚠️  Not a valid PDF, skipping');
                fs.unlinkSync(tmpFile);
                totalErrors++;
                continue;
              }

              // Upload to Supabase
              const publicUrl = await uploadToSupabase(fileBuffer, storagePath);
              fs.unlinkSync(tmpFile);

              // Insert metadata
              const status = await insertPYQ({
                semester: semesterNum,
                subjectName,
                subjectRaw,
                examType,
                year,
                sourceLabel,
                fileUrl: publicUrl,
                storagePath,
              });

              if (status === 'duplicate') {
                console.log('⏭️  duplicate');
                totalSkipped++;
              } else {
                console.log('✅  done');
                totalInserted++;
              }
            } catch (err) {
              console.log(`\n         ❌  Error: ${err.message}`);
              totalErrors++;
              if (fs.existsSync(tmpFile)) try { fs.unlinkSync(tmpFile); } catch {}
            }
          }
        } catch (err) {
          console.log(`   ❌  Subject failed: ${err.message}`);
          totalErrors++;
        }
      }
    }

    await listPage.close();
  } finally {
    await browser.close();
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}

    console.log('\n\n════════════════════════════════════════════════════════════');
    console.log('🏁  Scraper v2 finished!');
    console.log(`✅  Inserted : ${totalInserted}`);
    console.log(`⏭️   Skipped  : ${totalSkipped} (duplicates)`);
    console.log(`❌  Errors   : ${totalErrors}`);
    console.log('════════════════════════════════════════════════════════════\n');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
