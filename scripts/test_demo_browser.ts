import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { prisma } from '../server/src/prisma';
import { assertIsolatedTestDatabase } from './assertIsolatedTestDatabase';

async function main() {
  assertIsolatedTestDatabase();
  const email = process.env.DEMO_LOGIN_EMAIL || 'operations.manager@dairyos.enterprise';
  const password = process.env.DEMO_LOGIN_PASSWORD || process.env.TEST_AUTH_PASSWORD || process.env.SEED_DEMO_PASSWORD;
  assert.ok(password, 'Set DEMO_LOGIN_PASSWORD for the isolated seeded browser account.');
  const farmerName = `Browser Demo ${randomUUID().slice(0, 8)}`;
  const phone = `8${randomUUID().replace(/\D/g, '').slice(0, 9)}`;
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  let farmerCode: string | undefined;
  let collectionCode: string | undefined;

  const readFarmerSupplyKpi = async () => {
    const label = page.getByText('Farmer Supply', { exact: true });
    const value = await label.locator('..').locator('..').locator('span.text-2xl').textContent();
    return Number((value || '0').replace(/,/g, ''));
  };

  const waitForFarmerSupplyKpi = async (expected: number) => {
    await page.waitForFunction((expectedTotal) => {
      const label = Array.from(document.querySelectorAll('span')).find((element) => element.textContent?.trim() === 'Farmer Supply');
      const card = label?.parentElement?.parentElement;
      const value = card?.querySelector('span.text-2xl')?.textContent || '0';
      return Number(value.replace(/,/g, '')) === expectedTotal;
    }, expected, { timeout: 10_000 });
  };

  try {
    await page.goto(process.env.DEMO_WEB_BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('intentionally-wrong-password');
    await page.getByRole('button', { name: 'Sign In to DairyOS' }).click();
    await page.getByText('Invalid email or password.', { exact: true }).waitFor();

    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign In to DairyOS' }).click();
    await page.getByRole('heading', { name: 'Dairy Operations Control Tower' }).waitFor();
    const initialLitres = (await prisma.milkCollectionRecord.aggregate({ _sum: { quantityLitres: true } }))._sum.quantityLitres || 0;
    await waitForFarmerSupplyKpi(Math.round(initialLitres));
    const farmerSupplyBefore = await readFarmerSupplyKpi();

    await page.locator('aside nav button').filter({ hasText: 'Farmers & Procurement' }).click();
    await page.getByRole('button', { name: 'Add Farmer' }).click();
    await page.getByPlaceholder('e.g. Sanjaybhai Patel').fill(farmerName);
    await page.getByPlaceholder('Village or collection centre').fill('Browser Test Village');
    await page.locator('input[type="tel"]').fill(phone);
    await page.locator('form').last().locator('input[type="number"]').fill('2');
    await page.getByRole('button', { name: 'Save Farmer' }).click();
    await page.getByText(farmerName, { exact: true }).first().waitFor();
    const savedFarmer = await prisma.farmer.findFirst({ where: { name: farmerName, contactNumber: phone } });
    assert.ok(savedFarmer, 'Farmer created in the UI must be persisted in the isolated database.');
    farmerCode = savedFarmer.farmerCode;

    await page.getByRole('button', { name: 'Close Ledger' }).click();
    await page.getByPlaceholder('Search Farmer ID, Name or Village...').fill(phone);
    await page.getByText(farmerName, { exact: true }).waitFor();

    await page.locator('aside nav button').filter({ hasText: 'Milk Collection' }).click();
    await page.getByRole('button', { name: 'Manual Entry' }).click();
    const collectionForm = page.locator('form').last();
    await collectionForm.locator('select').nth(2).selectOption(farmerCode);
    const readings = collectionForm.locator('input[type="number"]');
    await readings.nth(0).fill('42.5');
    await readings.nth(1).fill('4.4');
    await readings.nth(2).fill('8.6');
    await readings.nth(3).fill('18');
    await page.getByText('₹36.55 / L', { exact: true }).waitFor();
    const validity = await collectionForm.evaluate((form) => ({
      valid: (form as HTMLFormElement).checkValidity(),
      invalid: Array.from(form.querySelectorAll(':invalid')).map((element) => ({
        type: (element as HTMLInputElement).type,
        value: (element as HTMLInputElement).value,
        min: (element as HTMLInputElement).min,
        max: (element as HTMLInputElement).max,
      })),
    }));
    assert.ok(validity.valid, `Collection form validity failed: ${JSON.stringify(validity.invalid)}`);
    const collectionSaved = page.waitForResponse((response) =>
      response.url().endsWith('/api/v1/collections') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Save Collection' }).click();
    const collectionSaveResponse = await collectionSaved;
    assert.equal(collectionSaveResponse.status(), 201, 'Collection UI submission must receive a server-confirmed create response.');

    const savedCollection = await prisma.milkCollectionRecord.findFirst({
      where: { farmerId: farmerCode, quantityLitres: 42.5, fat: 4.4, snf: 8.6 },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(savedCollection, 'Collection submitted in the UI must persist once in the isolated database.');
    collectionCode = savedCollection.collectionCode;
    assert.equal(savedCollection.payableAmount, 1553);
    await page.getByRole('button', { name: 'POS Slip' }).first().click();
    await page.getByText('DEMO RECEIPT · NO PROVIDER SETTLEMENT').waitFor();
    await page.getByText('₹1,553', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Close dialog' }).click();

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Dairy Operations Control Tower' }).waitFor();
    const persistedLitres = (await prisma.milkCollectionRecord.aggregate({ _sum: { quantityLitres: true } }))._sum.quantityLitres || 0;
    await waitForFarmerSupplyKpi(Math.round(persistedLitres));
    const farmerSupplyAfter = await readFarmerSupplyKpi();
    assert.equal(farmerSupplyAfter, Math.round(persistedLitres));
    assert.ok(farmerSupplyAfter > farmerSupplyBefore,
      `Dashboard farmer supply must reflect persisted collection data after reload (${farmerSupplyBefore} -> ${farmerSupplyAfter}).`);
    await page.locator('aside nav button').filter({ hasText: 'Milk Collection' }).click();
    await page.getByText(farmerName, { exact: true }).waitFor();
    await page.getByText('₹1,553', { exact: true }).first().waitFor();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Dairy Operations Control Tower' }).waitFor();
    await page.locator('aside nav button[title*="Milk Collection"]').click();
    const widthCheck = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll('body *'))
        .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 4 && !element.closest('table'))
        .map((element) => ({
          tag: element.tagName,
          className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
          text: element.textContent?.trim().slice(0, 50) || '',
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width),
        }))
        .sort((a, b) => b.right - a.right)
        .slice(0, 8),
    }));
    assert.ok(widthCheck.document <= widthCheck.viewport + 2,
      `Mobile collection screen must not overflow horizontally (${widthCheck.document}px > ${widthCheck.viewport}px): ${JSON.stringify(widthCheck.offenders)}`);
    await page.getByRole('button', { name: 'Manual Entry' }).click();
    const mobileFormBounds = await page.locator('form').last().boundingBox();
    assert.ok(mobileFormBounds && mobileFormBounds.width <= widthCheck.viewport,
      'Collection entry form must fit within the 390 px mobile viewport.');
    await page.getByRole('button', { name: 'Save Collection' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Close dialog' }).click();

    await page.getByRole('button', { name: 'Switch language / भाषा बदलें' }).click();
    await page.locator('aside nav button[title*="दूध संग्रह"]').waitFor();
    await page.route('**/api/v1/auth/logout', (route) => route.abort());
    await page.getByRole('button', { name: /Sign Out|साइन आउट/ }).click();
    await page.getByRole('alert').filter({ hasText: 'सर्वर सत्र बंद नहीं हो सका' }).waitFor();
    await page.getByRole('heading', { name: 'Milk Collection Desk' }).waitFor();
    await page.unroute('**/api/v1/auth/logout');
    await page.getByRole('button', { name: /Sign Out|साइन आउट/ }).click();
    await page.getByRole('heading', { name: 'DairyOS Enterprise' }).waitFor();

    assert.deepEqual(consoleErrors, [], `Browser page errors: ${consoleErrors.join('; ')}`);
    console.log('Demo browser checks passed: rejected invalid login, authenticated session, farmer create/search, collection pricing/persistence/receipt, dashboard refresh, mobile page/form, Hindi navigation, failed logout visibility and confirmed logout.');
  } finally {
    if (collectionCode) {
      await prisma.auditLogEntry.deleteMany({ where: { recordId: collectionCode } });
      await prisma.paymentTransaction.deleteMany({ where: { transactionRef: `TXN-AUTO-${collectionCode}` } });
      await prisma.milkCollectionRecord.deleteMany({ where: { collectionCode } });
    }
    if (farmerCode) await prisma.farmer.deleteMany({ where: { farmerCode } });
    await page.close();
    await browser.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Demo browser checks failed:', error);
  process.exitCode = 1;
});
