const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:8080';

const targets = [
  { url: '/anamnesis-vocal/index.html', btn: '#exportPdfBtn' },
  { url: '/higiene-vocal/index.html', btn: '#exportDayPdfBtn' },
  { url: '/dashboard-longitudinal/index.html', btn: '#btnExportPdf' },
];

(async () => {
  const browser = await chromium.launch();
  for (const t of targets) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    page.on('dialog', async d => { pageErrors.push('[dialog:' + d.type() + '] ' + d.message()); await d.accept(); });
    await page.goto(baseUrl + t.url, { waitUntil: 'networkidle' });
    const btn = await page.$(t.btn);
    console.log(`\n=== ${t.url} (${t.btn}) ===`);
    if (!btn) { console.log('  button not found!'); await page.close(); continue; }
    await btn.click();
    await page.waitForTimeout(1500);
    console.log('  jsPDF loaded (window.jspdf present)?', await page.evaluate(() => !!window.jspdf));
    console.log('  uncaught page errors:', pageErrors.length ? pageErrors : 'none');
    await page.close();
  }
  await browser.close();
})();
