const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch();

  // --- Biblioteca educativa: search filter ---
  {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('[pageerror biblioteca]', e.message));
    await page.goto(baseUrl + '/biblioteca-educativa/index.html', { waitUntil: 'networkidle' });
    const totalBefore = await page.$eval('#resultsCount', el => el.textContent);
    console.log('biblioteca resultsCount before search:', totalBefore);
    await page.fill('#searchInput', 'nodulos');
    await page.waitForTimeout(150);
    const totalAfter = await page.$eval('#resultsCount', el => el.textContent);
    console.log('biblioteca resultsCount after searching "nodulos":', totalAfter);
    const catRowAriaLabel = await page.getAttribute('#catRow', 'aria-label');
    console.log('biblioteca catRow aria-label (should stay set, not empty):', catRowAriaLabel);
    await page.close();
  }

  // --- Biofeedback vocal: aria-label i18n fix + exercise chip switch ---
  {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('[pageerror biofeedback]', e.message));
    await page.goto(baseUrl + '/biofeedback-vocal/index.html', { waitUntil: 'networkidle' });
    console.log('biofeedback targetMin aria-label (ES, before switch):', await page.getAttribute('#targetMin', 'aria-label'));
    // switch language to English via the lang widget
    await page.click('#cv-lang-fab');
    await page.waitForTimeout(150);
    await page.click('.cv-lang-opt[data-lang-id="en"]');
    await page.waitForTimeout(200);
    console.log('biofeedback targetMin aria-label (after switching to EN):', await page.getAttribute('#targetMin', 'aria-label'));
    // exercise chip switch
    await page.click('.chip[data-ex="lectura"]');
    await page.waitForTimeout(100);
    console.log('sample phrase visible after selecting "lectura":', await page.$eval('#samplePhrase', el => el.style.display));
    await page.close();
  }

  // --- Root portal: tour doesn't error with the new expanded steps ---
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { try { localStorage.setItem('cv-tour-seen', '0'); } catch(e){} });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(baseUrl + '/index.html', { waitUntil: 'networkidle' });
    const startBtn = await page.$('#cv-tour-btn');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(200);
      // click "next" repeatedly through all steps
      for (let i = 0; i < 20; i++) {
        const nextBtn = await page.$('.cv-tour-actions button:last-child, #cv-tour-next, [data-tour-next]');
        const anyBtn = await page.$('#cv-tour-overlay button, .cv-tourstep button');
        if (!anyBtn) break;
        try { await anyBtn.click({ timeout: 500 }); } catch(e) { break; }
        await page.waitForTimeout(120);
      }
    }
    console.log('root portal tour click-through errors:', errors.length ? errors : 'none');
    await page.close();
  }

  await browser.close();
})();
