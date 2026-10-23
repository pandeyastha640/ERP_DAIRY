import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { farmersRouter } from './routes/farmers';
import { cattleRouter } from './routes/cattle';
import { collectionsRouter } from './routes/collections';
import { chillingRouter } from './routes/chilling';
import { processingRouter } from './routes/processing';
import { salesRouter } from './routes/sales';
import { paymentsRouter } from './routes/payments';
import { metricsRouter } from './routes/metrics';
import { iotRouter } from './routes/iot';
import { aiRouter } from './routes/ai';
import { qualityRouter } from './routes/quality';
import { notificationsRouter } from './routes/notifications';
import { federationRouter } from './routes/federation';
import { prisma } from './prisma';
import { connectMongo, disconnectMongo, isMongoConnected } from './mongodb';
import { authenticate, authorizeApiRequest, AuthenticatedRequest, validateAuthConfiguration } from './middleware/auth';

dotenv.config();
validateAuthConfiguration();

const app = express();
const PORT = process.env.PORT || 5000;
const configuredCorsOrigins = new Set(
  (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)
);

// Security & Utility Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    const localDevelopmentOrigin = process.env.NODE_ENV !== 'production' &&
      Boolean(origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
    callback(null, !origin || configuredCorsOrigins.has(origin) || localDevelopmentOrigin);
  },
}));
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buffer) => {
    (req as AuthenticatedRequest).rawBody = Buffer.from(buffer);
  },
}));

// Lightweight production request performance logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/healthz' && req.path !== '/ready') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Liveness & Readiness Probes for Kubernetes / Docker / Cloud Run
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'READY',
      database: 'CONNECTED',
      mongodb: isMongoConnected() ? 'CONNECTED' : (process.env.MONGODB_URI ? 'CONNECTING_OR_FAILED' : 'STANDBY (Local SQLite Mode)'),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: +(process.memoryUsage().rss / 1024 / 1024).toFixed(1),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});


// API Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);

// Every business API requires a valid server-issued session and a server-side role policy.
// The payment callback is exempt from browser sessions and verifies its provider HMAC itself.
app.use('/api/v1', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/payments/webhook') return next();
  return authenticate(req as AuthenticatedRequest, res, () =>
    authorizeApiRequest(req as AuthenticatedRequest, res, next)
  );
});

app.use('/api/v1/farmers', farmersRouter);
app.use('/api/v1/cattle', cattleRouter);
app.use('/api/v1/collections', collectionsRouter);
app.use('/api/v1/chilling', chillingRouter);
app.use('/api/v1/processing', processingRouter);
app.use('/api/v1/sales', salesRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/quality', qualityRouter);
app.use('/api/v1/metrics', metricsRouter);
app.use('/api/v1/iot', iotRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/federation', federationRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'DairyOS Enterprise ERP API Server',
    status: 'ACTIVE',
    version: '1.0.0',
    endpoints: [
      '/api/v1/health',
      '/api/v1/auth/login',
      '/api/v1/farmers',
      '/api/v1/cattle',
      '/api/v1/collections',
      '/api/v1/chilling/tanks',
      '/api/v1/chilling/reconciliation',
      '/api/v1/processing/batches',
      '/api/v1/sales/orders',
      '/api/v1/payments',
      '/api/v1/payments/pending-summary',
      '/api/v1/metrics/summary',
      '/api/v1/iot/devices',
      '/api/v1/iot/lactoscan',
      '/api/v1/ai/forecast-procurement',
      '/api/v1/ai/optimize-feed',
      '/api/v1/ai/analyze-anomalies',
    ],
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, async () => {
  console.log(`🚀 DairyOS Backend API running on http://localhost:${PORT}`);
  try {
    await connectMongo();
  } catch (err: any) {
    console.warn(`[MongoDB Startup Notice]: ${err.message}`);
  }
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    try {
      await disconnectMongo();
      await prisma.$disconnect();
      console.log('✅ Prisma & MongoDB clients disconnected. Server closed cleanly.');
      process.exit(0);
    } catch (e: any) {
      console.error('Error disconnecting database clients:', e.message);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


export default app;
