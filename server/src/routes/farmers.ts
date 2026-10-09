import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const farmersRouter = Router();

// GET all farmers with optional cluster and status filtering
farmersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, village, search } = req.query;
    const where: any = {};

    if (status && typeof status === 'string' && status !== 'All') {
      where.status = status;
    }

    if (village && typeof village === 'string' && village !== 'All') {
      where.village = village;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { farmerCode: { contains: search } },
        { village: { contains: search } },
      ];
    }

    const farmers = await prisma.farmer.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single farmer by code
farmersRouter.get('/:code', async (req: Request, res: Response) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { farmerCode: req.params.code },
      include: {
        collections: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    res.json({ success: true, data: farmer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST register new farmer
farmersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, village, contactNumber, cattleCount, bankAccount, ifscCode } = req.body;

    if (!name || !village) {
      return res.status(400).json({ success: false, message: 'Name and village are required' });
    }

    const totalFarmers = await prisma.farmer.count();
    const farmerCode = `FARM-${String(totalFarmers + 1).padStart(3, '0')}`;

    const newFarmer = await prisma.farmer.create({
      data: {
        farmerCode,
        name,
        village,
        contactNumber: contactNumber || '9876500000',
        cattleCount: parseInt(cattleCount) || 1,
        bankAccount: bankAccount || '',
        ifscCode: ifscCode || 'BARB0ANANDX',
        status: 'Active',
      },
    });

    res.status(201).json({ success: true, data: newFarmer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
