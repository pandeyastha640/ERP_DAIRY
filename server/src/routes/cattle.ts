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
