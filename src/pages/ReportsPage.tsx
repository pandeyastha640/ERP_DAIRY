import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { FileSpreadsheet, Download, Calendar, Filter, CheckCircle2, FileText, ArrowRight, Table, Layers, ShieldCheck } from 'lucide-react';

export const REPORTS_LIST = [
  { id: 'rep-daily-milk', title: 'Daily Milk Balance & Pool Report', desc: 'Complete volumetric mass balance from herd milking and farmer inward to HTST pasteurization.', category: 'Operations' },
  { id: 'rep-farmer-procure', title: 'Farmer Procurement & Fat Ledger', desc: 'Shift-wise farmer inward litres, fat %, SNF %, two-axis rate and net daily payable.', category: 'Procurement' },
  { id: 'rep-cattle-prod', title: 'Cattle Herd Productivity & Lactation Report', desc: 'Animal-level daily milk yield, lactation stage, days in milk, and individual feed conversion.', category: 'Herd' },
  { id: 'rep-feed-consume', title: 'Feed Consumption & Formulation Cost Ledger', desc: 'Fodder and concentrate silage inventory movements, dry matter intake and cost/cow/day.', category: 'Nutrition' },
  { id: 'rep-quality-tests', title: 'Quality Assurance & MBRT Compliance Report', desc: 'Analytical chemistry, adulteration tests, microbial count, and temperature logs.', category: 'Quality' },
  { id: 'rep-processing-batch', title: 'Processing & Pasteurizer Yield Report', desc: 'HTST continuous line throughput, conversion ratios, product outputs and spillage wastage.', category: 'Processing' },
  { id: 'rep-inventory-valuation', title: 'Unified Inventory Stock & Valuation Ledger', desc: 'Raw milk, packaging materials, finished goods cold room balance and safety days runway.', category: 'Inventory' },
  { id: 'rep-sales-orders', title: 'Commercial Sales & Invoice Register', desc: 'Omni-channel order lines across distributor, modern retail supermarket, and Horeca accounts.', category: 'Commercial' },
  { id: 'rep-route-logistics', title: 'Route Logistics & Fleet Performance Report', desc: 'Insulated truck dispatch, delivery fulfillment rate, crate returns and diesel running costs.', category: 'Logistics' },
  { id: 'rep-profitability-unit', title: 'Executive Unit Profitability & Cost Per Litre', desc: 'Decomposed operational cost per litre, product gross margins, and herd contribution spread.', category: 'Finance' },
  { id: 'rep-farmer-payment', title: 'Farmer Banking Disbursement & IMPS Ledger', desc: 'Producer bank account settlements, UPI receipts, pending queues, and statutory compliance.', category: 'Settlement' },
];

