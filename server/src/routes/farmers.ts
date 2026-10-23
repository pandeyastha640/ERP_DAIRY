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
        { contactNumber: { contains: search } },
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

    if (typeof name !== 'string' || !name.trim() || typeof village !== 'string' || !village.trim()) {
      return res.status(400).json({ success: false, message: 'Farmer name and village are required.' });
    }
    if (contactNumber !== undefined && typeof contactNumber !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone number must be text.' });
    }
    const parsedCattleCount = cattleCount === undefined || cattleCount === '' ? 0 : Number(cattleCount);
    if (!Number.isInteger(parsedCattleCount) || parsedCattleCount < 0 || parsedCattleCount > 500) {
      return res.status(400).json({ success: false, message: 'Cattle count must be a whole number from 0 to 500.' });
    }

    // Preserve the established FARM-NNN format while skipping occupied codes
    // (a deleted record or imported data can make count + 1 collide).
    let nextCode = (await prisma.farmer.count()) + 1;
    let farmerCode = `FARM-${String(nextCode).padStart(3, '0')}`;
    while (await prisma.farmer.findUnique({ where: { farmerCode } })) {
      nextCode += 1;
      farmerCode = `FARM-${String(nextCode).padStart(3, '0')}`;
    }

    const newFarmer = await prisma.farmer.create({
      data: {
        farmerCode,
        name: name.trim(),
        village: village.trim(),
        contactNumber: contactNumber?.trim() || '',
        cattleCount: parsedCattleCount,
        bankAccount: typeof bankAccount === 'string' ? bankAccount.trim() : '',
        ifscCode: typeof ifscCode === 'string' ? ifscCode.trim() : '',
        status: 'Active',
      },
    });

    res.status(201).json({ success: true, data: newFarmer });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A farmer with this identifier already exists. Refresh and retry.' });
    }
    res.status(500).json({ success: false, message: 'Could not save farmer. Please retry.' });
  }
});
