import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const qualityRouter = Router();

// GET /api/v1/quality/tests
qualityRouter.get('/tests', async (req: Request, res: Response) => {
  try {
    const tests = await prisma.qualityTestRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, count: tests.length, data: tests });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/quality/tests
qualityRouter.post('/tests', async (req: Request, res: Response) => {
  try {
    const {
      batchNumber,
      sourceType = 'Farmer Procurement',
      sourceName = 'Anand Collection Centre',
      quantityLitres,
      fat,
      snf,
      clr = 28.5,
      temperatureC,
      adulterationTest = 'Negative',
      acidityPct = 0.14,
      mbrtHours = 5.0,
      result = 'PASS',
      tester = 'QC Chemist',
      testTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } = req.body;

    if (!quantityLitres || fat === undefined || snf === undefined || temperatureC === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: quantityLitres, fat, snf, temperatureC',
      });
    }

    const assignedBatch = batchNumber || `QC-${Date.now().toString().slice(-6)}`;

    const test = await prisma.qualityTestRecord.create({
      data: {
        batchNumber: assignedBatch,
        sourceType,
        sourceName,
        quantityLitres: Number(quantityLitres),
        fat: Number(fat),
        snf: Number(snf),
        clr: Number(clr),
        temperatureC: Number(temperatureC),
        adulterationTest,
        acidityPct: Number(acidityPct),
        mbrtHours: Number(mbrtHours),
        result,
        tester,
        testTime,
      },
    });

    // Write audit trail
    await prisma.auditLogEntry.create({
      data: {
        timestamp: testTime,
        userName: tester,
        userRole: 'Quality Lab Chemist',
        module: 'Quality Lab',
        action: 'QUALITY_TEST_RECORDED',
        recordId: assignedBatch,
        description: `Logged QC test for ${quantityLitres}L [${fat}% Fat, ${snf}% SNF, ${temperatureC}°C, Adulteration: ${adulterationTest}] -> ${result}`,
        severity: result === 'FAIL' ? 'error' : result === 'WARNING' ? 'warning' : 'info',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quality test logged successfully',
      data: test,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
