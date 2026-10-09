import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

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
    // 1. Group unpaid collections by farmer
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

      // Record audit entry
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
