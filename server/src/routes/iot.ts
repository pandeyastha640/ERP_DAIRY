import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const iotRouter = Router();

// GET /api/v1/iot/devices
// List connected IoT hardware peripherals
iotRouter.get('/devices', (req: Request, res: Response) => {
  res.json({
    success: true,
    devices: [
      {
        id: 'IOT-LACTO-01',
        name: 'Milkotronic Lactoscan MCC Combo Analyzer',
        type: 'Ultrasonic Milk Analyzer',
        interface: 'RS232 Serial / USB Bridge',
        port: 'COM3 (9600 baud)',
        status: 'ONLINE',
        lastHeartbeat: new Date().toISOString(),
        calibratedDate: '2026-10-01',
      },
      {
        id: 'IOT-SCALE-01',
        name: 'Mettler Toledo Digital Platform Load Cell 500kg',
        type: 'Gross Weight Scale',
        interface: 'RS485 Modbus',
        port: 'COM4 (19200 baud)',
        status: 'ONLINE',
        lastHeartbeat: new Date().toISOString(),
        calibratedDate: '2026-09-15',
      },
      {
        id: 'IOT-SILO-RTD-A',
        name: 'Endress+Hauser Omnigrad RTD Temperature Probe (Silo A)',
        type: 'Thermal Telemetry',
        interface: 'MQTT over Industrial Ethernet',
        topic: 'dairyos/telemetry/silo-a/temp',
        status: 'ONLINE',
        lastHeartbeat: new Date().toISOString(),
        currentReading: '3.9°C',
      },
      {
        id: 'IOT-SILO-LVL-A',
        name: 'VegaPuls 64 Radar Liquid Level Transmitter (Silo A)',
        type: 'Continuous Volume Telemetry',
        interface: 'MQTT over Industrial Ethernet',
        topic: 'dairyos/telemetry/silo-a/level',
        status: 'ONLINE',
        lastHeartbeat: new Date().toISOString(),
        currentReading: '3,320 Litres',
      },
    ],
  });
});

// POST /api/v1/iot/lactoscan
// Hardware Ingestion: Receives serial packet from Lactoscan Analyzer & Digital Scale
iotRouter.post('/lactoscan', async (req: Request, res: Response) => {
  try {
    const {
      farmerCode,
      weightKg,
      volumeLitres,
      fat,
      snf,
      clr = 28.5,
      temperatureC = 5.2,
      shift = 'Morning',
      centre = 'BMC Anand Yard',
    } = req.body;

    if (!farmerCode || (!volumeLitres && !weightKg) || fat === undefined || snf === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IoT payload. Expected farmerCode, volumeLitres/weightKg, fat, and snf.',
      });
    }

    // Determine litres (if weight provided, divide by specific gravity 1.030)
    const quantity = volumeLitres ? Number(volumeLitres) : +(Number(weightKg) / 1.030).toFixed(1);

    // Locate farmer
    const farmer = await prisma.farmer.findFirst({
      where: { OR: [{ farmerCode }, { id: farmerCode }] },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: `Farmer '${farmerCode}' not found in registry. Tag RFID or enter registered ID.`,
      });
    }

    // Two-Axis Pricing Formula:
    // Rate = Base + (Fat - 4.0)*4.50 + (SNF - 8.5)*2.50
    const baseMilkRate = 34.50;
    const fatMultiplier = 4.50;
    const snfMultiplier = 2.50;
    const fatDiff = Number(fat) - 4.0;
    const snfDiff = Number(snf) - 8.5;
    const calculatedRate = Math.max(28.0, +(baseMilkRate + fatDiff * fatMultiplier + snfDiff * snfMultiplier).toFixed(2));
    const payableAmount = +(quantity * calculatedRate).toFixed(2);

    // Quality Grade
    const quality = Number(fat) >= 3.5 && Number(snf) >= 8.2 && Number(temperatureC) <= 8.0 ? 'PASS' : 'WARNING';

    const collectionCode = `IOT-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Atomic DB write
    const collection = await prisma.$transaction(async (tx) => {
      const rec = await tx.milkCollectionRecord.create({
        data: {
          collectionCode,
          farmerId: farmer.farmerCode,
          farmerName: farmer.name,
          date: dateStr,
          time: timeStr,
          shift,
          centre,
          quantityLitres: quantity,
          fat: Number(fat),
          snf: Number(snf),
          temperatureC: Number(temperatureC),
          quality,
          ratePerLitre: calculatedRate,
          payableAmount,
          testedBy: 'Automated Lactoscan IoT Station',
        },
      });

      // Credit destination tank
      const tank = await tx.chillingTank.findFirst({
        where: { tankCode: 'TANK-B' },
      });
      if (tank) {
        await tx.chillingTank.update({
          where: { id: tank.id },
          data: {
            currentVolumeLitres: Math.min(tank.capacityLitres, tank.currentVolumeLitres + quantity),
          },
        });
      }

      // Log Audit
      await tx.auditLogEntry.create({
        data: {
          timestamp: timeStr,
          userName: 'Lactoscan IoT Daemon',
          userRole: 'IoT Hardware',
          module: 'Milk Collection',
          action: 'IOT_INGESTION',
          recordId: collectionCode,
          description: `Direct hardware intake: ${quantity}L from ${farmer.name} (${farmer.farmerCode}) @ ₹${calculatedRate}/L [${fat}% Fat / ${snf}% SNF]`,
          financialImpact: `+₹${payableAmount.toLocaleString('en-IN')} payable generated`,
          milkImpactLitres: quantity,
          severity: 'info',
        },
      });

      return rec;
    });

    return res.status(201).json({
      success: true,
      message: 'Automated IoT milk ingestion complete',
      data: collection,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/iot/silo-telemetry
// Silo Thermal & Level Sensor Ping (MQTT / Industrial PLC Gateway)
iotRouter.post('/silo-telemetry', async (req: Request, res: Response) => {
  try {
    const { tankCode, temperatureC, volumeLitres, agitatorRunning } = req.body;

    if (!tankCode) {
      return res.status(400).json({ success: false, message: 'tankCode is required' });
    }

    const tank = await prisma.chillingTank.findFirst({
      where: { OR: [{ tankCode }, { id: tankCode }] },
    });

    if (!tank) {
      return res.status(404).json({ success: false, message: `Tank ${tankCode} not found` });
    }

    const updated = await prisma.chillingTank.update({
      where: { id: tank.id },
      data: {
        ...(temperatureC !== undefined && { temperatureC: Number(temperatureC) }),
        ...(volumeLitres !== undefined && { currentVolumeLitres: Number(volumeLitres) }),
        ...(agitatorRunning !== undefined && { agitatorStatus: agitatorRunning ? 'Running' : 'Stopped' }),
        sensorHealth: temperatureC > 4.5 ? 'Check Sensor' : 'Optimal',
      },
    });

    return res.json({
      success: true,
      message: `Telemetry updated for silo ${updated.name}`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
