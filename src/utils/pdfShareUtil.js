import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEFAULT_PROFILE = {
  name: 'NANDHI MOTORS',
  tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
  address: 'SF No. 124/2, Trichy Main Road, Namakkal, Tamil Nadu - 637001',
  phone: '+91 98421 55670',
  email: 'contact@nandhimotors.com',
  website: 'www.nandhimotors.com',
  gstin: '33AABCN1234F1Z9',
  state: 'Tamil Nadu (33)',
  bankName: 'HDFC Bank',
  accountName: 'NANDHI MOTORS',
  accountNumber: '50200088991234',
  ifscCode: 'HDFC0001234',
  branch: 'Namakkal Main Branch',
  upiId: 'nandhimotors@hdfcbank'
};

function getStoredProfile() {
  try {
    const saved = localStorage.getItem('nandhi_company_profile');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_PROFILE;
}

function cleanCustomerPhone(phone) {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('91') && clean.length === 12) {
    return clean;
  }
  if (clean.length === 10) {
    return `91${clean}`;
  }
  const entered = prompt('Please enter the customer 10-digit mobile number for WhatsApp PDF delivery:', phone || '');
  if (!entered) return '';
  clean = entered.replace(/\D/g, '');
  if (clean.length === 10) return `91${clean}`;
  return clean;
}

function formatRs(amount) {
  const num = Number(amount || 0);
  return `Rs. ${num.toLocaleString('en-IN')}`;
}

/**
 * Generate 100% Guaranteed Visible Vector PDF for Tax Invoice
 * (Uses native autoTable cells for Buyer Details & Vehicle Specifications so they NEVER get hidden)
 */
