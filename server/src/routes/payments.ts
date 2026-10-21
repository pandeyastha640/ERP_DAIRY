import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { broadcastSSE } from './iot';

export const paymentsRouter = Router();

// GET /api/v1/payments
paymentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/payments
paymentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      transactionRef,
      recipientName,
      partyType = 'Farmer',
      milkLitres,
      amount,
      paymentDate = new Date().toISOString().split('T')[0],
      paymentMethod = 'Direct Bank IMPS',
      status = 'Completed',
      notes = '',
    } = req.body;

    if (!recipientName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'recipientName and amount are required',
      });
    }

    const assignedRef = transactionRef || `PAY-${Date.now().toString().slice(-6)}`;

    const payment = await prisma.paymentTransaction.create({
      data: {
        transactionRef: assignedRef,
        recipientName,
        partyType,
        milkLitres: milkLitres ? Number(milkLitres) : null,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        status,
        notes,
      },
    });

    broadcastSSE('PAYMENT_RECORDED', payment);

    return res.status(201).json({
      success: true,
      message: 'Payment transaction logged successfully',
      data: payment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/payments/pending-summary
paymentsRouter.get('/pending-summary', async (req: Request, res: Response) => {
  try {
    const collectionsTotal = await prisma.milkCollectionRecord.aggregate({
      _sum: {
        payableAmount: true,
        quantityLitres: true,
      },
    });

    const paidTotal = await prisma.paymentTransaction.aggregate({
      where: { partyType: 'Farmer', status: 'Completed' },
      _sum: {
        amount: true,
      },
    });

    const totalPayable = collectionsTotal._sum.payableAmount || 0;
    const totalDisbursed = paidTotal._sum.amount || 0;
    const pendingBalance = Math.max(0, totalPayable - totalDisbursed);

    return res.json({
      success: true,
      data: {
        totalPayableGross: totalPayable,
        totalDisbursed,
        pendingBalance,
        totalLitresCollected: collectionsTotal._sum.quantityLitres || 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/payments/disburse-all-pending
// Automated Batch Banking Disbursement Gateway Simulation (IMPS/UPI)
paymentsRouter.post('/disburse-all-pending', async (req: Request, res: Response) => {
  try {
    const farmers = await prisma.farmer.findMany();
    const collections = await prisma.milkCollectionRecord.findMany();
    const existingPayments = await prisma.paymentTransaction.findMany({
      where: { partyType: 'Farmer' },
    });

    const disbursements: any[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    await prisma.$transaction(async (tx) => {
      for (const f of farmers) {
        const farmerCollections = collections.filter((c) => c.farmerId === f.farmerCode || c.farmerId === f.id);
        const totalEarned = farmerCollections.reduce((acc, c) => acc + c.payableAmount, 0);
        const totalPaid = existingPayments
          .filter((p) => p.recipientName.includes(f.name) || p.recipientName.includes(f.farmerCode))
          .reduce((acc, p) => acc + p.amount, 0);

        const netDue = Math.max(0, +(totalEarned - totalPaid).toFixed(2));
        if (netDue > 0) {
          const utrNumber = `UTR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
          const totalLitres = farmerCollections.reduce((acc, c) => acc + c.quantityLitres, 0);

          const txn = await tx.paymentTransaction.create({
            data: {
              transactionRef: utrNumber,
              recipientName: `${f.name} (${f.farmerCode})`,
              partyType: 'Farmer',
              milkLitres: totalLitres,
              amount: netDue,
              paymentDate: dateStr,
              paymentMethod: 'Direct Bank IMPS',
              status: 'Completed',
              notes: `Automated IMPS settlement to A/C ${f.bankAccount || 'XXXX1209'} (${f.ifscCode || 'BARB0ANANDX'})`,
            },
          });
          disbursements.push(txn);
        }
      }

      if (disbursements.length > 0) {
        const totalSettled = disbursements.reduce((acc, d) => acc + d.amount, 0);
        await tx.auditLogEntry.create({
          data: {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userName: 'Finance Manager',
            userRole: 'Finance Manager',
            module: 'Banking & Payouts',
            action: 'BATCH_DISBURSEMENT',
            recordId: `BATCH-IMPS-${Date.now().toString().slice(-4)}`,
            description: `Automated IMPS banking clearance disbursed to ${disbursements.length} producers. Total cleared: ₹${totalSettled.toLocaleString('en-IN')}`,
            financialImpact: `-₹${totalSettled.toLocaleString('en-IN')} paid out`,
            severity: 'info',
          },
        });
      }
    });

    broadcastSSE('BATCH_PAYOUT_COMPLETED', {
      count: disbursements.length,
      totalAmount: disbursements.reduce((acc, d) => acc + d.amount, 0),
    });

    return res.json({
      success: true,
      message: `Batch settlement complete. Disbursed payments to ${disbursements.length} farmers.`,
      disbursedCount: disbursements.length,
      totalAmountDisbursed: disbursements.reduce((acc, d) => acc + d.amount, 0),
      disbursements,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/payments/webhook
// Webhook endpoint for RazorpayX, Cashfree Payouts, or Banking API Callbacks
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string || req.headers['x-razorpay-signature'] as string || 'verified';
    const payload = req.body || {};
    const eventType = payload.event || payload.type || 'payout.processed';
    const eventId = payload.id || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'dairyos_webhook_secret_2026';
    let signatureVerified = true;

    if (req.headers['x-razorpay-signature'] && process.env.PAYMENT_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      signatureVerified = (signature === expectedSignature);
    }

    // Save webhook audit record
    await prisma.paymentWebhookLog.upsert({
      where: { eventId },
      update: { status: 'Processed' },
      create: {
        eventId,
        gateway: payload.gateway || 'RazorpayX',
        eventType,
        payloadJson: JSON.stringify(payload),
        signatureVerified,
        status: signatureVerified ? 'Processed' : 'Failed Verification',
      },
    });

    // If payout succeeded, update corresponding transaction in DB
    const txnRef = payload?.payload?.payout?.entity?.reference_id || payload?.data?.referenceId;
    if (txnRef) {
      await prisma.paymentTransaction.updateMany({
        where: { transactionRef: txnRef },
        data: { status: 'Completed' },
      });
    }

    broadcastSSE('PAYMENT_WEBHOOK', { eventType, eventId, signatureVerified });

    return res.status(200).json({ success: true, message: 'Webhook received & processed', eventId });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/payments/webhook-logs
paymentsRouter.get('/webhook-logs', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.paymentWebhookLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
