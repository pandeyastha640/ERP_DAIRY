import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.DEMO_WEB_BASE_URL || 'http://127.0.0.1:4173/ERP_DAIRY/';
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(7000);
const problems: string[] = [];
const apiRequests: string[] = [];
const externalRequests: string[] = [];
const badResponses: string[] = [];
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
page.on('console', (message) => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`));
page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
page.on('request', (request) => {
  const url = new URL(request.url());
  if (url.pathname.includes('/api/')) apiRequests.push(request.url());
  if (url.origin !== new URL(baseUrl).origin) externalRequests.push(request.url());
});

try {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  console.log(`Loaded ${baseUrl} (HTTP ${response?.status()})`);
  assert.equal(response?.status(), 200, 'Static demo root should load');
  assert.match(await page.title(), /DairyOS/);
  await page.getByRole('button', { name: /Switch language/ }).click();
  await page.getByText('डेमो मोड — नमूना डेटा', { exact: true }).waitFor();
  await page.getByRole('button', { name: /Switch language/ }).click();
  await page.getByRole('button', { name: /Chief Executive Officer/ }).click();
  console.log('Entered local CEO demo role');
  await page.getByRole('region', { name: /Demo notice/ }).waitFor();
  assert.match(await page.locator('body').innerText(), /Demo Mode — Sample Data/);
  await page.getByRole('button', { name: /Switch language/ }).click();
  await page.getByRole('button', { name: /किसान/ }).waitFor();
  await page.getByRole('button', { name: /Switch language/ }).click();
  const registrations = await page.evaluate(async () => 'serviceWorker' in navigator
    ? (await navigator.serviceWorker.getRegistrations()).length
    : 0);
  assert.equal(registrations, 0, 'Static demo must not register a service worker');

  const moduleLabels = [
    'Dashboard', 'Milk Operations', 'Milk Collection', 'Quality Testing', 'Chilling & Milk Pool',
    'Dairy Processing', 'Cattle Herd', 'Farmers & Procurement', 'Feed Management', 'Products',
    'Packaging', 'Inventory', 'Distribution & Fleet', 'Sales & Orders', 'Payments',
    'Finance & Profitability', 'Reports', 'AI Intelligence', 'Control Tower', 'Settings',
  ];
  for (const label of moduleLabels) {
    await page.getByRole('button', { name: label, exact: false }).first().click();
    await page.locator('main').waitFor();
    assert.equal(await page.getByText('Application Exception Encountered').count(), 0, `${label} should render without a fatal exception`);
    console.log(`Navigated: ${label}`);
  }

  await page.getByRole('button', { name: 'Quality Testing', exact: false }).click();
  await page.getByRole('button', { name: 'Sample QC', exact: false }).first().click();
  await page.getByText('SAMPLE DEMO — NOT OFFICIAL', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();

  await page.getByRole('button', { name: 'Sales & Orders', exact: false }).click();
  await page.getByRole('button', { name: 'Sample summary', exact: true }).first().click();
  await page.getByText('SAMPLE DEMO — NOT A TAX INVOICE', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();
  await page.getByRole('button', { name: 'Create Sample Order', exact: true }).click();
  const sampleCustomer = `Sample Browser Outlet ${Date.now()}`;
  const salesForm = page.getByPlaceholder('e.g. Vadodara Retail Mart').locator('xpath=ancestor::form');
  await page.getByPlaceholder('e.g. Vadodara Retail Mart').fill(sampleCustomer);
  await salesForm.locator('input').nth(1).fill('Sample Full Cream Milk');
  await salesForm.locator('input').nth(2).fill('10');
  await salesForm.locator('input').nth(3).fill('62');
  await page.getByRole('button', { name: 'Save Sample Order', exact: true }).click();
  await page.getByText(sampleCustomer, { exact: true }).first().waitFor();
  const sampleOrderRow = page.locator('tr').filter({ hasText: sampleCustomer });
  assert.match(await sampleOrderRow.innerText(), /₹620/);
  assert.match(await sampleOrderRow.innerText(), /Pending/);
  console.log('Created a local sample order without invoice or dispatch');

  await page.getByRole('button', { name: 'Payments', exact: false }).click();
  await page.getByRole('button', { name: 'Run payout simulation', exact: true }).first().click();
  await page.getByRole('button', { name: 'Run payout simulation', exact: true }).last().click();
  await page.getByText('Local preview calculated', { exact: false }).waitFor();
  await page.getByText('Not saved to the ledger.', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();

  await page.getByRole('button', { name: /Farmers & Procurement/ }).click();
  await page.getByRole('button', { name: 'Add Farmer' }).click();
  const farmerName = `Demo Browser Farmer ${Date.now()}`;
  await page.getByPlaceholder('e.g. Sanjaybhai Patel').fill(farmerName);
  await page.getByPlaceholder('Village or collection centre').fill('Sample Village Z');
  await page.locator('input[type="number"]').last().fill('3');
  await page.getByRole('button', { name: 'Save Farmer' }).click();
  await page.getByText(farmerName, { exact: true }).first().waitFor();
  console.log('Created and displayed sample farmer');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Demo Mode — Sample Data', { exact: true }).waitFor();
  await page.getByRole('button', { name: /Farmers & Procurement/ }).click();
  await page.getByText(farmerName, { exact: true }).first().waitFor();
  console.log('Farmer persisted after reload');

  await page.getByRole('button', { name: /Milk Collection/ }).click();
  await page.getByRole('button', { name: 'Manual Entry' }).click();
  const collectionInputs = page.locator('input[type="number"]');
  await collectionInputs.nth(0).fill('42.5');
  await collectionInputs.nth(1).fill('4.4');
  await collectionInputs.nth(2).fill('8.6');
  await collectionInputs.nth(3).fill('18');
  await page.getByText('₹36.55 / L', { exact: false }).waitFor();
  await page.getByText('₹1,553', { exact: false }).waitFor();
  const selectCount = await page.locator('select').count();
  let farmerSelectIndex = -1;
  let farmerOptionValue = '';
  for (let index = 0; index < selectCount; index += 1) {
    const farmerOption = page.locator('select').nth(index).locator('option').filter({ hasText: farmerName }).first();
    if (await farmerOption.count()) {
      farmerSelectIndex = index;
      farmerOptionValue = await farmerOption.getAttribute('value') || '';
      break;
    }
  }
  assert.ok(farmerSelectIndex >= 0 && farmerOptionValue, 'Milk collection farmer selector should include the newly created sample farmer');
  await page.locator('select').nth(farmerSelectIndex).selectOption(farmerOptionValue);
  await page.getByRole('button', { name: 'Save Collection' }).click();
  await page.getByText('Demo collection saved locally', { exact: false }).waitFor();
  console.log('Saved sample milk collection');
  const collectionRow = page.locator('tr').filter({ hasText: farmerName });
  const collectionRowText = await collectionRow.innerText();
  for (const expected of ['42.5 L', '4.40%', '8.60%', '18.0°C', '₹36.55', '₹1,553', 'PASS']) {
    assert.ok(collectionRowText.includes(expected), `Saved collection should show ${expected}`);
  }
  await collectionRow.getByRole('button', { name: /POS Slip/ }).click();
  await page.getByText('Sample receipt preview', { exact: false }).waitFor();
  await page.getByText('42.5 LITRES', { exact: false }).waitFor();
  const receiptText = await page.locator('body').innerText();
  for (const expected of ['42.5 LITRES', '4.4%', '8.6%', '18°C', '₹36.55', '₹1,553', 'PASS']) {
    assert.ok(receiptText.includes(expected), `Sample receipt should show ${expected}`);
  }
  console.log('Receipt values match the collection');
  await page.getByRole('button', { name: /Close/ }).last().click();

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Demo Mode — Sample Data', { exact: true }).waitFor();
  const storedDemoData = await page.evaluate(() => {
    const raw = localStorage.getItem('dairyos-static-demo-v1-data:collections');
    return raw ? JSON.parse(raw) : null;
  });
  const storedSales = await page.evaluate(() => {
    const raw = localStorage.getItem('dairyos-static-demo-v1-data:sales');
    return raw ? JSON.parse(raw) : null;
  });
  assert.equal(storedDemoData?.version, 1, 'Demo records use the versioned local storage schema');
  assert.ok(storedDemoData?.data?.some((record: { farmerName: string }) => record.farmerName === farmerName), 'Collection persists in the local demo namespace');
  assert.ok(storedSales?.data?.some((order: { customerName: string; paymentStatus: string; fulfillmentStatus: string }) => order.customerName === sampleCustomer && order.paymentStatus === 'Pending' && order.fulfillmentStatus === 'Pending Dispatch'), 'Sample order persists as pending and undispatched');
  await page.getByRole('button', { name: /Milk Collection/ }).click();
  await page.getByText(farmerName, { exact: true }).first().waitFor();
  assert.equal(apiRequests.length, 0, 'Static mode must not request backend APIs');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Expand Sidebar' }).click();
  await page.getByRole('button', { name: /Milk Collection/ }).click();
  await page.getByRole('button', { name: 'Manual Entry' }).click();
  assert.ok(await page.locator('main').isVisible(), 'Main content should remain visible at mobile width');
  const layout = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(layout.scrollWidth <= layout.width + 5, `Mobile layout should not overflow horizontally (${layout.scrollWidth}px > ${layout.width}px)`);
  await page.getByRole('button', { name: 'Cancel' }).click();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset Demo Data' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.getByRole('button', { name: /Chief Executive Officer/ }).count()) {
    await page.getByRole('button', { name: /Chief Executive Officer/ }).click();
  }
  await page.getByRole('button', { name: /Farmers & Procurement/ }).click();
  assert.equal(await page.getByText(farmerName, { exact: true }).count(), 0, 'Reset should remove the local farmer');
  await page.getByRole('button', { name: /Sales & Orders/ }).click();
  assert.equal(await page.getByText(sampleCustomer, { exact: true }).count(), 0, 'Reset should remove the local sample order');
  await page.getByRole('button', { name: /Sign Out/ }).click();
  await page.getByText('Demo Mode — Sample Data', { exact: true }).waitFor();
  assert.deepEqual(apiRequests, []);
  assert.deepEqual(externalRequests, [], 'Static demo must not load external assets or contact external services');
  assert.deepEqual(badResponses, [], 'Static demo assets should load without HTTP errors');
  assert.deepEqual(problems, []);
  console.log(`PASS: ${baseUrl} loaded with no failed assets, 20 modules navigated, English/Hindi UI switched, farmer/order/collection persisted, pricing/receipt matched, API/external requests: 0, service workers: 0, mobile width: ${layout.width}px, reset restored sample state, logout returned to demo access.`);
} finally {
  await browser.close();
}
