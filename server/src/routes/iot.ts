import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const iotRouter = Router();

// In-memory registry for Server-Sent Events (SSE) active subscriber clients
const sseClients: Response[] = [];

/**
 * Broadcast an event to all connected SSE browser clients
 */
export function broadcastSSE(event: string, payload: any) {
  const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(`event: ${event}\ndata: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// GET /api/v1/iot/stream
// Real-time Server-Sent Events (SSE) streaming for chilling vats, milk intake, and alerts
iotRouter.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', message: 'DairyOS Live IoT Telemetry Bus active' })}\n\n`);
  sseClients.push(res);

  // Heartbeat ping every 25 seconds to keep connection alive through proxies
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat ${new Date().toISOString()}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeatInterval);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// GET /api/v1/iot/devices
// List connected IoT hardware peripherals
iotRouter.get('/devices', async (req: Request, res: Response) => {
  try {
    const dbDevices = await prisma.ioTDevice.findMany();
    const staticDevices = [
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
    ];

    res.json({
      success: true,
      devices: [...staticDevices, ...dbDevices],
      sseSubscribersCount: sseClients.length,
    });
  } catch {
    res.json({ success: true, devices: [] });
  }
});

// POST /api/v1/iot/register-device
// Register a new edge IoT device (Analyzer, Scale, or RTD probe)
iotRouter.post('/register-device', async (req: Request, res: Response) => {
  try {
    const { deviceCode, deviceName, deviceType, societyId = 'SOC-ANAND-01', ipAddress } = req.body;
    if (!deviceCode || !deviceName || !deviceType) {
      return res.status(400).json({ success: false, message: 'deviceCode, deviceName, and deviceType are required' });
    }

    const device = await prisma.ioTDevice.upsert({
      where: { deviceCode },
      update: {
        deviceName,
        deviceType,
        societyId,
        ipAddress: ipAddress || '192.168.1.100',
        lastHeartbeat: new Date(),
        status: 'Online',
      },
      create: {
        deviceCode,
        deviceName,
        deviceType,
        societyId,
        ipAddress: ipAddress || '192.168.1.100',
        status: 'Online',
      },
    });

    broadcastSSE('DEVICE_REGISTERED', device);
    return res.status(201).json({ success: true, message: 'Device registered successfully', data: device });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/iot/telemetry
// Direct IoT Edge Gateway Webhook (ESP32 / Raspberry Pi / PLC Gateway)
iotRouter.post('/telemetry', async (req: Request, res: Response) => {
  try {
    const { deviceCode, temperatureC, volumeLitres, agitatorRunning, tankCode = 'TANK-A' } = req.body;

    if (tankCode) {
      const tank = await prisma.chillingTank.findFirst({
        where: { OR: [{ tankCode }, { id: tankCode }] },
      });
      if (tank) {
        const updated = await prisma.chillingTank.update({
          where: { id: tank.id },
          data: {
            ...(temperatureC !== undefined && { temperatureC: Number(temperatureC) }),
            ...(volumeLitres !== undefined && { currentVolumeLitres: Number(volumeLitres) }),
            ...(agitatorRunning !== undefined && { agitatorStatus: agitatorRunning ? 'Running' : 'Stopped' }),
            sensorHealth: temperatureC > 4.5 ? 'Warning: High Temp' : 'Optimal',
          },
        });
        broadcastSSE('TANK_TELEMETRY', updated);
      }
    }

    if (deviceCode) {
      await prisma.ioTDevice.updateMany({
        where: { deviceCode },
        data: { lastHeartbeat: new Date(), status: 'Online' },
      });
    }

    return res.json({ success: true, message: 'Edge telemetry ingested and broadcast to live subscribers' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/iot/scale-reading
// Live Gross/Tare weight intake from digital platform scales
iotRouter.post('/scale-reading', (req: Request, res: Response) => {
  const { weightKg, tareKg = 1.2, canId, stable = true } = req.body;
  const netWeightKg = +(Number(weightKg) - Number(tareKg)).toFixed(2);
  const calculatedLitres = +(netWeightKg / 1.030).toFixed(1);

  const payload = {
    grossWeightKg: Number(weightKg),
    tareKg: Number(tareKg),
    netWeightKg,
    calculatedLitres,
    canId,
    stable,
    timestamp: new Date().toISOString(),
  };

  broadcastSSE('SCALE_WEIGHT', payload);
  return res.json({ success: true, data: payload });
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
      societyId = 'SOC-ANAND-01',
    } = req.body;

    if (!farmerCode || (!volumeLitres && !weightKg) || fat === undefined || snf === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IoT payload. Expected farmerCode, volumeLitres/weightKg, fat, and snf.',
      });
    }

    const quantity = volumeLitres ? Number(volumeLitres) : +(Number(weightKg) / 1.030).toFixed(1);

    let farmer = await prisma.farmer.findFirst({
      where: { OR: [{ farmerCode }, { id: farmerCode }] },
    });

    if (!farmer) {
      farmer = await prisma.farmer.findFirst();
      if (!farmer) {
        farmer = await prisma.farmer.create({
          data: {
            farmerCode: farmerCode || 'FARM-001',
            name: req.body.farmerName || 'Rameshwar Patel',
            village: 'Anand District',
            contactNumber: '+91 9825010000',
            cattleCount: 6,
            bankAccount: 'SBI-XXXX4101',
            ifscCode: 'BARB0ANANDX',
            status: 'Active',
            societyId,
          },
        });
      }
    }

    const baseMilkRate = 34.50;
    const fatMultiplier = 4.50;
    const snfMultiplier = 2.50;
    const fatDiff = Number(fat) - 4.0;
    const snfDiff = Number(snf) - 8.5;
    const calculatedRate = Math.max(28.0, +(baseMilkRate + fatDiff * fatMultiplier + snfDiff * snfMultiplier).toFixed(2));
    const payableAmount = +(quantity * calculatedRate).toFixed(2);
    const quality = Number(fat) >= 3.5 && Number(snf) >= 8.2 && Number(temperatureC) <= 8.0 ? 'PASS' : 'WARNING';

    const collectionCode = `IOT-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
          societyId,
        },
      });

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

    // Broadcast collection event to all active UI screens via SSE
    broadcastSSE('NEW_COLLECTION', collection);

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

    broadcastSSE('TANK_TELEMETRY', updated);

    return res.json({
      success: true,
      message: `Telemetry updated for silo ${updated.name}`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
