import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const metricsRouter = Router();

// GET high-level operations tower metrics aggregated from DB
metricsRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const [
      totalFarmers,
      activeFarmers,
      totalCattle,
      milkingCattle,
      tanks,
      collections,
    ] = await Promise.all([
      prisma.farmer.count(),
      prisma.farmer.count({ where: { status: 'Active' } }),
      prisma.cattle.count(),
      prisma.cattle.count({ where: { status: 'Milking' } }),
      prisma.chillingTank.findMany(),
      prisma.milkCollectionRecord.findMany(),
    ]);

    // Herd production estimate
    const milkingHerd = await prisma.cattle.findMany({ where: { status: 'Milking' } });
    const herdDailyYieldLitres = Math.round(milkingHerd.reduce((acc, c) => acc + c.milkYieldLPerDay, 0));

    // Procurement volume
    const totalProcuredLitres = Math.round(collections.reduce((acc, c) => acc + c.quantityLitres, 0));
    const totalPayables = Math.round(collections.reduce((acc, c) => acc + c.payableAmount, 0));

    // Silo capacity
    const totalSiloVolume = Math.round(tanks.reduce((acc, t) => acc + t.currentVolumeLitres, 0));
    const totalSiloCapacity = Math.round(tanks.reduce((acc, t) => acc + t.capacityLitres, 0));

    res.json({
      success: true,
      data: {
        farmers: {
          total: totalFarmers,
          active: activeFarmers,
        },
        cattle: {
          total: totalCattle,
          milking: milkingCattle,
          dailyYieldL: herdDailyYieldLitres,
        },
        procurement: {
          totalLitres: totalProcuredLitres,
          totalPayables: totalPayables,
          avgRatePerL: totalProcuredLitres > 0 ? +(totalPayables / totalProcuredLitres).toFixed(2) : 38.25,
        },
        silos: {
          totalVolume: totalSiloVolume,
          totalCapacity: totalSiloCapacity,
          utilizationPct: totalSiloCapacity > 0 ? +((totalSiloVolume / totalSiloCapacity) * 100).toFixed(1) : 0,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