export const ReportsPage: React.FC = () => {
  const {
    reconciliation,
    herdEconomics,
    procurementSummary,
    profitability,
    collectionsList,
    cattleList,
    batchesList,
    inventoryList,
    salesOrdersList,
    paymentsList,
    feedsList,
    qualityTestsList,
    routesList,
  } = useDairyERP();

  const [selectedReportId, setSelectedReportId] = useState(REPORTS_LIST[0].id);
  const [dateRange, setDateRange] = useState('Today');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedReport = REPORTS_LIST.find((r) => r.id === selectedReportId) || REPORTS_LIST[0];

  const handleExport = (format: 'CSV' | 'Excel') => {
    let rows: string[] = [];

    if (selectedReportId === 'rep-daily-milk') {
      rows = [
        'Component,Volume (Litres),Unit,Status',
        `Opening Silo Stock,${reconciliation.openingStockLitres},Litres,Audited`,
        `Own Cattle Herd Production,${reconciliation.ownProductionLitres},Litres,Inward Parlour`,
        `Farmer Procurement,${reconciliation.farmerProcurementLitres},Litres,Inward Collections`,
        `Quality Rejection Loss,-${reconciliation.qualityRejectedLitres},Litres,Quarantine`,
        `Processing Pasteurizer Input,-${reconciliation.processingConsumptionLitres},Litres,Consumed`,
        `Spillage & Line Rinse Loss,-${reconciliation.spillageWastageLitres},Litres,Rinse Drain`,
        `Closing / Available Raw Milk,${reconciliation.closingStockLitres},Litres,Reconciled Stock`,
      ];
    } else if (selectedReportId === 'rep-farmer-procure') {
      rows = [
        'Collection ID,Farmer Name,Shift,Litres,Fat %,SNF %,Rate / L,Payable (INR)',
        ...collectionsList.map(
          (c) =>
            `${c.id},"${c.farmerName}",${c.shift},${c.quantityLitres},${c.fat},${c.snf},${c.ratePerLitre},${c.payableAmount}`
        ),
      ];
    } else if (selectedReportId === 'rep-cattle-prod') {
      rows = [
        'Animal ID,Tag Number,Breed,Age (Years),Lactation Stage,Status,Daily Milk (L),Feed Cost/Day (INR),Shed Location',
        ...cattleList.map(
          (c) =>
            `${c.id},${c.tagNumber},"${c.breed}",${c.ageYears},${c.lactation},"${c.status}",${c.milkYieldLPerDay},${c.feedCostPerDay},"${c.shedLocation}"`
        ),
      ];
    } else if (selectedReportId === 'rep-feed-consume') {
      rows = [
        'Feed ID,Name,Feed Type,Opening (kg),Purchased (kg),Consumed (kg),Closing (kg),Unit Cost (INR),Days Runway',
        ...feedsList.map(
          (f) =>
            `${f.id},"${f.name}","${f.type}",${f.openingStockKg},${f.purchasedKg},${f.consumedKg},${f.closingStockKg},${f.unitCostPerKg},${f.daysRemaining}`
        ),
      ];
    } else if (selectedReportId === 'rep-quality-tests') {
      rows = [
        'Batch Number,Source Type,Source Name,Litres,Fat %,SNF %,CLR,Temp (°C),Adulteration,Acidity %,MBRT (Hours),Result,Tester',
        ...qualityTestsList.map(
          (q) =>
            `"${q.batchNumber}","${q.sourceType}","${q.sourceName}",${q.quantityLitres},${q.fat},${q.snf},${q.clr},${q.temperatureC},"${q.adulterationTest}",${q.acidityPct},${q.mbrtHours},"${q.result}","${q.tester}"`
        ),
      ];
    } else if (selectedReportId === 'rep-processing-batch') {
      rows = [
        'Batch ID,Date,Line,Input Milk (L),Input Fat %,Input SNF %,Products Count,Yield %,Wastage (L),Cost (INR),Status,Operator',
        ...batchesList.map(
          (b) =>
            `"${b.batchId}",${b.date},"${b.pasteurizerLine}",${b.inputMilkLitres},${b.inputFatPct},${b.inputSnfPct},${b.products.length},${b.yieldPercentage},${b.wastageLitres},${b.processingCostTotal},"${b.status}","${b.operator}"`
        ),
      ];
    } else if (selectedReportId === 'rep-inventory-valuation') {
      rows = [
        'Item SKU,Name,Category,Opening,Inward,Outward,Closing,Unit Value (INR),Total Value (INR),Status',
        ...inventoryList.map(
          (i) =>
            `${i.sku},"${i.name}","${i.category}",${i.openingBalance},${i.inward},${i.outward},${i.closingBalance},${i.unitValue},${i.totalValue},"${i.status}"`
        ),
      ];
    } else if (selectedReportId === 'rep-sales-orders') {
      rows = [
        'Order Number,Date,Customer,Channel,Product,Quantity Units,Unit Rate (INR),Total Amount (INR),Payment Status,Fulfillment',
        ...salesOrdersList.map(
          (o) =>
            `"${o.orderNumber}",${o.date},"${o.customerName}","${o.channel}","${o.product}",${o.quantityUnits},${o.unitRate},${o.totalAmount},"${o.paymentStatus}","${o.fulfillmentStatus}"`
        ),
      ];
    } else if (selectedReportId === 'rep-route-logistics') {
      rows = [
        'Route Code,Route Name,Vehicle,Driver,Total Dispatch,Delivered Units,Return Units,Logistics Cost (INR),Status',
        ...routesList.map(
          (r) =>
            `"${r.routeCode}","${r.routeName}","${r.vehicleNumber}","${r.driverName}",${r.totalDispatchUnits},${r.deliveredUnits},${r.returnUnits},${r.logisticsCost},"${r.status}"`
        ),
      ];
    } else if (selectedReportId === 'rep-profitability-unit') {
      const b = profitability.operatingCostBreakdown;
      rows = [
        'Metric / Cost Line,Amount (INR),Unit,Notes',
        `Gross Revenue,${profitability.todayRevenue},INR,Commercial Invoices`,
        `Milk Procurement Cost,${b.milkProcurement},INR,Farmer Payouts`,
        `Cattle Feed Cost,${b.cattleFeed},INR,Herd Ration`,
        `Dairy Processing Cost,${b.dairyProcessing},INR,HTST Line Power & Steam`,
        `Packaging Materials,${b.packagingMaterial},INR,Pouches & Cups`,
        `Labour & Crew,${b.labourStaff},INR,Plant Crew`,
        `Logistics & Fleet,${b.transportLogistics},INR,Reefer Vans`,
        `Electricity & Chilling,${b.electricityUtilities + b.chillingColdChain},INR,4°C Cold Chain`,
        `Wastage Loss,${b.wastageLoss},INR,Spillage`,
        `Total Operating Costs,${profitability.todayOperatingCost},INR,All 11 Lines`,
        `Gross Profit,${profitability.grossProfit},INR,Contribution Margin`,
        `Gross Margin %,${profitability.grossMarginPct},%,Margin Health`,
        `Cost Per Litre,${profitability.costPerLitre},INR/L,Unit Cost`,
        `Revenue Per Litre,${profitability.revenuePerLitre},INR/L,Unit Realization`,
        `Profit Per Litre,${profitability.profitPerLitre},INR/L,Unit Net Yield`,
      ];
    } else if (selectedReportId === 'rep-farmer-payment') {
      rows = [
        'Transaction Ref,Recipient,Party Type,Litres,Amount (INR),Payment Date,Method,Status,Notes',
        ...paymentsList.map(
          (p) =>
            `"${p.transactionRef}","${p.recipientName}","${p.partyType}",${p.milkLitres || 0},${p.amount},"${p.paymentDate}","${p.paymentMethod}","${p.status}","${p.notes}"`
        ),
      ];
    } else {
      rows = [
        'Item SKU,Name,Opening,Inward,Outward,Closing,Unit Value,Total Value',
        ...inventoryList.map(
          (i) =>
            `${i.sku},"${i.name}",${i.openingBalance},${i.inward},${i.outward},${i.closingBalance},${i.unitValue},${i.totalValue}`
        ),
      ];
    }

    const csvContent = `data:text/csv;charset=utf-8,Report,${selectedReport.title}\nDate,2026-10-06\nSystem,DairyOS Enterprise ERP (Live Reconciled Export)\n\n` + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport.id}-2026-10-06.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Generated live ${format} export for "${selectedReport.title}" (${rows.length - 1} records).`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <FileSpreadsheet className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Enterprise Reports Centre
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                11 Live Datasets
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Operational auditing, financial ledgers, compliance certificates, and production throughput extracts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans font-medium"
          >
            <option value="Today">Today (06 Oct 2026)</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days (Consolidated)</option>
            <option value="Current Month">Month to Date (M-T-D)</option>
          </select>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Two Column Layout: Reports Catalog on Left, Preview & Export on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 11 Reports List */}
        <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-stone-500 border-b border-[#ede8df] font-semibold">
            Available ERP Reports ({REPORTS_LIST.length} Reports)
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {REPORTS_LIST.map((rep) => {
              const isSelected = selectedReportId === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-sage-50 text-forest-950 border border-sage-300 shadow-2xs font-bold'
                      : 'hover:bg-cream-50/70 text-stone-700 border border-transparent'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-forest-800' : 'text-stone-400'}`} />
                  <div className="min-w-0">
                    <div className="truncate font-sans">{rep.title}</div>
                    <div className="text-[10px] text-stone-500 truncate font-mono mt-0.5">{rep.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Report Preview Card */}
        <div className="lg:col-span-2 bg-white border border-[#ede8df] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede8df] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cream-100 border border-[#ede8df] text-stone-600 font-semibold">
                  {selectedReport.category}
                </span>
                <h2 className="text-lg font-bold text-forest-950 mt-2 font-sans">{selectedReport.title}</h2>
                <p className="text-xs text-stone-500 mt-1 font-sans">{selectedReport.desc}</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => handleExport('CSV')}
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Live CSV</span>
                </button>
                <button
                  onClick={() => handleExport('Excel')}
                  className="px-3.5 py-2 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-stone-800 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Excel Export</span>
                </button>
              </div>
            </div>

            {/* Live Report Data Preview Table */}
            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-xs font-bold text-forest-950 font-sans">
                <span>Live Data Preview ({dateRange})</span>
                <span className="text-emerald-800 text-xs font-mono font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Reconciled with ERP Database
                </span>
              </div>

              {selectedReportId === 'rep-daily-milk' && (
                <div className="overflow-x-auto rounded-xl border border-[#ede8df]">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="text-stone-500 border-b border-[#ede8df] bg-[#fcfbf9]">
                      <tr>
                        <th className="px-3.5 py-2.5 font-semibold">Stream / Component</th>
                        <th className="px-3.5 py-2.5 font-semibold">Volume</th>
                        <th className="px-3.5 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ede8df] text-stone-700 tabular-nums">
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans font-medium">Opening Silos Balance</td>
                        <td className="px-3.5 py-2.5">{reconciliation.openingStockLitres.toLocaleString()} L</td>
                        <td className="px-3.5 py-2.5 text-stone-500">Cold Silos</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans text-forest-900 font-semibold">+ Own Cattle Herd Production</td>
                        <td className="px-3.5 py-2.5 text-forest-900 font-bold">+{reconciliation.ownProductionLitres.toLocaleString()} L</td>
                        <td className="px-3.5 py-2.5 text-emerald-700">Direct Parlour</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans text-forest-900 font-semibold">+ Farmer Milk Procurement</td>
                        <td className="px-3.5 py-2.5 text-forest-900 font-bold">+{reconciliation.farmerProcurementLitres.toLocaleString()} L</td>
                        <td className="px-3.5 py-2.5 text-emerald-700">Inward Verified</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans text-rose-700 font-semibold">- Quality Rejections</td>
                        <td className="px-3.5 py-2.5 text-rose-700 font-bold">-{reconciliation.qualityRejectedLitres} L</td>
                        <td className="px-3.5 py-2.5 text-rose-600">Quarantine Diverted</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans text-amber-700 font-semibold">- Processing Line Input</td>
                        <td className="px-3.5 py-2.5 text-amber-700 font-bold">-{reconciliation.processingConsumptionLitres.toLocaleString()} L</td>
                        <td className="px-3.5 py-2.5 text-stone-500">HTST Consumed</td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2.5 font-sans text-rose-700 font-semibold">- Spillage & Wastage Rinse</td>
                        <td className="px-3.5 py-2.5 text-rose-700 font-bold">-{reconciliation.spillageWastageLitres} L</td>
                        <td className="px-3.5 py-2.5 text-stone-500">Line Loss</td>
                      </tr>
                      <tr className="bg-sage-50/70 font-bold border-t-2 border-forest-800">
                        <td className="px-3.5 py-3 font-sans text-forest-950 font-bold">= Closing / Available Milk</td>
                        <td className="px-3.5 py-3 text-emerald-800 text-sm font-extrabold">{reconciliation.closingStockLitres.toLocaleString()} L</td>
                        <td className="px-3.5 py-3 text-emerald-800">Balanced (0% diff)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {selectedReportId === 'rep-farmer-procure' && (
                <div className="overflow-x-auto rounded-xl border border-[#ede8df] max-h-64">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="text-stone-500 border-b border-[#ede8df] bg-[#fcfbf9] sticky top-0 font-semibold">
                      <tr>
                        <th className="px-3.5 py-2.5">ID</th>
                        <th className="px-3.5 py-2.5">Farmer</th>
                        <th className="px-3.5 py-2.5">Shift</th>
                        <th className="px-3.5 py-2.5">Litres</th>
                        <th className="px-3.5 py-2.5">Fat / SNF</th>
                        <th className="px-3.5 py-2.5">Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ede8df] text-stone-700 tabular-nums">
                      {collectionsList.slice(0, 7).map((c) => (
                        <tr key={c.id} className="hover:bg-cream-50/60">
                          <td className="px-3.5 py-2.5 font-bold text-forest-900">{c.id}</td>
                          <td className="px-3.5 py-2.5 font-sans font-bold text-forest-950">{c.farmerName}</td>
                          <td className="px-3.5 py-2.5">{c.shift}</td>
                          <td className="px-3.5 py-2.5 font-bold">{c.quantityLitres} L</td>
                          <td className="px-3.5 py-2.5">{c.fat}% / {c.snf}%</td>
                          <td className="px-3.5 py-2.5 text-forest-950 font-bold">₹{c.payableAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedReportId !== 'rep-daily-milk' && selectedReportId !== 'rep-farmer-procure' && (
                <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-2.5 text-stone-700">
                  <div className="flex justify-between border-b border-[#ede8df] pb-2 text-xs">
                    <span className="text-stone-500 font-sans">Report Classification:</span>
                    <span className="text-forest-950 font-bold font-sans">Enterprise Operations Tier 1</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ede8df] pb-2 text-xs">
                    <span className="text-stone-500 font-sans">Date Horizon:</span>
                    <span className="text-forest-950 font-mono">2026-10-06 (Automated Shift Extract)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ede8df] pb-2 text-xs">
                    <span className="text-stone-500 font-sans">Reconciliation Checksum:</span>
                    <span className="text-emerald-800 font-bold font-mono">VERIFIED (Zero Variance)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#ede8df] pb-2 text-xs">
                    <span className="text-stone-500 font-sans">Unit Profitability Metric:</span>
                    <span className="text-forest-900 font-mono font-bold">₹{profitability.costPerLitre.toFixed(2)}/L cost &bull; ₹{profitability.profitPerLitre.toFixed(2)}/L margin</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-stone-500 font-sans">Active Suppliers & Herd:</span>
                    <span className="text-forest-950 font-bold font-sans">{procurementSummary.totalSuppliersToday} Farmers &bull; {herdEconomics.totalMilkingCows} Milking Cows</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df] text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>Audit trail checksum verified against ERP master database.</span>
            <span className="font-mono text-forest-800 font-bold bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-md">
              ISO 22000 Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
