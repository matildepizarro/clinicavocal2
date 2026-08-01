const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:8080';

const pages = [
  '/index.html', '/anamnesis-vocal/index.html', '/biblioteca-educativa/index.html',
  '/biofeedback-vocal/index.html', '/bitacora-sesiones/index.html',
  '/dashboard-longitudinal/index.html', '/esfuerzo-vocal/index.html',
  '/evaluacion-vocal/index.html', '/higiene-vocal/index.html', '/praat-web/index.html',
  '/rango-tonal-afirmativo/index.html', '/respiracion-cuadrada/index.html',
  '/sesion-diaria/index.html', '/vocalizador/index.html'
];

(async () => {
  const browser = await chromium.launch();
  let totalBad = 0;
  for (const p of pages) {
    const page = await browser.newPage();
    await page.goto(baseUrl + p, { waitUntil: 'networkidle', timeout: 15000 });
    const bad = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input,select,textarea')).filter(el => {
        if (['hidden','button','submit'].includes(el.type)) return false;
        const id = el.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const ph = el.getAttribute('placeholder');
        return !hasLabel && !aria && !ph && !el.closest('label');
      }).map(el => el.outerHTML.slice(0, 120));
    });
    console.log(p, '-> inputs without accessible name:', bad.length);
    if (bad.length) { bad.forEach(b => console.log('   ', b)); totalBad += bad.length; }
    await page.close();
  }
  await browser.close();
  console.log('\nTOTAL INPUTS WITHOUT ACCESSIBLE NAME:', totalBad);
})();
