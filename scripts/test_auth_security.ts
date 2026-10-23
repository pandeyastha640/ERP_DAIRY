import 'dotenv/config';
import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authRouter } from '../server/src/routes/auth';
import { paymentsRouter } from '../server/src/routes/payments';
import { prisma } from '../server/src/prisma';
import { assertIsolatedTestDatabase } from './assertIsolatedTestDatabase';
import {
  authenticate,
  authorizeApiRequest,
  isDemoAuthEnabled,
  validateAuthConfiguration,
} from '../server/src/middleware/auth';

async function main() {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./r0-security.db';
  assert.doesNotThrow(assertIsolatedTestDatabase, 'The isolated R0 test database path should be accepted.');
  process.env.NODE_ENV = 'production';
  assert.throws(assertIsolatedTestDatabase, /DATABASE_URL=file:\.\/test\.db/);
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./dev.db';
  assert.throws(assertIsolatedTestDatabase, /DATABASE_URL=file:\.\/test\.db/);
  process.env.DATABASE_URL = 'file:..\/production-r0.db';
  assert.throws(assertIsolatedTestDatabase, /DATABASE_URL=file:\.\/test\.db/);
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  assertIsolatedTestDatabase();
  assert.throws(() => validateAuthConfiguration({ NODE_ENV: 'production' }), /JWT_SECRET must be configured/);
  assert.throws(() => validateAuthConfiguration({ NODE_ENV: 'production', JWT_SECRET: 'replace-this-with-a-long-placeholder-secret' }), /unique production secret/);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: 'production', JWT_SECRET: 'x'.repeat(40), DEMO_AUTH_ENABLED: 'true' }), false);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: 'development', JWT_SECRET: 'x'.repeat(40) }), false);
  assert.equal(isDemoAuthEnabled({ NODE_ENV: 'development', JWT_SECRET: 'x'.repeat(40), DEMO_AUTH_ENABLED: 'true' }), true);

  const email = process.env.TEST_AUTH_EMAIL || 'operations.manager@dairyos.enterprise';
  const password = process.env.TEST_AUTH_PASSWORD || process.env.SEED_DEMO_PASSWORD;
  assert.ok(password, 'Set TEST_AUTH_PASSWORD for an isolated seeded test account.');
  assert.notEqual(password, 'password123', 'Use a test account password that differs from the old shared demo fallback.');

  const app = express();
  app.use(express.json({
    verify: (req, _res, buffer) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
    },
  }));
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/payments/webhook') return next();
    return authenticate(req, res, () => authorizeApiRequest(req, res, next));
  });
  app.get('/api/v1/farmers', (_req, res) => res.json({ success: true }));
  app.post('/api/v1/collections', (_req, res) => res.status(201).json({ success: true }));
  app.get('/api/v1/metrics/summary', (_req, res) => res.json({ success: true }));
  app.use('/api/v1/payments', paymentsRouter);

  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
  const secret = process.env.JWT_SECRET!;

  try {
    const noSession = await fetch(`${baseUrl}/farmers`);
    assert.equal(noSession.status, 401, 'Business API calls must reject requests without a session.');

    const invalidSession = await fetch(`${baseUrl}/farmers`, {
      headers: { Cookie: 'dairyos_session=invalid-token' },
    });
    assert.equal(invalidSession.status, 401, 'Business API calls must reject an invalid session cookie.');

    const oldFallbackPassword = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    assert.equal(oldFallbackPassword.status, 401, 'The old shared password must not bypass the stored password hash.');

    delete process.env.DEMO_AUTH_ENABLED;
    const disabledSampleLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(disabledSampleLogin.status, 403, 'Sample accounts must be disabled unless development demo auth is explicitly enabled.');

    const demoResponse = await fetch(`${baseUrl}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'CEO' }),
    });
    process.env.DEMO_AUTH_ENABLED = 'true';
    assert.equal(demoResponse.status, 404, 'Demo role switching must be disabled unless explicitly enabled in development.');

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(loginResponse.status, 200, 'A valid seeded test account must establish a session.');
    const loginBody = await loginResponse.json() as { success: boolean; user: { role: string }; token?: string };
    const sessionCookieHeader = loginResponse.headers.get('set-cookie') || '';
    const sessionCookie = sessionCookieHeader.split(';')[0];
    assert.equal(loginBody.success, true);
    assert.equal('token' in loginBody, false, 'Browser session tokens must not be returned to JavaScript.');
    assert.match(sessionCookieHeader, /HttpOnly/i);
    assert.match(sessionCookieHeader, /SameSite=Strict/i);
    assert.match(sessionCookieHeader, /Path=\/api\/v1/i);

    const sessionRead = await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: sessionCookie } });
    assert.equal(sessionRead.status, 200, 'A server-issued cookie must resolve to a server-side user record.');
    const allowedRead = await fetch(`${baseUrl}/farmers`, { headers: { Cookie: sessionCookie } });
    assert.equal(allowedRead.status, 200, 'Operations Manager may read the farmers directory.');

    const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert.equal(logoutResponse.status, 200, 'Logout must clear the browser session cookie.');
    assert.match(logoutResponse.headers.get('set-cookie') || '', /dairyos_session=;/i);
    assert.match(logoutResponse.headers.get('set-cookie') || '', /Expires=Thu, 01 Jan 1970/i);

    const financeToken = jwt.sign({ id: 'finance-test', email: 'finance@test.invalid', name: 'Finance Test', role: 'Finance Manager' }, secret, { expiresIn: '5m' });
    const deniedWrite = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(deniedWrite.status, 403, 'Finance Manager must not create collection records.');

    const fieldStaffToken = jwt.sign({ id: 'field-test', email: 'field@test.invalid', name: 'Field Test', role: 'Field Staff' }, secret, { expiresIn: '5m' });
    const allowedCollection = await fetch(`${baseUrl}/collections`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${fieldStaffToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(allowedCollection.status, 201, 'Field Staff may submit collection records.');

    const farmerToken = jwt.sign({ id: 'farmer-test', email: 'farmer@test.invalid', name: 'Farmer Test', role: 'Farmer' }, secret, { expiresIn: '5m' });
    const deniedFarmerRead = await fetch(`${baseUrl}/farmers`, { headers: { Authorization: `Bearer ${farmerToken}` } });
    assert.equal(deniedFarmerRead.status, 403, 'Farmer API access remains denied until records can be scoped to that farmer.');

    const priorWebhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    process.env.PAYMENT_WEBHOOK_SECRET = '';
    const unsignedWebhook = await fetch(`${baseUrl}/payments/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'unsigned-test', event: 'payout.processed' }),
    });
    if (priorWebhookSecret === undefined) delete process.env.PAYMENT_WEBHOOK_SECRET;
    else process.env.PAYMENT_WEBHOOK_SECRET = priorWebhookSecret;
    assert.equal(unsignedWebhook.status, 503, 'Unsigned payment callbacks must fail closed when no HMAC secret is configured.');

    process.env.PAYMENT_WEBHOOK_SECRET = 'r0-isolated-test-payment-hook-secret';
    const invalidSignatureWebhook = await fetch(`${baseUrl}/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': '00'.repeat(32),
      },
      body: JSON.stringify({ id: 'invalid-signature-test', event: 'payout.processed' }),
    });
    if (priorWebhookSecret === undefined) delete process.env.PAYMENT_WEBHOOK_SECRET;
    else process.env.PAYMENT_WEBHOOK_SECRET = priorWebhookSecret;
    assert.equal(invalidSignatureWebhook.status, 401, 'Payment callbacks with an invalid HMAC must be rejected.');

    const expiredToken = jwt.sign({ id: 'expired-test', email: 'expired@test.invalid', name: 'Expired Test', role: 'Operations Manager' }, secret, { expiresIn: -1 });
    const expiredSession = await fetch(`${baseUrl}/farmers`, {
      headers: { Cookie: `dairyos_session=${expiredToken}` },
    });
    assert.equal(expiredSession.status, 401, 'Expired sessions must not authorize API requests.');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  }

  console.log('Authentication security regression checks passed.');
}

main().catch((error) => {
  console.error('Authentication security regression checks failed:', error);
  process.exitCode = 1;
});
