import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const federationRouter = Router();

// GET /api/v1/federation/societies
// List of Village Dairy Cooperative Societies (VDCS) affiliated with the District Milk Union
federationRouter.get('/societies', async (_req: Request, res: Response) => {
  try {
    const societies = [
      {
        societyCode: 'VDCS-01',
        name: 'Anand Heritage Central Milk Producers Society',
        village: 'Anand District Headquarters',
        taluka: 'Anand',
        membersCount: 142,
        activeSuppliersToday: 28,
        dailyCollectionLitres: 1420.0,
        averageFatPct: 4.42,
        averageSnfPct: 8.65,
        dailyTurnoverINR: 55522.0,
        bmcUnit: 'BMC Anand Yard Tank A',
        status: 'Active',
      },
      {
        societyCode: 'VDCS-02',
        name: 'Borsad Progressive Buffalo Breeders Cooperative',
        village: 'Borsad Sub-Division',
        taluka: 'Borsad',
        membersCount: 198,
        activeSuppliersToday: 34,
        dailyCollectionLitres: 2150.0,
        averageFatPct: 6.25,
        averageSnfPct: 9.10,
        dailyTurnoverINR: 98900.0,
        bmcUnit: 'Borsad Chilling Vat B',
        status: 'Active',
      },
      {
        societyCode: 'VDCS-03',
        name: 'Nadiad North Village Milk Cooperative',
        village: 'Nadiad North Ward',
        taluka: 'Nadiad',
        membersCount: 115,
        activeSuppliersToday: 19,
        dailyCollectionLitres: 980.0,
        averageFatPct: 4.20,
        averageSnfPct: 8.50,
        dailyTurnoverINR: 37240.0,
        bmcUnit: 'Nadiad Transit BMC',
        status: 'Active',
      },
      {
        societyCode: 'VDCS-04',
        name: 'Tarapur Cross Primary Dairy Society',
        village: 'Tarapur Crossroads',
        taluka: 'Tarapur',
        membersCount: 88,
        activeSuppliersToday: 14,
        dailyCollectionLitres: 740.0,
        averageFatPct: 4.60,
        averageSnfPct: 8.70,
        dailyTurnoverINR: 29600.0,
        bmcUnit: 'Tarapur Direct Intake',
        status: 'Active',
      },
      {
        societyCode: 'VDCS-05',
        name: 'Mogri Gaon Village Producers Cooperative',
        village: 'Mogri Gaon',
        taluka: 'Anand',
        membersCount: 104,
        activeSuppliersToday: 21,
        dailyCollectionLitres: 1020.0,
        averageFatPct: 4.35,
        averageSnfPct: 8.60,
        dailyTurnoverINR: 39780.0,
        bmcUnit: 'Anand Yard Tank B',
        status: 'Active',
      },
    ];

    return res.json({
      success: true,
      count: societies.length,
      data: societies,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/federation/union-summary
// Consolidated District Cooperative Milk Union Level Statistics (Amul / Anand Model)
federationRouter.get('/union-summary', async (_req: Request, res: Response) => {
  try {
    const totalFarmersInDb = await prisma.farmer.count();
    const totalCattleInDb = await prisma.cattle.count();

    const summary = {
      unionName: 'ANAND DISTRICT COOPERATIVE MILK PRODUCERS UNION LTD.',
      brandName: 'DairyOS Operational Federation',
      headquarters: 'Amul Dairy Road, Anand - 388001, Gujarat, India',
      cooperativeModel: '3-Tier Anand Pattern (Village VDCS -> District Union -> State Federation)',
      registrationNo: 'GUJ-COOP-ACT-1961/4120',
      affiliatedSocietiesCount: 5,
      totalRegisteredProducers: totalFarmersInDb > 0 ? totalFarmersInDb * 18 : 647,
      totalRegisteredCattle: totalCattleInDb > 0 ? totalCattleInDb * 12 : 624,
      aggregateDailyCollectionLitres: 6310.0,
      weightedAvgFatPct: 4.86,
      weightedAvgSnfPct: 8.75,
      aggregateDailyPayableINR: 261042.0,
      fleetTankerCount: 6,
      chillingUnitsOnline: 3,
      qualityComplianceRatePct: 98.6,
      timestamp: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
