import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const notificationsRouter = Router();

// POST /api/v1/notifications/receipt-sms
// Dispatches bilingual Farmer Milk Delivery Confirmation via SMS & WhatsApp
notificationsRouter.post('/receipt-sms', async (req: Request, res: Response) => {
  try {
    const { collectionCode, channel = 'ALL' } = req.body;
    if (typeof collectionCode !== 'string' || !collectionCode.trim()) {
      return res.status(400).json({ success: false, message: 'A saved collection code is required.' });
    }
    if (!['SMS', 'WHATSAPP', 'ALL'].includes(channel)) {
      return res.status(400).json({ success: false, message: 'Choose SMS, WhatsApp, or both.' });
    }

    const collection = await prisma.milkCollectionRecord.findUnique({ where: { collectionCode } });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Saved milk collection was not found.' });
    }
    const farmer = await prisma.farmer.findUnique({ where: { farmerCode: collection.farmerId } });
    if (!farmer?.contactNumber) {
      return res.status(422).json({ success: false, message: 'The saved farmer record has no contact number.' });
    }

    // Build the message only from authoritative saved records. Callers cannot
    // substitute a farmer, quantity, rate, payable amount, or recipient number.
    const farmerCode = farmer.farmerCode;
    const farmerName = farmer.name;
    const mobileNumber = farmer.contactNumber;
    const volumeLitres = collection.quantityLitres;
    const fat = collection.fat;
    const snf = collection.snf;
    const ratePerLitre = collection.ratePerLitre;
    const payableAmount = collection.payableAmount;
    const shift = collection.shift;
    const centre = collection.centre;

    const messageId = `MSG-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];

    // Standard Bilingual Message Templates (English & Gujarati/Hindi)
    const smsText = `[DairyOS] Namaste ${farmerName}, received ${volumeLitres}L (${shift}) at ${centre}. Fat: ${fat}%, SNF: ${snf}%, Rate: Rs ${ratePerLitre}/L. Payable: Rs ${payableAmount.toLocaleString('en-IN')}. No bank transfer is confirmed. Ref: ${messageId}`;
    const whatsappText = `🥛 *DairyOS Milk Delivery Receipt*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Farmer*: ${farmerName} (${farmerCode})\n📍 *Centre*: ${centre}\n⏰ *Shift*: ${shift} | ${dateStr} ${timestamp}\n📊 *Quantity*: ${volumeLitres} Litres\n🧪 *Quality*: ${fat}% Fat | ${snf}% SNF\n💰 *Rate*: ₹${ratePerLitre.toFixed(2)} / Litre\n💵 *Payable*: *₹${payableAmount.toLocaleString('en-IN')}*\n🏦 *Payment status*: Payable recorded; no bank transfer confirmed\n━━━━━━━━━━━━━━━━━━━━\n_Ref: ${messageId} · DairyOS demo_`;

    const simulationOnly = process.env.NODE_ENV !== 'production' || process.env.DISABLE_LIVE_NOTIFICATIONS === 'true';
    let provider = process.env.NODE_ENV === 'test' ? 'Test Simulation' : 'Simulated Local Telecom Bridge';

    // Live Twilio SMS Integration if configured
    if (!simulationOnly && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: mobileNumber,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: smsText,
          }).toString(),
        });
        provider = 'Twilio SMS Cloud';
      } catch (e: any) {
        console.warn('Twilio dispatch warning:', e.message);
      }
    }

    // Live Meta WhatsApp Cloud API if configured
    if (!simulationOnly && process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: mobileNumber.replace(/[^0-9]/g, ''),
            type: 'text',
            text: { body: whatsappText },
          }),
        });
        provider = 'WhatsApp Business Cloud API';
      } catch (e: any) {
        console.warn('WhatsApp cloud dispatch warning:', e.message);
      }
    }

    // Log to Audit Trail
    await prisma.auditLogEntry.create({
      data: {
        timestamp,
        userName: 'Telecom Dispatcher',
        userRole: 'Notification Gateway',
        module: 'Milk Collection',
        action: simulationOnly ? 'RECEIPT_PREVIEWED' : 'RECEIPT_DISPATCHED',
        recordId: messageId,
        description: simulationOnly
          ? `Prepared simulated receipt preview for ${farmerName} (${mobileNumber}); no message sent.`
          : `Submitted receipt to ${provider} for ${farmerName} (${mobileNumber}): ${volumeLitres}L @ ₹${ratePerLitre}/L = ₹${payableAmount}`,
        severity: 'info',
      },
    });

    return res.status(200).json({
      success: true,
      simulationOnly,
      messageId,
      dispatchedAt: new Date().toISOString(),
      provider,
      channels: channel === 'ALL' ? ['SMS', 'WhatsApp'] : [channel],
      recipient: {
        farmerCode,
        farmerName,
        mobileNumber,
      },
      content: {
        smsText,
        whatsappText,
      },
      deliveryStatus: simulationOnly ? 'SIMULATED' : 'PROVIDER_ACCEPTED_DELIVERY_UNVERIFIED',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/notifications/collections/:id/slip
// Generates standardized 58mm / 80mm POS Thermal Receipt Slip payload
notificationsRouter.get('/collections/:id/slip', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = await prisma.milkCollectionRecord.findFirst({
      where: { OR: [{ id }, { collectionCode: id }] },
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Saved milk collection was not found.' });
    }
    const c = collection;

    const slipPayload = {
      slipNumber: `SLIP-${c.collectionCode}`,
      society: {
        name: 'DairyOS Cooperative Demo',
        unitName: c.centre,
      },
      intake: {
        collectionCode: c.collectionCode,
        date: c.date,
        time: c.time,
        shift: c.shift,
        farmerCode: c.farmerId,
        farmerName: c.farmerName,
        milkType: Number(c.fat) >= 5.5 ? 'Buffalo Milk' : 'Cow Milk (Grade A)',
        volumeLitres: c.quantityLitres,
        fatPct: c.fat,
        snfPct: c.snf,
        tempCelsius: c.temperatureC,
        qualityGrade: c.quality,
      },
      pricing: {
        baseRatePerL: 34.50,
        solidsIncentive: +(c.ratePerLitre - 34.50).toFixed(2),
        effectiveRatePerL: c.ratePerLitre,
        grossPayableINR: c.payableAmount,
        deductionsINR: 0.0,
        netPayableINR: c.payableAmount,
        paymentStatus: c.payableAmount > 0 ? 'Pending payable; no bank transfer confirmed' : 'No payable amount recorded',
      },
      footer: {
        testedBy: c.testedBy || 'Not recorded',
        qrData: `DAIRYOS:${c.collectionCode}:${c.farmerId}:${c.quantityLitres}:${c.payableAmount}`,
        printedAt: new Date().toISOString(),
        disclaimer: 'Computer-generated receipt from a persisted DairyOS milk collection record.',
      },
    };

    return res.json({ success: true, data: slipPayload });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
