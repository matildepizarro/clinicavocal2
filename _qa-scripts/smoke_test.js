// Quick smoke test: loads each page in headless Chromium, collects console
// errors/warnings and page errors (uncaught exceptions), and reports them.
// Usage: node smoke_test.js [baseUrl]
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://localhost:8080';

const pages = [
  '/index.html',
  '/evaluacion-vocal/index.html',
  '/vocalizador/index.html',
  '/praat-web/index.html',
  '/bitacora-sesiones/index.html',
  '/sesion-diaria/index.html',
  '/esfuerzo-vocal/index.html',
  '/respiracion-cuadrada/index.html',
  '/higiene-vocal/index.html',
  '/anamnesis-vocal/index.html',
  '/biblioteca-educativa/index.html',
  '/biofeedback-vocal/index.html',
  '/rango-tonal-afirmativo/index.html',
  '/dashboard-longitudinal/index.html'
];

(async () => {
  const browser = await chromium.launch();
  let totalIssues = 0;
  for (const p of pages) {
    const page = await browser.newPage();
    const issues = [];
    const EXTERNAL = /cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/;
    page.on('console', msg => {
      if (['error', 'warning'].includes(msg.type())) {
        const text = msg.text();
        if (EXTERNAL.test(text)) return; // sandbox has no egress; ignore CDN/font noise
        issues.push(`[console.${msg.type()}] ${text}`);
      }
    });
    page.on('pageerror', err => {
      issues.push(`[pageerror] ${err.message}`);
    });
    page.on('requestfailed', req => {
      // ignore CDN/font requests failing due to no egress in this sandbox test env
      if (!EXTERNAL.test(req.url())) {
        issues.push(`[requestfailed] ${req.url()} - ${req.failure()?.errorText}`);
      }
    });
    try {
      await page.goto(baseUrl + p, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(400);
    } catch (e) {
      issues.push(`[navigation error] ${e.message}`);
    }
    console.log(`\n=== ${p} ===`);
    if (issues.length === 0) {
      console.log('  OK - no console errors/warnings/pageerrors');
    } else {
      issues.forEach(i => console.log('  ' + i));
      totalIssues += issues.length;
    }
    await page.close();
  }
  await browser.close();
  console.log(`\nTOTAL ISSUES: ${totalIssues}`);
})();
