import 'dotenv/config';
import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import express from 'express';
import { authRouter } from '../server/src/routes/auth';
import { farmersRouter } from '../server/src/routes/farmers';
import { collectionsRouter } from '../server/src/routes/collections';
import { paymentsRouter } from '../server/src/routes/payments';
import { notificationsRouter } from '../server/src/routes/notifications';
import { prisma } from '../server/src/prisma';
import { AuthenticatedRequest, authenticate, authorizeApiRequest } from '../server/src/middleware/auth';
import { assertIsolatedTestDatabase } from './assertIsolatedTestDatabase';

async function main() {
  assertIsolatedTestDatabase();
  assert.ok(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32, 'Set an isolated test JWT_SECRET (32+ characters).');
  const suffix = randomUUID();
  const email = `demo-workflow-${suffix}@test.invalid`;
  const password = `test-${randomUUID()}-${randomUUID()}`;
  let testUserId: string | undefined;
  let farmerCode: string | undefined;
  let collectionCode: string | undefined;
  let notificationMessageId: string | undefined;

  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1', (req, res, next) =>
    authenticate(req as AuthenticatedRequest, res, () =>
      authorizeApiRequest(req as AuthenticatedRequest, res, next)
    )
  );
  app.use('/api/v1/farmers', farmersRouter);
  app.use('/api/v1/collections', collectionsRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Isolated Demo Workflow Tester',
        role: 'Operations Manager',
        passwordHash: await bcrypt.hash(password, 4),
      },
    });
    testUserId = user.id;

    const unauthorized = await fetch(`${baseUrl}/farmers`);
    assert.equal(unauthorized.status, 401, 'Business APIs must reject requests without a session.');

    const login = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(login.status, 200, 'A valid isolated user can authenticate.');
    const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
    assert.match(login.headers.get('set-cookie') || '', /HttpOnly/i, 'Session cookie must be HttpOnly.');
    assert.ok(cookie.startsWith('dairyos_session='), 'Login must issue a server session cookie.');
    const headers = { 'Content-Type': 'application/json', Cookie: cookie };

    const farmerResponse = await fetch(`${baseUrl}/farmers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Synthetic Demo Farmer',
        village: 'Test Village',
        contactNumber: '9000000001',
        cattleCount: 3,
      }),
    });
    assert.equal(farmerResponse.status, 201, 'Farmer registration must be saved by the backend.');
    const farmerBody = await farmerResponse.json() as { success: boolean; data: { farmerCode: string; name: string } };
    assert.equal(farmerBody.success, true);
    farmerCode = farmerBody.data.farmerCode;
    assert.equal(farmerBody.data.name, 'Synthetic Demo Farmer');

    const farmerSearch = await fetch(`${baseUrl}/farmers?search=9000000001`, { headers: { Cookie: cookie } });
    assert.equal(farmerSearch.status, 200);
    const searchBody = await farmerSearch.json() as { data: Array<{ farmerCode: string }> };
    assert.ok(searchBody.data.some((farmer) => farmer.farmerCode === farmerCode), 'Farmer search must match phone number.');

    const requestId = randomUUID();
    const collectionPayload = {
      requestId,
      farmerId: farmerCode,
      date: new Date().toISOString().slice(0, 10),
      shift: 'Morning',
      centre: 'Test Village Collection Centre',
      quantityLitres: 42.5,
      fat: 4.4,
      snf: 8.6,
      temperatureC: 18,
      testedBy: 'Isolated Demo Test',
    };
    const savedResponse = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify(collectionPayload),
    });
    assert.equal(savedResponse.status, 201, 'Valid milk collection must be accepted.');
    const savedBody = await savedResponse.json() as { success: boolean; data: any };
    assert.equal(savedBody.success, true);
    collectionCode = savedBody.data.collectionCode;
    assert.equal(savedBody.data.quality, 'PASS', 'Server quality decision must match the established threshold.');
    assert.equal(savedBody.data.ratePerLitre, 36.55, 'Server rate must preserve the established FAT/SNF formula.');
    assert.equal(savedBody.data.payableAmount, 1553, 'Server payable must preserve whole-rupee rounding.');

    const receiptResponse = await fetch(`${baseUrl}/notifications/collections/${collectionCode}/slip`, { headers: { Cookie: cookie } });
    assert.equal(receiptResponse.status, 200, 'Receipt lookup must load the requested persisted collection.');
    const receiptBody = await receiptResponse.json() as { data: any };
    assert.equal(receiptBody.data.intake.collectionCode, collectionCode);
    assert.equal(receiptBody.data.intake.volumeLitres, 42.5);
    assert.equal(receiptBody.data.pricing.effectiveRatePerL, 36.55);
    assert.equal(receiptBody.data.pricing.netPayableINR, 1553);
    assert.match(receiptBody.data.pricing.paymentStatus, /no bank transfer confirmed/i);
    assert.equal((await fetch(`${baseUrl}/notifications/collections/unknown-demo-record/slip`, { headers: { Cookie: cookie } })).status, 404,
      'Receipt lookup must not substitute another collection when the requested record is missing.');

    const notificationPreviewResponse = await fetch(`${baseUrl}/notifications/receipt-sms`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collectionCode,
        farmerName: 'Spoofed farmer name',
        volumeLitres: 999,
        payableAmount: 1,
      }),
    });
    assert.equal(notificationPreviewResponse.status, 200);
    const notificationPreview = await notificationPreviewResponse.json() as { simulationOnly: boolean; deliveryStatus: string; messageId: string; content: { smsText: string } };
    notificationMessageId = notificationPreview.messageId;
    assert.equal(notificationPreview.simulationOnly, true, 'Test notifications must not be sent to a provider.');
    assert.equal(notificationPreview.deliveryStatus, 'SIMULATED');
    assert.match(notificationPreview.content.smsText, /Synthetic Demo Farmer/);
    assert.match(notificationPreview.content.smsText, /received 42.5L/);
    assert.match(notificationPreview.content.smsText, /Payable: Rs 1,553/);
    assert.match(notificationPreview.content.smsText, /no bank transfer is confirmed/i);

    const missingNotificationRecord = await fetch(`${baseUrl}/notifications/receipt-sms`, {
      method: 'POST', headers,
      body: JSON.stringify({ collectionCode: 'missing-demo-collection' }),
    });
    assert.equal(missingNotificationRecord.status, 404,
      'Notification preview must require an existing collection and never use demo fallback values.');

    const replay = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify(collectionPayload),
    });
    assert.equal(replay.status, 200, 'Retry with the same request ID should return the original saved record.');
    const replayBody = await replay.json() as { replayed: boolean; data: { id: string } };
    assert.equal(replayBody.replayed, true);
    assert.equal(replayBody.data.id, savedBody.data.id, 'Idempotent retry must not create a second record.');

    const persisted = await prisma.milkCollectionRecord.findMany({ where: { collectionCode } });
    assert.equal(persisted.length, 1, 'Exactly one collection row must persist.');
    const pendingPayment = await prisma.paymentTransaction.findFirst({
      where: { transactionRef: `TXN-AUTO-${collectionCode}` },
    });
    assert.equal(pendingPayment?.status, 'Pending', 'Collection must create an unpaid payable, not a settled bank transfer.');

    const forbiddenCompletedEntry = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        recipientName: 'Synthetic Demo Farmer',
        amount: 1553,
        status: 'Completed',
      }),
    });
    assert.equal(forbiddenCompletedEntry.status, 400, 'Ordinary API writes must not mark payments settled.');

    const payoutSimulation = await fetch(`${baseUrl}/payments/disburse-all-pending`, {
      method: 'POST',
      headers,
    });
    assert.equal(payoutSimulation.status, 200);
    const simulationBody = await payoutSimulation.json() as { simulationOnly: boolean; simulatedCount: number; totalAmountSimulated: number };
    assert.equal(simulationBody.simulationOnly, true, 'Payout endpoint must identify its simulation-only behavior.');
    assert.equal(simulationBody.simulatedCount, 1);
    assert.equal(simulationBody.totalAmountSimulated, 1553);
    const simulationRows = await prisma.paymentTransaction.findMany({
      where: { partyType: 'Farmer', status: 'Simulated', recipientName: { contains: farmerCode } },
    });
    assert.equal(simulationRows.length, 1, 'Simulation must persist a labeled preview entry.');
    assert.match(simulationRows[0].notes, /no bank transfer/i);
    const payableSummary = await fetch(`${baseUrl}/payments/pending-summary`, { headers: { Cookie: cookie } });
    const payableBody = await payableSummary.json() as { data: { totalDisbursed: number; pendingBalance: number } };
    assert.equal(payableBody.data.totalDisbursed, 0, 'Simulation must not reduce verified disbursements.');
    assert.equal(payableBody.data.pendingBalance, 1553, 'Simulation must leave the farmer payable pending.');

    const invalid = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...collectionPayload, requestId: randomUUID(), quantityLitres: 0 }),
    });
    assert.equal(invalid.status, 400, 'Invalid quantity must be rejected by the server.');
    assert.equal(await prisma.milkCollectionRecord.count({ where: { farmerId: farmerCode } }), 1, 'Rejected input must not persist.');

    const reloaded = await fetch(`${baseUrl}/collections?date=${collectionPayload.date}&shift=Morning`, {
      headers: { Cookie: cookie },
    });
    assert.equal(reloaded.status, 200);
    const reloadBody = await reloaded.json() as { data: Array<{ collectionCode: string }> };
    assert.ok(reloadBody.data.some((record) => record.collectionCode === collectionCode), 'Saved collection must be present after refetch.');

    const logout = await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
    assert.equal(logout.status, 200, 'Logout endpoint should complete.');
    const noLongerAuthorized = await fetch(`${baseUrl}/farmers`);
    assert.equal(noLongerAuthorized.status, 401, 'Requests without the cleared session must not access protected APIs.');

    console.log('Demo workflow integration checks passed: login, farmer persistence/search, authoritative collection pricing, idempotent retry, pending payable, validation, refetch and logout.');
  } finally {
    if (collectionCode) {
      await prisma.auditLogEntry.deleteMany({ where: { recordId: collectionCode } });
      await prisma.paymentTransaction.deleteMany({ where: { transactionRef: `TXN-AUTO-${collectionCode}` } });
      await prisma.milkCollectionRecord.deleteMany({ where: { collectionCode } });
    }
    if (notificationMessageId) await prisma.auditLogEntry.deleteMany({ where: { recordId: notificationMessageId } });
    if (farmerCode) {
      await prisma.paymentTransaction.deleteMany({ where: { status: 'Simulated', recipientName: { contains: farmerCode } } });
      await prisma.auditLogEntry.deleteMany({ where: { action: 'BATCH_PAYOUT_SIMULATION', recordId: `BATCH-SIM-${new Date().toISOString().slice(0, 10)}` } });
    }
    if (farmerCode) await prisma.farmer.deleteMany({ where: { farmerCode } });
    if (testUserId) await prisma.user.deleteMany({ where: { id: testUserId } });
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Demo workflow integration checks failed:', error);
  process.exitCode = 1;
});
