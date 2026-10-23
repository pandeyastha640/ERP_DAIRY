import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const collectionsRouter = Router();

// GET all collections with date and shift filter
collectionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { date, shift, centre } = req.query;
    const where: any = {};

    if (date && typeof date === 'string') {
      where.date = date;
    }

    if (shift && typeof shift === 'string' && shift !== 'All') {
      where.shift = shift;
    }

    if (centre && typeof centre === 'string') {
      where.centre = centre;
    }

    const collections = await prisma.milkCollectionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalLitres = collections.reduce((acc, c) => acc + c.quantityLitres, 0);
    const totalPayable = collections.reduce((acc, c) => acc + c.payableAmount, 0);

    res.json({
      success: true,
      count: collections.length,
      summary: {
        totalLitres: +totalLitres.toFixed(1),
        totalPayable: Math.round(totalPayable),
        avgRate: totalLitres > 0 ? +(totalPayable / totalLitres).toFixed(2) : 0,
      },
      data: collections,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST record new milk collection (Atomic Transaction)
collectionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      farmerId,
      requestId,
      date,
      shift,
      centre,
      quantityLitres,
      fat,
      snf,
      temperatureC,
      testedBy,
    } = req.body;

    const q = Number(quantityLitres);
    const f = Number(fat);
    const s = Number(snf);
    const t = Number(temperatureC);
    const collectionDate = typeof date === 'string' && date ? date : new Date().toISOString().slice(0, 10);

    if (typeof farmerId !== 'string' || !farmerId.trim()) {
      return res.status(400).json({ success: false, message: 'Select a valid farmer.' });
    }
    if (!Number.isFinite(q) || q <= 0 || q > 10000) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0 and no more than 10,000 litres.' });
    }
    if (!Number.isFinite(f) || f < 0 || f > 15 || !Number.isFinite(s) || s < 0 || s > 15) {
      return res.status(400).json({ success: false, message: 'FAT and SNF readings must be between 0 and 15.' });
    }
    if (!Number.isFinite(t) || t < -5 || t > 60) {
      return res.status(400).json({ success: false, message: 'Temperature must be between -5°C and 60°C.' });
    }
    if (shift !== undefined && shift !== 'Morning' && shift !== 'Evening') {
      return res.status(400).json({ success: false, message: 'Shift must be Morning or Evening.' });
    }
    const parsedCollectionDate = new Date(`${collectionDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(collectionDate)
      || Number.isNaN(parsedCollectionDate.getTime())
      || parsedCollectionDate.toISOString().slice(0, 10) !== collectionDate) {
      return res.status(400).json({ success: false, message: 'Collection date must use YYYY-MM-DD.' });
    }
    if (requestId !== undefined && (typeof requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(requestId))) {
      return res.status(400).json({ success: false, message: 'Collection request identifier is invalid.' });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { farmerCode: farmerId },
    });

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    // Two-Axis Pricing Formula
    const isFail = f < 3.2 || s < 7.8 || t > 24.0;
    const isWarn = !isFail && (t > 20.0 || f < 3.8);
    const quality = isFail ? 'FAIL' : isWarn ? 'WARNING' : 'PASS';

    const rate = isFail ? 0 : Math.max(0, +(34.5 + (f - 4.0) * 4.5 + (s - 8.5) * 2.5).toFixed(2));
    const payableAmount = Math.round(q * rate);

    const now = new Date();
    const collectionCode = requestId
      ? `CC-01-${requestId}`
      : `CC-01-${now.getHours()}H-${Math.floor(100 + Math.random() * 900)}`;
    const existingRequest = await prisma.milkCollectionRecord.findUnique({ where: { collectionCode } });
    if (existingRequest) {
      const sameSubmission = existingRequest.farmerId === farmer.farmerCode
        && existingRequest.date === collectionDate
        && existingRequest.shift === (shift || 'Morning')
        && existingRequest.centre === (centre || 'Anand Collection Centre')
        && existingRequest.quantityLitres === q
        && existingRequest.fat === f
        && existingRequest.snf === s
        && existingRequest.temperatureC === t;
      if (!sameSubmission) {
        return res.status(409).json({ success: false, message: 'This collection request identifier was already used for different readings.' });
      }
      return res.status(200).json({ success: true, replayed: true, data: existingRequest });
    }

    // Atomic transaction execution
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Collection Record
      const collection = await tx.milkCollectionRecord.create({
        data: {
          collectionCode,
          farmerId: farmer.farmerCode,
          farmerName: farmer.name,
          date: collectionDate,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shift: shift || 'Morning',
          centre: centre || 'Anand Collection Centre',
          quantityLitres: q,
          fat: f,
          snf: s,
          temperatureC: t,
          quality,
          ratePerLitre: rate,
          payableAmount,
          testedBy: testedBy || 'QC Lab Desk',
        },
      });

      // 2. Create pending payment transaction if payable > 0
      if (payableAmount > 0) {
        await tx.paymentTransaction.create({
          data: {
            transactionRef: `TXN-AUTO-${collection.collectionCode}`,
            recipientName: `${farmer.name} (${farmer.farmerCode})`,
            partyType: 'Farmer',
            milkLitres: q,
            amount: payableAmount,
            paymentDate: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            paymentMethod: 'Direct Bank IMPS',
            status: 'Pending',
            notes: `${shift || 'Morning'} shift milk inward clearance @ ₹${rate}/L`,
          },
        });
      }

      // 3. Update chilling tank volume if passed
      if (quality !== 'FAIL') {
        const tank = await tx.chillingTank.findFirst({
          where: { tankCode: 'TANK-B' },
        });
        if (tank) {
          await tx.chillingTank.update({
            where: { id: tank.id },
            data: {
              currentVolumeLitres: Math.min(tank.capacityLitres, tank.currentVolumeLitres + Math.round(q)),
            },
          });
        }
      }

      // 4. Log Audit Trail
      await tx.auditLogEntry.create({
        data: {
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userName: 'System Collection Service',
          userRole: 'Field Staff',
          module: 'Milk Collection',
          action: 'COLLECTION_RECORDED',
          recordId: collection.collectionCode,
          description: `Received ${q} L from ${farmer.name} (${farmer.farmerCode}) [${quality}]`,
          financialImpact: `+₹${payableAmount.toLocaleString()} generated`,
          milkImpactLitres: q,
          severity: quality === 'FAIL' ? 'warning' : 'info',
        },
      });

      return collection;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'This collection may already be recorded. Refresh the history before retrying.' });
    }
    res.status(500).json({ success: false, message: 'Could not save milk collection. Please retry.' });
  }
});
