import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { isMongoConnected } from '../mongodb';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Database connectivity probe
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'DairyOS Enterprise Backend',
      version: '1.0.0',
      database: 'Connected',
      mongodb: isMongoConnected() ? 'Connected' : (process.env.MONGODB_URI ? 'Connecting or Failed' : 'Standby (Local SQLite Mode)'),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

