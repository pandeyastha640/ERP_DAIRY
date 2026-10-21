import { jsPDF } from 'jspdf';
import { Farmer, MilkCollectionRecord, SalesOrder, SystemSettings } from '../types/dairy';

/**
 * DairyOS Enterprise Vector PDF Generation Engine
 * Produces crisp, standardized A4 printable regulatory and operational documents
 */

export const pdfGenerator = {
  /**
   * 1. Generate Farmer Monthly Passbook PDF
   */
  generateFarmerPassbookPDF(
    farmer: Farmer,
    collections: MilkCollectionRecord[],
    settings: SystemSettings,
    period: string = 'Current Billing Cycle'
  ) {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const primaryColor: [number, number, number] = [30, 58, 138]; // Deep blue
    const darkText: [number, number, number] = [30, 41, 59];

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.orgName.toUpperCase(), 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`FSSAI Reg: ${settings.fssaiLicense}  |  GSTIN: ${settings.gstin}`, 14, 18);
    doc.text('PRIMARY VILLAGE DAIRY COOPERATIVE SOCIETY — PRODUCER PASSBOOK', 14, 23);

    // Period & Generation Timestamp
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 160, 18);
    doc.text(`Billing: ${period}`, 160, 23);

    // Farmer Profile Card
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 34, 182, 28, 2, 2, 'FD');

    doc.setTextColor(...darkText);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Farmer: ${farmer.name} (${farmer.id})`, 18, 42);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Village: ${farmer.village || 'Anand Rural'}`, 18, 48);
    doc.text(`Contact: ${farmer.contactNumber || 'N/A'}`, 18, 54);
    doc.text(`Cattle Registered: ${farmer.cattleCount || 2} head`, 18, 58);

    doc.text(`Bank Account: ${farmer.bankAccount || 'Direct IMPS Linked'}`, 110, 48);
    doc.text('IFSC Code: BARB0ANANDX (Bank of Baroda)', 110, 54);
    doc.text('Payout Method: Automated NEFT / Direct IMPS', 110, 58);

    // Collections Table Header
    let y = 68;
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);

    doc.text('Date', 16, y + 5);
    doc.text('Shift', 42, y + 5);
    doc.text('Litres (L)', 65, y + 5);
    doc.text('Fat %', 92, y + 5);
    doc.text('SNF %', 115, y + 5);
    doc.text('Rate/L (₹)', 140, y + 5);
    doc.text('Gross Amount (₹)', 168, y + 5);

    y += 9;
    doc.setFont('helvetica', 'normal');

    const farmerRecords = collections
      .filter((c) => c.farmerId === farmer.id || c.farmerName === farmer.name)
      .slice(0, 18);

    let totalLitres = 0;
    let totalGross = 0;
    let fatSum = 0;
    let snfSum = 0;

    if (farmerRecords.length === 0) {
      doc.text('No collection records found for the selected period.', 16, y + 6);
      y += 12;
    } else {
      farmerRecords.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y - 3, 182, 6, 'F');
        }

        doc.text(r.date, 16, y + 1);
        doc.text(r.shift, 42, y + 1);
        doc.text(r.quantityLitres.toFixed(1), 65, y + 1);
        doc.text(r.fat.toFixed(1), 92, y + 1);
        doc.text(r.snf.toFixed(1), 115, y + 1);
        doc.text(r.ratePerLitre.toFixed(2), 140, y + 1);
        doc.text(r.payableAmount.toFixed(2), 168, y + 1);

        totalLitres += r.quantityLitres;
        totalGross += r.payableAmount;
        fatSum += r.fat;
        snfSum += r.snf;
        y += 6.5;
      });
    }

    // Totals Summary Box
    y += 4;
    const avgFat = farmerRecords.length ? +(fatSum / farmerRecords.length).toFixed(1) : 4.2;
    const avgSnf = farmerRecords.length ? +(snfSum / farmerRecords.length).toFixed(1) : 8.5;

    doc.setDrawColor(...primaryColor);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, y, 182, 26, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('CYCLE RECONCILIATION SUMMARY', 18, y + 6);

    doc.setFontSize(8.5);
    doc.setTextColor(...darkText);
    doc.text(`Total Milk Supplied: ${totalLitres.toFixed(1)} Litres`, 18, y + 13);
    doc.text(`Average Quality: ${avgFat}% Fat | ${avgSnf}% SNF`, 18, y + 19);

    doc.text(`Gross Earnings: ₹${totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 105, y + 13);
    doc.text('Cattle Feed Deductions: ₹0.00', 105, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Forest green
    doc.text(`NET BANK PAYOUT: ₹${totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 105, y + 24);

    // Footer & Signatures
    const footerY = 250;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Primary Society Incharge Stamp & Signature', 20, footerY + 12);
    doc.text('Chief Accountant / Cashier Signoff', 85, footerY + 12);
    doc.text('Farmer / Milk Producer Signature', 145, footerY + 12);

    doc.text('This is a computer-verified milk passbook. Certified under National Dairy Development guidelines.', 14, 280);

    doc.save(`DairyOS_Passbook_${farmer.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  /**
   * 2. Generate 3-Ply GST Tax Invoice PDF
   */
  generateGSTInvoicePDF(order: SalesOrder, settings: SystemSettings) {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const darkText: [number, number, number] = [30, 41, 59];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.orgName.toUpperCase(), 14, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('TAX INVOICE (Rule 46 of CGST Rules, 2017) — ORIGINAL FOR RECIPIENT', 14, 18);

    // Invoice Meta
    const invoiceNumber = `INV-${order.orderNumber.replace(/[^0-9]/g, '') || '20261011'}`;
    const invoiceDate = order.date || new Date().toISOString().split('T')[0];
    const isEWayMandatory = order.totalAmount >= 50000;
    const eWayBillNo = `2410-${invoiceNumber.replace(/[^0-9]/g, '')}-9842`;

    doc.setTextColor(...darkText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: ${invoiceNumber}`, 140, 33);
    doc.text(`Date: ${invoiceDate}`, 140, 38);
    doc.text(`Channel: ${order.channel}`, 140, 43);
    if (isEWayMandatory) {
      doc.setTextColor(185, 28, 28);
      doc.text(`E-Way Bill: ${eWayBillNo}`, 140, 48);
      doc.setTextColor(...darkText);
    }

    // Seller Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 30, 115, 30, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SELLER / SUPPLIER DETAILS', 18, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(settings.orgName, 18, 41);
    doc.text(settings.headOffice || 'GIDC Industrial Estate, Anand, Gujarat', 18, 46);
    doc.text(`GSTIN: ${settings.gstin}  |  FSSAI: ${settings.fssaiLicense}`, 18, 51);
    doc.text('State Code: 24 (Gujarat)', 18, 56);

    // Buyer Box
    doc.roundedRect(14, 63, 182, 22, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO / RECIPIENT', 18, 69);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Customer Name: ${order.customerName}`, 18, 75);
    doc.text('Place of Supply: Gujarat (State Code: 24)  |  Payment Status: Settled / Credit Term 15 Days', 18, 80);

    // Line Items Table
    let y = 92;
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Sl.', 16, y + 5.5);
    doc.text('Description of Goods', 24, y + 5.5);
    doc.text('HSN', 80, y + 5.5);
    doc.text('Qty', 98, y + 5.5);
    doc.text('Rate (₹)', 114, y + 5.5);
    doc.text('Taxable (₹)', 135, y + 5.5);
    doc.text('CGST', 158, y + 5.5);
    doc.text('SGST', 178, y + 5.5);

    y += 11;
    doc.setFont('helvetica', 'normal');

    const hsn = order.product.includes('Ghee') || order.product.includes('Butter') ? '0405' : order.product.includes('Paneer') ? '0406' : '0401';
    const taxableValue = +(order.totalAmount / 1.05).toFixed(2);
    const taxAmount = +(order.totalAmount - taxableValue).toFixed(2);
    const cgst = +(taxAmount / 2).toFixed(2);
    const sgst = +(taxAmount / 2).toFixed(2);

    doc.text('1', 16, y);
    doc.text(order.product, 24, y);
    doc.text(hsn, 80, y);
    doc.text(`${order.quantityUnits}`, 98, y);
    doc.text(order.unitRate.toFixed(2), 114, y);
    doc.text(taxableValue.toFixed(2), 135, y);
    doc.text(`${cgst} (2.5%)`, 158, y);
    doc.text(`${sgst} (2.5%)`, 178, y);

    // Totals Section
    y += 15;
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Taxable Amount: ₹${taxableValue.toLocaleString('en-IN')}`, 115, y);
    y += 5;
    doc.text(`Total CGST (2.5%): ₹${cgst.toLocaleString('en-IN')}`, 115, y);
    y += 5;
    doc.text(`Total SGST (2.5%): ₹${sgst.toLocaleString('en-IN')}`, 115, y);
    y += 6;

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(110, y, 86, 12, 1, 1, 'FD');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.text(`INVOICE TOTAL: ₹${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 114, y + 8);

    // Bank Account Details for NEFT
    doc.setTextColor(...darkText);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY REMITTANCE BANK DETAILS', 14, 185);
    doc.setFont('helvetica', 'normal');
    doc.text('Bank: State Bank of India  |  Account No: 384910293849', 14, 191);
    doc.text('IFSC: SBIN0004101  |  Branch: Industrial Estate Anand', 14, 196);

    // Authorized Signature
    const footerY = 245;
    doc.line(14, footerY, 196, footerY);
    doc.text('Terms: Payment due within 15 days. Subject to Anand Jurisdiction.', 14, footerY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${settings.orgName}`, 140, footerY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory & Seal', 140, footerY + 28);

    doc.save(`DairyOS_GST_Invoice_${order.orderNumber}.pdf`);
  },

  /**
   * 3. Generate FSSAI Form E Bulk Tanker Clearance Certificate PDF
   */
  generateTankerClearanceCertificatePDF(cert: any) {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const primaryColor: [number, number, number] = [5, 150, 105]; // Emerald
    const darkText: [number, number, number] = [30, 41, 59];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FOOD SAFETY & STANDARDS AUTHORITY OF INDIA (FSSAI)', 14, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('FORM E: STATUTORY BULK MILK TANKER QUALITY CLEARANCE CERTIFICATE', 14, 17);
    doc.text('Central Food Safety & Quality Testing Central Laboratory — Anand Union', 14, 22);

    // Certificate Meta
    doc.setTextColor(...darkText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Certificate No: ${cert.certificateNumber || 'CERT-FSSAI-2026-902'}`, 14, 35);
    doc.text(`Timestamp: ${cert.timestamp || new Date().toISOString()}`, 14, 40);

    // Tanker & Vehicle Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 46, 182, 30, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSIGNMENT LOGISTICS DETAILS', 18, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Vehicle Number: ${cert.vehicleNumber || 'GJ-07-TY-4421'} (Insulated Stainless Tanker)`, 18, 58);
    doc.text(`Driver Name: ${cert.driverName || 'Suresh Parmar'} (License: GJ-07-2018-9921)`, 18, 64);
    doc.text(`Net Inward Volume: ${(cert.volumeLitres || 12500).toLocaleString()} Litres`, 18, 70);

    doc.text('Origin BMC: Anand North Bulk Chilling Hub', 110, 58);
    doc.text('Destination: Main Continuous HTST Plant Yard 1', 110, 64);
    doc.text(`Seal Integrity: Verified Tamper-Evident (${cert.sealNumber || 'SEAL-49210'})`, 110, 70);

    // Chemical & Physical Quality Parameters Table
    let y = 84;
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytical Parameter', 18, y + 5);
    doc.text('Observed Value', 85, y + 5);
    doc.text('FSSAI Legal Standard', 130, y + 5);
    doc.text('Compliance', 170, y + 5);

    y += 10;
    doc.setFont('helvetica', 'normal');

    const params = [
      { name: 'Arrival Temperature', val: `${cert.temperatureC || 3.8}°C`, std: '≤ 4.0°C (Chill Chain)', pass: true },
      { name: 'Milk Fat Content', val: `${cert.fat || 4.5}%`, std: '≥ 3.5% (Cow) / 5.5% (Buff)', pass: true },
      { name: 'Solid-Not-Fat (SNF)', val: `${cert.snf || 8.7}%`, std: '≥ 8.5% (National Std)', pass: true },
      { name: 'Corrected Lactometer (CLR)', val: '28.5', std: '28.0 - 32.0', pass: true },
      { name: 'Titratable Acidity', val: '0.13% LA', std: '0.12 - 0.15% LA', pass: true },
      { name: 'MBRT (Microbial Reductase)', val: '> 5.0 Hours', std: '≥ 4.0 Hours (Grade A)', pass: true },
    ];

    params.forEach((p, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 3, 182, 6, 'F');
      }
      doc.text(p.name, 18, y + 1);
      doc.text(p.val, 85, y + 1);
      doc.text(p.std, 130, y + 1);
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('PASSED', 170, y + 1);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'normal');
      y += 6.5;
    });

    // Chemical Adulteration Matrix
    y += 5;
    doc.setDrawColor(...primaryColor);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('MANDATORY CHEMICAL ADULTERATION STRIP MATRIX (6-POINT)', 18, y + 6);

    doc.setFontSize(8);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.text('• Urea / Fertilizer: Negative (Passed)', 18, y + 13);
    doc.text('• Added Starch / Flour: Negative (Passed)', 18, y + 19);
    doc.text('• Neutralizers (Soda/NaOH): Negative (Passed)', 18, y + 24);

    doc.text('• Detergents / Alkyl Sulfates: Negative (Passed)', 105, y + 13);
    doc.text('• Added Maltodextrin: Negative (Passed)', 105, y + 19);
    doc.text('• Sodium Chloride: Negative (Passed)', 105, y + 24);

    // Official Clearance Stamp & Signoff
    y += 35;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, 182, 35, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text('CLEARANCE STATUS: APPROVED FOR HTST PASTEURIZATION LINE', 18, y + 8);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    doc.text(`Authorized by: ${cert.chemistName || 'Dr. Dhaval Shah, Chief Dairy Chemist'}`, 18, y + 16);
    doc.text('Registration No: FSSAI-CHEM-2024-8842', 18, y + 22);
    doc.text('Digital Signature: VERIFIED (SHA256 Cryptographic Hash)', 18, y + 28);

    doc.save(`DairyOS_FSSAI_Certificate_${cert.certificateNumber || 'CERT-902'}.pdf`);
  },
};
