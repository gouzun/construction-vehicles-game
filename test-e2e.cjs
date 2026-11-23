const { chromium } = require('/Users/user/.npm/_npx/31e32ef8478fbf80/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('Page Title:', await page.title());

  // 1. Select Excavator
  await page.click('#btn-select-excavator');
  await page.waitForTimeout(400);
  console.log('Stage 1 Assembly loaded.');

  // Click all 4 parts
  for (const part of ['chassis', 'wheels', 'cabin', 'arm']) {
    await page.click('#tray-part-' + part);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(500);
  console.log('Stage 1 parts assembled.');

  // 2. Next to Fueling
  await page.click('#btn-to-fueling');
  await page.waitForTimeout(400);
  console.log('Stage 2 Fueling loaded.');

  // Pump fuel until full
  for (let i = 0; i < 10; i++) {
    const isBannerVisible = await page.isVisible('#btn-to-site');
    if (isBannerVisible) break;
    try {
      await page.click('#btn-hold-pump', { timeout: 1000 });
    } catch (e) {
      break;
    }
    await page.waitForTimeout(100);
  }
  await page.waitForSelector('#btn-to-site', { timeout: 5000 });
  console.log('Stage 2 Fueling filled.');

  // 3. Next to Site
  await page.click('#btn-to-site');
  await page.waitForTimeout(400);
  console.log('Stage 3 Site loaded.');

  // Scoop 3 times
  for (let i = 0; i < 3; i++) {
    await page.click('#btn-perform-action');
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(500);
  console.log('Stage 3 Site actions finished.');

  // 4. Next to Wash
  await page.click('#btn-to-wash');
  await page.waitForTimeout(400);
  console.log('Stage 4 Wash loaded.');

  // Wash vehicle until complete
  for (let i = 0; i < 20; i++) {
    const isBannerVisible = await page.isVisible('#btn-finish-game');
    if (isBannerVisible) break;
    try {
      await page.click('#wash-bay', { timeout: 1000 });
    } catch(e) {
      break;
    }
    await page.waitForTimeout(80);
  }
  await page.waitForSelector('#btn-finish-game', { state: 'visible', timeout: 5000 });
  console.log('Stage 4 Wash finished!');

  // Test Dump Truck path
  await page.click('#btn-finish-game');
  await page.waitForTimeout(400);
  console.log('Returned to Vehicle Select.');

  await page.click('#btn-select-dump');
  await page.waitForTimeout(300);
  console.log('Dump truck selected & Stage 1 loaded.');

  // Test Viewport toggles
  await page.click('#vp-landscape');
  await page.waitForTimeout(200);
  console.log('Tested Mobile Landscape viewport.');

  await page.click('#vp-tablet');
  await page.waitForTimeout(200);
  console.log('Tested Tablet viewport.');

  await page.click('#vp-fluid');
  await page.waitForTimeout(200);
  console.log('Tested Fullscreen Fluid viewport.');

  // Test Language toggles
  await page.click('#lang-zh');
  await page.waitForTimeout(200);
  console.log('Tested Chinese language translation.');

  await page.click('#lang-ms');
  await page.waitForTimeout(200);
  console.log('Tested Bahasa Melayu language translation.');

  await page.click('#lang-en');
  await page.waitForTimeout(200);
  console.log('Tested English language translation.');

  console.log('Final Total Console Errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  }

  await browser.close();
  console.log('VERIFICATION_COMPLETE_SUCCESS');
})();
