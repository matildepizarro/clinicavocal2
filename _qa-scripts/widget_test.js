const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('cv-tour-seen', '1'); } catch(e){} });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(baseUrl + '/index.html', { waitUntil: 'networkidle' });

  // --- Theme widget: open, pick a theme, check theme-color meta updates ---
  await page.click('#cv-theme-fab');
  await page.waitForTimeout(150);
  console.log('theme panel aria-expanded after open:', await page.getAttribute('#cv-theme-fab', 'aria-expanded'));
  await page.click('.cv-theme-opt[data-theme-id="menta"]');
  await page.waitForTimeout(150);
  console.log('data-pastel-theme after picking menta:', await page.getAttribute('html', 'data-pastel-theme'));
  console.log('theme-color meta content after picking menta:', await page.getAttribute('meta[name="theme-color"]', 'content'));

  // Escape should close the theme panel and return focus to the fab
  await page.click('#cv-theme-fab'); // reopen
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  console.log('theme panel aria-expanded after Escape:', await page.getAttribute('#cv-theme-fab', 'aria-expanded'));
  console.log('focus returned to theme fab after Escape:', await page.evaluate(() => document.activeElement.id === 'cv-theme-fab'));

  // --- Language widget: switch to English, verify persistence + no flash on reload ---
  await page.click('#cv-lang-fab');
  await page.waitForTimeout(150);
  const enBtn = await page.$('.cv-lang-opt[data-lang-id="en"]');
  await enBtn.click();
  await page.waitForTimeout(200);
  console.log('html lang after switching to English:', await page.getAttribute('html', 'lang'));

  // Reload and check the lang attribute is correct IMMEDIATELY (before i18n-engine.js runs),
  // by reading it as fast as possible after navigation start.
  await page.goto(baseUrl + '/index.html', { waitUntil: 'commit' });
  const earlyLang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
  console.log('html lang immediately on reload (anti-flash check):', earlyLang);
  await page.waitForLoadState('networkidle');
  console.log('html lang after full reload:', await page.getAttribute('html', 'lang'));
  console.log('data-pastel-theme persisted after reload:', await page.getAttribute('html', 'data-pastel-theme'));

  await browser.close();
})();
