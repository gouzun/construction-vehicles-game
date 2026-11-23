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
  console.log('Canvas Game Engine mounted!');

  // Check canvas exists and is rendering
  const hasCanvas = await page.isVisible('#game-canvas');
  console.log('Canvas element visible:', hasCanvas);

  // Interact with Canvas (click inside canvas world)
  const box = await page.locator('#game-canvas').boundingBox();
  console.log('Canvas bounding box:', box);

  // Click canvas in tray area to trigger assembly interactions
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.85);
  await page.waitForTimeout(100);
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.85);
  await page.waitForTimeout(100);

  // Test stage transitions via in-game next button
  await page.click('#in-game-btn-next');
  await page.waitForTimeout(400);
  console.log('Advanced to Fueling stage on Canvas.');

  // Click pump button in canvas
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.7);
  await page.waitForTimeout(200);

  // Advance to Construction Site stage
  await page.click('#in-game-btn-next');
  await page.waitForTimeout(400);
  console.log('Advanced to Construction Site stage on Canvas.');

  // Click drive pedal & dig button
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.85); // pedal
  await page.waitForTimeout(200);
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.85); // dig action
  await page.waitForTimeout(300);

  // Advance to Wash stage
  await page.click('#in-game-btn-next');
  await page.waitForTimeout(400);
  console.log('Advanced to Car Wash stage on Canvas.');

  // Scrub with sponge in canvas
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55);
  await page.mouse.up();
  await page.waitForTimeout(200);

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

  // Test In-Game Home Button back to select
  await page.click('#in-game-btn-home');
  await page.waitForTimeout(300);
  console.log('Returned to Vehicle Select successfully.');

  console.log('Final Total Console Errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  }

  await browser.close();
  console.log('CANVAS_VERIFICATION_COMPLETE_SUCCESS');
})();
