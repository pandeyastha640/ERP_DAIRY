import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const cattleRouter = Router();

// GET all cattle herd records
cattleRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, breed } = req.query;
    const where: any = {};

    if (status && typeof status === 'string' && status !== 'All') {
      where.status = status;
    }

    if (breed && typeof breed === 'string' && breed !== 'All') {
      where.breed = breed;
    }

    const cattle = await prisma.cattle.findMany({
      where,
      orderBy: { tagNumber: 'asc' },
    });

    res.json({
      success: true,
      count: cattle.length,
      data: cattle,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST enroll new cattle
cattleRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tagNumber,
      breed,
      ageYears,
      lactation,
      lactationStage,
      milkYieldLPerDay,
      feedCostPerDay,
      health,
      status,
      shedLocation,
      dailyFeedKg,
    } = req.body;

    const count = await prisma.cattle.count();
    const tag = tagNumber || `TAG-${2000 + count + 1}`;

    const newCow = await prisma.cattle.create({
      data: {
        tagNumber: tag,
        breed: breed || 'Gir',
        ageYears: parseInt(ageYears) || 4,
        lactation: parseInt(lactation) || 2,
        lactationStage: lactationStage || 'Mid',
        milkYieldLPerDay: parseFloat(milkYieldLPerDay) || 12.5,
        feedCostPerDay: parseFloat(feedCostPerDay) || 190.0,
        health: health || 'Healthy',
        status: status || 'Milking',
        shedLocation: shedLocation || 'Shed A-Row 1',
        dailyFeedKg: parseFloat(dailyFeedKg) || 28.0,
      },
    });

    res.status(201).json({ success: true, data: newCow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/cattle/reproduction
// Retrieve livestock estrus, AI, PD check, and calving records
cattleRouter.get('/reproduction', async (req: Request, res: Response) => {
  try {
    const { tagNumber } = req.query;
    const where: any = {};
    if (tagNumber && typeof tagNumber === 'string') {
      where.cattleTag = tagNumber;
    }

    const records = await prisma.cattleReproductionRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/cattle/reproduction
// Log an AI breeding, estrus, or pregnancy check event
cattleRouter.post('/reproduction', async (req: Request, res: Response) => {
  try {
    const {
      cattleTag,
      eventType = 'Insemination',
      eventDate = new Date().toISOString().split('T')[0],
      semenStrawCode = 'GIR-BULL-904',
      bullBreed = 'Pure Gir (Pedigree)',
      pdStatus = 'Pending',
      inseminatorName = 'Dr. R. K. Sharma (AI Officer)',
      notes = 'Standard morning artificial insemination.',
    } = req.body;

    if (!cattleTag) {
      return res.status(400).json({ success: false, message: 'cattleTag is required' });
    }

    // Gestation Calculation: Standard bovine gestation is 280 days
    const eventTime = new Date(eventDate).getTime();
    const expectedCalvingTime = new Date(eventTime + 280 * 24 * 60 * 60 * 1000);
    const expectedCalvingDate = expectedCalvingTime.toISOString().split('T')[0];

    const record = await prisma.cattleReproductionRecord.create({
      data: {
        cattleTag,
        eventType,
        eventDate,
        semenStrawCode,
        bullBreed,
        pdStatus,
        expectedCalvingDate: eventType === 'Insemination' ? expectedCalvingDate : '',
        inseminatorName,
        notes,
      },
    });

    if (eventType === 'Insemination') {
      await prisma.cattle.updateMany({
        where: { tagNumber: cattleTag },
        data: { status: 'Milking' },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reproduction & Breeding event recorded',
      data: record,
      milestones: {
        pdCheckDue: new Date(eventTime + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dryOffDue: new Date(eventTime + 220 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedCalvingDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/cattle/vaccinations
// List animal vaccinations and upcoming booster schedules
cattleRouter.get('/vaccinations', async (req: Request, res: Response) => {
  try {
    const { cattleTag } = req.query;
    const where: any = {};
    if (cattleTag && typeof cattleTag === 'string') {
      where.cattleTag = cattleTag;
    }

    const records = await prisma.vaccinationRecord.findMany({
      where,
      orderBy: { vaccinationDate: 'desc' },
    });

    res.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/cattle/vaccinations
// Record administered vaccination
cattleRouter.post('/vaccinations', async (req: Request, res: Response) => {
  try {
    const {
      cattleTag,
      diseaseName = 'FMD (Foot-and-Mouth Disease)',
      vaccinationDate = new Date().toISOString().split('T')[0],
      boosterMonths = 6,
      veterinarianName = 'Dr. K. V. Patel, BVSc',
      batchNumber = 'VAC-FMD-2026',
      status = 'Administered',
    } = req.body;

    if (!cattleTag) {
      return res.status(400).json({ success: false, message: 'cattleTag is required' });
    }

    const vacTime = new Date(vaccinationDate).getTime();
    const boosterDueDate = new Date(vacTime + boosterMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const record = await prisma.vaccinationRecord.create({
      data: {
        cattleTag,
        diseaseName,
        vaccinationDate,
        boosterDueDate,
        veterinarianName,
        batchNumber,
        status,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vaccination record logged',
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
