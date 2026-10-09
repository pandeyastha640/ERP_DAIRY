import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

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
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});
