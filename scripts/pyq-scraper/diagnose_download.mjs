#!/usr/bin/env node
import fs from 'fs';
import puppeteer from 'puppeteer';

const SUBJECT_URL = 'https://thehelpers.vercel.app/semesters/1/subjects/Calculus%20And%20Linear%20Algebra';

async function main() {
  console.log('🔍 Clicking Download in the File-Viewer...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0');
  
  await page.goto(SUBJECT_URL, { waitUntil: 'networkidle2' });
  
  const viewBtns = await page.$$('button');
  let firstBtn = null;
  for (const btn of viewBtns) {
    if (await btn.evaluate(el => el.textContent?.trim()) === 'View') {
      firstBtn = btn; break;
    }
  }

  if (!firstBtn) { console.log('No buttons'); process.exit(1); }

  console.log(`🖱️  Clicking "View"...`);
  
  const navPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null);
  await page.evaluate(el => {
     el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }, firstBtn);
  
  await navPromise;
  
  const newUrl = page.url();
  console.log(`📍 Navigated to: ${newUrl}`);
  
  page.on('request', r => {
     if (r.url().includes('drive.google') || r.url().includes('uc?') || r.url().includes('.pdf')) {
        console.log(`🌐 Captured Network Request: ${r.url()}`);
     }
  });

  // Patch window.open to catch new tabs
  await page.evaluate(() => {
    window.__openUrls = [];
    window.open = (url) => { window.__openUrls.push(url); return null; };
  });

  const dlBtns = await page.$$('button');
  let dBtn = null;
  for (const btn of dlBtns) {
    if (await btn.evaluate(el => el.textContent?.trim() === 'Download')) {
      dBtn = btn; break;
    }
  }

  if (dBtn) {
    console.log(`🖱️  Clicking "Download"...`);
    await page.evaluate(el => {
       el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }, dBtn);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const opens = await page.evaluate(() => window.__openUrls);
    console.log(`🔗 window.open calls:`, opens);
    
  } else {
    console.log('❌ Could not find Download button');
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
