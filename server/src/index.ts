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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Liveness & Readiness Probes for Kubernetes / Docker
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'READY',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: +(process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
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

app.listen(PORT, () => {
  console.log(`🚀 DairyOS Backend API running on http://localhost:${PORT}`);
});

export default app;
