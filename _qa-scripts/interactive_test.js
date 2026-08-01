const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let xssFired = false;
  page.on('dialog', async d => { xssFired = true; await d.dismiss(); });
  page.on('console', msg => { if (msg.type() === 'error' && !/cdnjs|fonts\.g/.test(msg.text())) console.log('[console.error]', msg.text()); });

  await page.goto(baseUrl + '/bitacora-sesiones/index.html', { waitUntil: 'networkidle' });

  // Inject a malicious "session" directly into localStorage the same way the
  // app's own import-backup feature would, then re-render, to test the XSS fix.
  const malPid = `x"><img src=x onerror="window.__xss=1">`;
  await page.evaluate((pid) => {
    const sessions = [{
      id: Date.now(), date: new Date().toISOString(), participantId: pid,
      focus: 'higiene', exercisesDone: [], sensaciones: [], observaciones: '', lastNote: ''
    }, {
      id: Date.now()+1, date: new Date().toISOString(), participantId: 'Paciente Normal',
      focus: 'higiene', exercisesDone: [], sensaciones: [], observaciones: '', lastNote: ''
    }];
    localStorage.setItem('sesiones_rosa_v1', JSON.stringify(sessions));
  }, malPid);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const xssTriggered = await page.evaluate(() => window.__xss === 1);
  console.log('XSS payload executed (should be false):', xssTriggered);

  // Confirm the patient table actually rendered the malicious name safely as text
  const tableText = await page.evaluate(() => {
    const el = document.getElementById('patientTable');
    return el ? el.textContent : null;
  });
  console.log('Patient table renders payload as inert text:', !!(tableText && tableText.includes('img src=x')));

  // Confirm the legitimate "Ver historial" button still works for a normal name
  const buttons = await page.$$('#patientTable button[data-patient-id]');
  console.log('Number of "Ver historial" buttons found:', buttons.length);
  if (buttons.length > 1) {
    await buttons[1].click();
    await page.waitForTimeout(300);
    const searchVal = await page.$eval('#searchReg', el => el.value);
    console.log('Clicking button for normal patient sets search filter to:', JSON.stringify(searchVal));
  }

  await browser.close();
})();
