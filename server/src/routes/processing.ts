import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const processingRouter = Router();

// GET /api/v1/processing/batches
processingRouter.get('/batches', async (req: Request, res: Response) => {
  try {
    const batches = await prisma.processingBatch.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, count: batches.length, data: batches });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/processing/batches
processingRouter.post('/batches', async (req: Request, res: Response) => {
  try {
    const {
      batchId,
      date = new Date().toISOString().split('T')[0],
      pasteurizerLine = 'Continuous HTST Line 1',
      inputMilkLitres,
      inputFatPct = 4.2,
      inputSnfPct = 8.6,
      yieldPercentage = 98.2,
      wastageLitres = 18.0,
      processingCostTotal = 5850,
      status = 'In Progress',
      startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completionTime = '11:30 AM',
      operator = 'Rakesh Parmar',
      siloId,
      packagingItemCode,
      packagingQtyUsed,
    } = req.body;

    const volumeToDeduct = Number(inputMilkLitres);
    if (!volumeToDeduct || volumeToDeduct <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid positive inputMilkLitres is required',
      });
    }

    const assignedBatchId = batchId || `BATCH-${Math.floor(100 + Math.random() * 900)}`;

    // Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Locate source tank or default to largest tank
      let tank = null;
      if (siloId) {
        tank = await tx.chillingTank.findUnique({ where: { tankCode: siloId } });
      }
      if (!tank) {
        tank = await tx.chillingTank.findFirst({
          where: { currentVolumeLitres: { gte: volumeToDeduct } },
          orderBy: { currentVolumeLitres: 'desc' },
        });
      }

      if (!tank) {
        throw new Error(`No chilling tank has sufficient volume to supply ${volumeToDeduct} L milk.`);
      }

      if (tank.currentVolumeLitres < volumeToDeduct) {
        throw new Error(`Silo ${tank.name} has only ${tank.currentVolumeLitres} L, but ${volumeToDeduct} L is requested.`);
      }

      // 2. Deduct milk from Silo
      const updatedTank = await tx.chillingTank.update({
        where: { id: tank.id },
        data: {
          currentVolumeLitres: Math.max(0, tank.currentVolumeLitres - volumeToDeduct),
        },
      });

      // 3. Create Processing Batch
      const batch = await tx.processingBatch.create({
        data: {
          batchId: assignedBatchId,
          date,
          pasteurizerLine,
          inputMilkLitres: volumeToDeduct,
          inputFatPct: Number(inputFatPct),
          inputSnfPct: Number(inputSnfPct),
          yieldPercentage: Number(yieldPercentage),
          wastageLitres: Number(wastageLitres),
          processingCostTotal: Number(processingCostTotal),
          status,
          startTime,
          completionTime,
          operator,
        },
      });

      // 4. If packaging deduction specified
      let updatedPackaging = null;
      if (packagingItemCode && packagingQtyUsed) {
        const pkg = await tx.packagingItem.findUnique({ where: { itemCode: packagingItemCode } });
        if (pkg) {
          const qty = Number(packagingQtyUsed);
          updatedPackaging = await tx.packagingItem.update({
            where: { id: pkg.id },
            data: {
              consumed: pkg.consumed + qty,
              closingStock: Math.max(0, pkg.closingStock - qty),
            },
          });
        }
      }

      // 5. Audit Log Entry
      const audit = await tx.auditLogEntry.create({
        data: {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userName: operator,
          userRole: 'Plant Manager',
          module: 'Processing',
          action: 'BATCH_LAUNCH',
          recordId: assignedBatchId,
          description: `Dispatched ${volumeToDeduct}L raw milk from ${tank.name} to ${pasteurizerLine}.`,
          financialImpact: `₹${processingCostTotal.toLocaleString('en-IN')} committed`,
          milkImpactLitres: -volumeToDeduct,
          severity: 'info',
        },
      });

      return { batch, updatedTank, updatedPackaging, audit };
    });

    return res.status(201).json({
      success: true,
      message: 'Processing batch successfully initiated with mass balance deduction',
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to launch processing batch',
    });
  }
});