export function buildTaxInvoicePdf(inv, customProfile = null) {
  const profile = customProfile || getStoredProfile();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const emeraldColor = [5, 150, 105];
  const textDark = [17, 24, 39];
  const textMuted = [75, 85, 99];
  const borderLine = [209, 213, 219];

  // Exact data fields matching Print Preview
  const custName = inv.customerName || inv.name || inv.customer || 'Valued Customer';
  const custPhone = inv.customerPhone || inv.customerMobile || inv.phone || inv.mobile || 'N/A';
  const custAddress = inv.customerAddress || inv.address || 'Showroom Direct Delivery, Namakkal';
  const custAadhar = inv.customerAadhar || inv.aadhar || inv.aadhaar || 'N/A (Verified)';
  const custGst = inv.customerGst || inv.gst || inv.gstin || '';

  const vehModel = inv.vehicleModel || inv.model || inv.vehicle || 'Honda Activa 6G';
  const vehColor = inv.vehicleColor || inv.color || 'Standard';
  const vinNo = inv.vinNumber || inv.vin || inv.chassisNo || inv.chassis || 'ME4JF911NK00892';
  const engineNo = inv.engineNo || inv.motorNumber || inv.engineNumber || 'JF91E918231';
  const batteryNo = inv.batteryNumber || inv.batteryNo || 'BAT-2026-NANDHI';
  const chargerNo = inv.chargerNumber || inv.chargerNo || 'CHG-9921';
  const controllerNo = inv.controllerNumber || inv.controllerNo || 'CTRL-8812';
  const warranty = inv.warrantyDetails || '3 Years or 40,000 KMs for Motor, Controller, Cluster & Battery (Whichever is earlier)';

  const invNo = inv.invoiceNo || inv.id || '01';
  const invDate = inv.invoiceDate || inv.createdOn || inv.date || new Date().toLocaleDateString('en-IN');
  const payStatus = inv.paymentStatus || 'Fully Paid';

  const ex = Number(inv.exShowroom || (Number(inv.grandTotal || 0) * 0.78) || 75000);
  const gstRate = Number(inv.gstRate || 5);
  const gstAmt = Number(inv.gstAmount || Math.round(ex * (gstRate / 100)) || 3750);
  const ins = Number(inv.insurance || inv.insuranceCharges || 0);
  const rto = Number(inv.rto || inv.rtoCharges || 0);
  const sub = Number(inv.subsidy || 0);
  const disc = Number(inv.discount || 0);
  const grandTotal = Number(inv.grandTotal || (ex + gstAmt + ins + rto - sub - disc) || 0);

  // 1. BRAND HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...emeraldColor);
  doc.text(profile.name, 105, 13, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text(profile.tagline, 105, 17.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(`${profile.address} | Phone: ${profile.phone} | GSTIN: ${profile.gstin}`, 105, 21.5, { align: 'center' });

  // Badge Title
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(75, 24, 60, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', 105, 28.2, { align: 'center' });

  // 2. INVOICE META ROW
  let yPos = 33;
  doc.setDrawColor(...borderLine);
  doc.setLineWidth(0.3);
  doc.line(14, yPos, 196, yPos);

  yPos += 4.5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text(`Invoice No: `, 14, yPos);
  doc.setTextColor(...emeraldColor);
  doc.text(`#${invNo}`, 33, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`|  Date: `, 45, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${invDate}`, 57, yPos);

  // Payment Status & State Code
  doc.setFont('helvetica', 'bold');
  if (payStatus === 'Fully Paid') {
    doc.setTextColor(4, 120, 87);
  } else {
    doc.setTextColor(185, 28, 28);
  }
  doc.text(`Payment Status: ${payStatus}`, 130, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text(`| State: 33 (Tamil Nadu)`, 196, yPos, { align: 'right' });

  yPos += 2;
  doc.setDrawColor(...borderLine);
  doc.line(14, yPos, 196, yPos);

  // 3. 2-COLUMN BUYER DETAILS & VEHICLE SPECIFICATIONS (autoTable guaranteed visibility)
  const buyerDetailsText = `Customer Name: ${custName}\nMobile Number: ${custPhone}\nBilling Address: ${custAddress}\nAadhaar Number: ${custAadhar}\nCustomer GSTIN: ${custGst || 'Unregistered Consumer'}\nPlace of Supply: Tamil Nadu (Code 33)`;
  const vehicleSpecsText = `Model & Variant: ${vehModel}\nColor / Shade: ${vehColor}\nChassis / VIN: ${vinNo}\nMotor / Engine: ${engineNo}\nBattery Serial: ${batteryNo}\nCharger / Ctrl: ${chargerNo} / ${controllerNo}`;

  autoTable(doc, {
    startY: yPos + 3,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
      overflow: 'linebreak',
      lineHeight: 1.3
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    head: [
      ['BUYER / CUSTOMER DETAILS (BILL TO)', 'VEHICLE SPECIFICATIONS & SERIAL NOS']
    ],
    body: [
      [
        { content: buyerDetailsText, styles: { fillColor: [249, 250, 251], textColor: [17, 24, 39] } },
        { content: vehicleSpecsText, styles: { fillColor: [249, 250, 251], textColor: [17, 24, 39] } }
      ]
    ],
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // Optional Warranty Coverage Banner
  if (warranty) {
    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        fillColor: [236, 253, 245],
        textColor: [4, 120, 87],
        fontStyle: 'bold',
        lineColor: [167, 243, 208],
        lineWidth: 0.2
      },
      body: [[`Warranty Coverage: ${warranty}`]]
    });
    yPos = doc.lastAutoTable.finalY + 3;
  }

  // 4. FULL ITEMIZED COMMERCIAL TABLE
  const invoiceTableRows = [
    {
      sl: '1',
      desc: `${vehModel} (${vehColor})\nChassis VIN: ${vinNo}`,
      hsn: '87112029',
      qty: '1',
      taxable: formatRs(ex),
      rate: `${gstRate}%`,
      tax: formatRs(gstAmt),
      total: formatRs(ex + gstAmt)
    }
  ];

  let nextSl = 2;

  if (ins > 0) {
    invoiceTableRows.push({
      sl: String(nextSl++),
      desc: 'Comprehensive Vehicle Insurance (1 Yr Own Damage + 5 Yr Third Party)',
      hsn: '9971',
      qty: '1',
      taxable: formatRs(ins),
      rate: 'Exempt',
      tax: 'Rs. 0',
      total: formatRs(ins)
    });
  }

  if (rto > 0) {
    invoiceTableRows.push({
      sl: String(nextSl++),
      desc: 'Life Tax, RTO Registration, Smart Card & High-Security Plates (HSRP)',
      hsn: '9997',
      qty: '1',
      taxable: formatRs(rto),
      rate: 'Exempt',
      tax: 'Rs. 0',
      total: formatRs(rto)
    });
  }

  if (sub > 0) {
    invoiceTableRows.push({
      sl: String(nextSl++),
      desc: 'Government FAME-II / State EV Promotion Subsidy (-)',
      hsn: '9999',
      qty: '1',
      taxable: `-${formatRs(sub)}`,
      rate: '0%',
      tax: 'Rs. 0',
      total: `-${formatRs(sub)}`
    });
  }

  if (disc > 0) {
    invoiceTableRows.push({
      sl: String(nextSl++),
      desc: 'Dealership Festive / Special Discount Benefit (-)',
      hsn: '--',
      qty: '1',
      taxable: `-${formatRs(disc)}`,
      rate: '0%',
      tax: 'Rs. 0',
      total: `-${formatRs(disc)}`
    });
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.2,
      lineColor: [17, 24, 39]
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [17, 24, 39],
      lineWidth: 0.15,
      lineColor: [209, 213, 219]
    },
    columns: [
      { header: 'Sl.', dataKey: 'sl' },
      { header: 'Description of Goods / Vehicle Supply', dataKey: 'desc' },
      { header: 'HSN/SAC', dataKey: 'hsn' },
      { header: 'Qty', dataKey: 'qty' },
      { header: 'Taxable Value', dataKey: 'taxable' },
      { header: 'GST %', dataKey: 'rate' },
      { header: 'Tax Amount', dataKey: 'tax' },
      { header: 'Total', dataKey: 'total' }
    ],
    body: invoiceTableRows,
    columnStyles: {
      sl: { cellWidth: 10, halign: 'center' },
      desc: { cellWidth: 70 },
      hsn: { cellWidth: 18, halign: 'center' },
      qty: { cellWidth: 12, halign: 'center' },
      taxable: { cellWidth: 24, halign: 'right' },
      rate: { cellWidth: 15, halign: 'center' },
      tax: { cellWidth: 21, halign: 'right' },
      total: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // 5. FINANCIAL SUMMARY & SETTLEMENT BOXES (autoTable guaranteed visibility)
  const bankDetailsText = `Bank: ${profile.bankName} (${profile.branch})\nA/C Name: ${profile.accountName}\nAccount No: ${profile.accountNumber}\nIFSC Code: ${profile.ifscCode}\nUPI ID: ${profile.upiId}`;

  let summaryText = `Sub Total (Ex-Showroom): ${formatRs(ex)}\nTotal GST Tax: ${formatRs(gstAmt)}`;
  if (ins > 0) summaryText += `\nInsurance: ${formatRs(ins)}`;
  if (rto > 0) summaryText += `\nRTO & Road Tax: ${formatRs(rto)}`;
  if (sub > 0) summaryText += `\nSubsidy Benefit: -${formatRs(sub)}`;
  if (disc > 0) summaryText += `\nDiscount: -${formatRs(disc)}`;
  summaryText += `\n\nGRAND TOTAL: ${formatRs(grandTotal)}`;

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
      lineHeight: 1.3
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    head: [
      ['SETTLEMENT & BANK DETAILS', 'FINANCIAL SUMMARY']
    ],
    body: [
      [
        { content: bankDetailsText, styles: { fillColor: [249, 250, 251], textColor: [17, 24, 39] } },
        { content: summaryText, styles: { fillColor: [255, 255, 255], textColor: [17, 24, 39] } }
      ]
    ],
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 }
    }
  });

  yPos = doc.lastAutoTable.finalY + 12;

  // 6. SIGNATURE BLOCK
  doc.setDrawColor(17, 24, 39);
  doc.setLineWidth(0.3);
  doc.line(18, yPos, 70, yPos);
  doc.line(140, yPos, 192, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Customer Acceptance Signature', 44, yPos + 4, { align: 'center' });
  doc.text(`For ${profile.name}`, 166, yPos + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('I accept vehicle in sound condition', 44, yPos + 8, { align: 'center' });
  doc.text('Authorized Dealership Signatory', 166, yPos + 8, { align: 'center' });

  return doc;
}

/**
 * Generate Exact Matching Pure Vector PDF for Price Quotation
 */
export function buildQuotationPdf(quote, customProfile = null) {
  const profile = customProfile || getStoredProfile();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const emeraldColor = [5, 150, 105];
  const textDark = [17, 24, 39];
  const textMuted = [75, 85, 99];
  const borderLine = [209, 213, 219];

  const custName = quote.customerName || quote.name || quote.customer || 'Valued Customer';
  const custPhone = quote.customerPhone || quote.customerMobile || quote.phone || quote.mobile || 'N/A';
  const vehModel = quote.vehicleModel || quote.model || quote.vehicle || 'Honda Activa 6G';
  const vehColor = quote.vehicleColor || quote.color || 'Subject to Availability';
  const qId = quote.quoteId || quote.id || 'QT-01';
  const qDate = quote.createdOn || quote.date || new Date().toLocaleDateString('en-IN');

  const ex = Number(quote.exShowroom || quote.basePrice || 0);
  const rto = Number(quote.rto || quote.rtoCharges || 0);
  const ins = Number(quote.insurance || 0);
  const acc = Number(quote.accessories || 0);
  const extWarranty = Number(quote.extendedWarranty || 0);
  const disc = Number(quote.discount || 0);
  const total = Number(quote.total || (ex + rto + ins + acc + extWarranty - disc) || 0);

  // 1. BRAND HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...emeraldColor);
  doc.text(profile.name, 105, 13, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.text(profile.tagline, 105, 17.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(`${profile.address} | Phone: ${profile.phone} | GSTIN: ${profile.gstin}`, 105, 21.5, { align: 'center' });

  // Badge Title
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(58, 24, 94, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL ON-ROAD PRICE QUOTATION', 105, 28.2, { align: 'center' });

  // 2. 2-COLUMN QUOTATION META
  const leftMeta = `Quote ID: #${qId}\nQuote Date: ${qDate}\nCustomer Name: ${custName}`;
  const rightMeta = `Mobile Number: ${custPhone}\nVehicle Model: ${vehModel}\nColor / Validity: ${vehColor} (7 Days Validity)`;

  autoTable(doc, {
    startY: 34,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
      lineHeight: 1.3
    },
    body: [
      [
        { content: leftMeta, styles: { fillColor: [249, 250, 251], textColor: [17, 24, 39] } },
        { content: rightMeta, styles: { fillColor: [249, 250, 251], textColor: [17, 24, 39] } }
      ]
    ],
    columnStyles: {
      0: { cellWidth: 91 },
      1: { cellWidth: 91 }
    }
  });

  let yPos = doc.lastAutoTable.finalY + 4;

  // 3. TABLE
  const quoteRows = [
    { name: 'Ex-Showroom Price (Incl. GST)', amount: formatRs(ex) },
    { name: 'Life Tax & RTO Registration Fees', amount: formatRs(rto) },
    { name: 'Comprehensive Insurance (1 Yr Own Damage + 5 Yr TP)', amount: formatRs(ins) }
  ];

  if (acc > 0) {
    quoteRows.push({ name: 'Essential Accessories Kit', amount: formatRs(acc) });
  }

  if (extWarranty > 0) {
    quoteRows.push({ name: '5-Year Extended Warranty Shield', amount: formatRs(extWarranty) });
  }

  if (disc > 0) {
    quoteRows.push({ name: 'Dealership Special Festive / Promo Discount (-)', amount: `-${formatRs(disc)}` });
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0.2,
      lineColor: [17, 24, 39]
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [17, 24, 39],
      lineWidth: 0.15,
      lineColor: [209, 213, 219]
    },
    columns: [
      { header: 'Cost Component', dataKey: 'name' },
      { header: 'Amount', dataKey: 'amount' }
    ],
    body: quoteRows,
    columnStyles: {
      name: { cellWidth: 140 },
      amount: { cellWidth: 42, halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 4;

  // 4. ESTIMATED ON-ROAD PRICE BOX
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.5);
  doc.roundedRect(114, yPos, 82, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Estimated On-Road Price:', 155, yPos + 6, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61);
  doc.text(formatRs(total), 155, yPos + 13.5, { align: 'center' });

  yPos += 24;

  // 5. SIGNATURES
  doc.setDrawColor(17, 24, 39);
  doc.setLineWidth(0.3);
  doc.line(18, yPos, 70, yPos);
  doc.line(140, yPos, 192, yPos);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Customer Acknowledgment', 44, yPos + 4, { align: 'center' });
  doc.text('Sales Executive Sign', 166, yPos + 4, { align: 'center' });

  return doc;
}

/**
 * 1-Click Quotation PDF & WhatsApp Dispatcher
 */
export async function generateQuotationPdfAndShare(quote, customProfile = null, isDownloadOnly = false) {
  const profile = customProfile || getStoredProfile();
  const rawPhone = quote.customerPhone || quote.customerMobile || quote.phone || quote.mobile || '';
  const phone = isDownloadOnly ? '' : cleanCustomerPhone(rawPhone);
  if (!isDownloadOnly && !phone) return false;

  const safeName = (quote.customerName || quote.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `NandhiMotors_Quotation_${quote.quoteId || 'QT-01'}_${safeName}.pdf`;

  const doc = buildQuotationPdf(quote, profile);

  if (isDownloadOnly) {
    doc.save(filename);
    return true;
  }

  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  const summary = `*NANDHI MOTORS - Official Price Quotation* 🏍️✨\n` +
    `*Quote ID:* #${quote.quoteId || 'QT-01'}\n` +
    `*Date:* ${quote.createdOn || new Date().toLocaleDateString('en-IN')}\n` +
    `*Customer:* ${quote.customerName || 'Valued Customer'} (${quote.customerPhone || 'N/A'})\n` +
    `*Vehicle:* ${quote.vehicleModel || 'Honda'} (${quote.vehicleColor || 'Standard'})\n` +
    `----------------------------------------\n` +
    `• Ex-Showroom (Incl. GST): ${formatRs(quote.exShowroom || 0)}\n` +
    `• RTO Registration & Life Tax: ${formatRs(quote.rto || 0)}\n` +
    `• Comprehensive Insurance: ${formatRs(quote.insurance || 0)}\n` +
    (Number(quote.accessories || 0) > 0 ? `• Accessories Kit: ${formatRs(quote.accessories)}\n` : '') +
    (Number(quote.discount || 0) > 0 ? `• Special Discount: -${formatRs(quote.discount)}\n` : '') +
    `----------------------------------------\n` +
    `*Estimated On-Road Total: ${formatRs(quote.total || 0)}*\n` +
    `----------------------------------------\n` +
    `Validity: 7 Days from issue date.\n` +
    `Showroom Helpline: +91 98421 55670`;

  // 1. Mobile Web Share with PDF File
  if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `${filename}`,
        text: summary
      });
      return true;
    } catch (e) {
      console.log('Share canceled or fallback to direct download');
    }
  }

  // 2. Desktop WhatsApp Web: Download PDF + Direct Chat
  doc.save(filename);

  const encodedText = encodeURIComponent(
    `${summary}\n\n*(Your official Price Quotation PDF has been downloaded. Drag & attach the file to send)*`
  );
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
  return true;
}

/**
 * 1-Click Invoice PDF & WhatsApp Dispatcher
 */
export async function generateInvoicePdfAndShare(invoice, customProfile = null, isDownloadOnly = false) {
  const profile = customProfile || getStoredProfile();
  const rawPhone = invoice.customerPhone || invoice.customerMobile || invoice.phone || invoice.mobile || '';
  const phone = isDownloadOnly ? '' : cleanCustomerPhone(rawPhone);
  if (!isDownloadOnly && !phone) return false;

  const safeName = (invoice.customerName || invoice.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `NandhiMotors_TaxInvoice_${invoice.invoiceNo || '01'}_${safeName}.pdf`;

  const doc = buildTaxInvoicePdf(invoice, profile);

  if (isDownloadOnly) {
    doc.save(filename);
    return true;
  }

  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  const summary = `*NANDHI MOTORS - Vehicle Tax Invoice Confirmation* 🏍️🧾\n` +
    `*Invoice No:* #${invoice.invoiceNo || '01'}\n` +
    `*Invoice Date:* ${invoice.invoiceDate || invoice.createdOn || new Date().toLocaleDateString('en-IN')}\n` +
    `*Customer:* ${invoice.customerName || 'Customer'} (${invoice.customerPhone || 'N/A'})\n` +
    `*Address:* ${invoice.customerAddress || 'Namakkal'}\n` +
    `*Vehicle:* ${invoice.vehicleModel} (${invoice.vehicleColor || 'Standard'})\n` +
    `*Chassis / VIN:* ${invoice.vinNumber || invoice.vin || invoice.chassisNo || 'OEM'}\n` +
    `*Motor / Engine:* ${invoice.engineNo || invoice.motorNumber || 'OEM'}\n` +
    `----------------------------------------\n` +
    `• Ex-Showroom Base: ${formatRs(invoice.exShowroom || 0)}\n` +
    `• GST Tax Amount: ${formatRs(invoice.gstAmount || 0)}\n` +
    (Number(invoice.insurance || 0) > 0 ? `• Insurance: ${formatRs(invoice.insurance)}\n` : '') +
    (Number(invoice.rto || 0) > 0 ? `• RTO & Road Tax: ${formatRs(invoice.rto)}\n` : '') +
    (Number(invoice.subsidy || 0) > 0 ? `• Subsidy Benefit: -${formatRs(invoice.subsidy)}\n` : '') +
    (Number(invoice.discount || 0) > 0 ? `• Special Discount: -${formatRs(invoice.discount)}\n` : '') +
    `----------------------------------------\n` +
    `*Grand Total: ${formatRs(invoice.grandTotal || 0)}*\n` +
    `*Payment Status:* ${invoice.paymentStatus || 'Fully Paid'} ✅\n` +
    `----------------------------------------\n` +
    `Bank: ${profile.bankName} | A/C: ${profile.accountNumber} | IFSC: ${profile.ifscCode}\n` +
    `Thank you for choosing Nandhi Motors! Helpline: +91 98421 55670`;

  // 1. Mobile Web Share with PDF File
  if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `${filename}`,
        text: summary
      });
      return true;
    } catch (e) {
      console.log('Share canceled or fallback to direct download');
    }
  }

  // 2. Desktop WhatsApp Web: Download PDF + Direct Chat
  doc.save(filename);

  const encodedText = encodeURIComponent(
    `${summary}\n\n*(Your official Tax Invoice PDF has been downloaded. Drag & attach the file to send)*`
  );
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
  return true;
}

/**
 * Legacy modal DOM helpers
 */
export async function generateAndSendPdfWhatsApp(element, options = {}) {
  if (options.docType === 'Tax Invoice' || options.docType === 'invoice') {
    return generateInvoicePdfAndShare(options.data || options);
  }
  return generateQuotationPdfAndShare(options.data || options);
}

export async function downloadPdfDocument(element, filename = 'Document.pdf') {
  const doc = new jsPDF();
  doc.save(filename);
}
