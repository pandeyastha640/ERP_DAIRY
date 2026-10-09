import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const chillingRouter = Router();

// GET /api/v1/chilling/tanks
chillingRouter.get('/tanks', async (req: Request, res: Response) => {
  try {
    const tanks = await prisma.chillingTank.findMany({
      orderBy: { tankCode: 'asc' },
    });

    const totalCapacity = tanks.reduce((acc, t) => acc + t.capacityLitres, 0);
    const totalVolume = tanks.reduce((acc, t) => acc + t.currentVolumeLitres, 0);

    res.json({
      success: true,
      summary: {
        totalCapacity,
        totalVolume,
        utilizationPct: totalCapacity > 0 ? +((totalVolume / totalCapacity) * 100).toFixed(1) : 0,
        averageTempC: tanks.length > 0 ? +(tanks.reduce((acc, t) => acc + t.temperatureC, 0) / tanks.length).toFixed(1) : 4.0,
      },
      data: tanks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/chilling/tanks/:id/transfer
chillingRouter.post('/tanks/:id/transfer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetTankId, litres, operator = 'Silo Operator' } = req.body;

    const transferVolume = Number(litres);
    if (!transferVolume || transferVolume <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive litres required' });
    }

    if (!targetTankId) {
      return res.status(400).json({ success: false, message: 'Target tank ID is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find source tank
      const source = await tx.chillingTank.findFirst({
        where: { OR: [{ id }, { tankCode: id }] },
      });
      if (!source) throw new Error(`Source tank ${id} not found.`);
      if (source.currentVolumeLitres < transferVolume) {
        throw new Error(`Insufficient volume in ${source.name}. Available: ${source.currentVolumeLitres}L, requested: ${transferVolume}L.`);
      }

      // Find target tank
      const target = await tx.chillingTank.findFirst({
        where: { OR: [{ id: targetTankId }, { tankCode: targetTankId }] },
      });
      if (!target) throw new Error(`Target tank ${targetTankId} not found.`);

      const availableHeadroom = target.capacityLitres - target.currentVolumeLitres;
      if (availableHeadroom < transferVolume) {
        throw new Error(`Target tank ${target.name} cannot accommodate ${transferVolume}L. Available headroom: ${availableHeadroom}L.`);
      }

      // Perform transfer
      const updatedSource = await tx.chillingTank.update({
        where: { id: source.id },
        data: { currentVolumeLitres: source.currentVolumeLitres - transferVolume },
      });

      const updatedTarget = await tx.chillingTank.update({
        where: { id: target.id },
        data: { currentVolumeLitres: target.currentVolumeLitres + transferVolume },
      });

      // Audit Log
      await tx.auditLogEntry.create({
        data: {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userName: operator,
          userRole: 'Operations Manager',
          module: 'Chilling & Silos',
          action: 'INTER_TANK_TRANSFER',
          recordId: `${source.tankCode}->${target.tankCode}`,
          description: `Transferred ${transferVolume}L cold milk from ${source.name} to ${target.name}`,
          milkImpactLitres: 0,
          severity: 'info',
        },
      });

      return { source: updatedSource, target: updatedTarget, transferVolume };
    });

    res.json({
      success: true,
      message: `Successfully transferred ${transferVolume}L from ${result.source.name} to ${result.target.name}`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/v1/chilling/reconciliation
// Automated Mass Balance Volumetric Reconciliation Engine
chillingRouter.get('/reconciliation', async (req: Request, res: Response) => {
  try {
    // 1. Inward Farmer Milk Collections
    const collections = await prisma.milkCollectionRecord.aggregate({
      _sum: { quantityLitres: true },
    });
    const farmerProcurementL = collections._sum.quantityLitres || 0;

    // 2. Herd Own Farm Yield (estimated from cattle dailyYield)
    const cattleCount = await prisma.cattle.aggregate({
      _sum: { milkYieldLPerDay: true },
    });
    const herdDailyYieldL = cattleCount._sum.milkYieldLPerDay || 550;

    // 3. Processing Outflow (milk deducted to processing lines)
    const batches = await prisma.processingBatch.aggregate({
      _sum: { inputMilkLitres: true, wastageLitres: true },
    });
    const processingInputL = batches._sum.inputMilkLitres || 0;
    const processWastageL = batches._sum.wastageLitres || 0;

    // 4. Current Physical Silo Inventory
    const tanks = await prisma.chillingTank.findMany();
    const physicalStockL = tanks.reduce((acc, t) => acc + t.currentVolumeLitres, 0);

    // 5. Mass Balance Theoretical Formula:
    // Opening Baseline + Herd + Farmers - Processed - Washing/CIP Spillage (~12L)
    const baselineOpeningStockL = 9000;
    const estimatedSpillageL = 14.5;
    const theoreticalStockL = +(baselineOpeningStockL + herdDailyYieldL + farmerProcurementL - processingInputL - estimatedSpillageL).toFixed(1);

    // Physical Discrepancy
    const discrepancyLitres = +(physicalStockL - theoreticalStockL).toFixed(1);
    const variancePercentage = theoreticalStockL > 0
      ? +((Math.abs(discrepancyLitres) / theoreticalStockL) * 100).toFixed(2)
      : 0;

    const isWithinTolerance = variancePercentage <= 0.50; // Enterprise threshold is 0.5%
    const status = isWithinTolerance ? 'BALANCED' : 'VARIANCE_WARNING';

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
      formula: 'Closing Physical = Opening + Herd + Farmer Procurement - Processing Outflow - Line Loss',
      data: {
        openingStockL: baselineOpeningStockL,
        inflow: {
          herdYieldL: herdDailyYieldL,
          farmerProcurementL,
          totalInflowL: +(herdDailyYieldL + farmerProcurementL).toFixed(1),
        },
        outflow: {
          processingBatchesL: processingInputL,
          processWastageL,
          pipingAndCIPLossL: estimatedSpillageL,
          totalOutflowL: +(processingInputL + estimatedSpillageL).toFixed(1),
        },
        theoreticalStockL,
        physicalStockL,
        discrepancyLitres,
        variancePercentage,
        toleranceThresholdPct: 0.5,
        isWithinTolerance,
        auditAlert: !isWithinTolerance
          ? `Discrepancy of ${Math.abs(discrepancyLitres)}L (${variancePercentage}%) exceeds allowed 0.5% mass-balance tolerance.`
          : 'Mass balance fully verified within ISO 22000 volumetric tolerance.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
