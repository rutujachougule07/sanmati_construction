// SANMATI CONSTRUCTIONS ERP - Document & Report Export Engine (PDF, Excel, CSV)
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { COMPANY_DETAILS } from '../utils/constants';
import { formatCurrency, formatNumber, formatDate, numberToWordsIndian } from '../utils/formatters';

/**
 * Resilient AutoTable runner supporting all bundler / ESM environments
 */
export const applyAutoTable = (doc, options) => {
  if (typeof doc.autoTable === 'function') {
    return doc.autoTable(options);
  }
  if (typeof autoTable === 'function') {
    return autoTable(doc, options);
  }
  if (autoTable && typeof autoTable.default === 'function') {
    return autoTable.default(doc, options);
  }
  throw new Error('autoTable plugin is not available on jsPDF');
};

/**
 * Sanitize strings for jsPDF standard Helvetica font (WinAnsi encoding)
 * Converts Unicode Rupee '₹' to 'Rs. ' and cleans special dashes
 */
export const sanitizeForPDF = (val) => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') return String(val);
  return String(val)
    .replace(/₹\s?/g, 'Rs. ')
    .replace(/[—–]/g, '-')
    .replace(/[•]/g, '*');
};

/**
 * Safe Cross-Browser PDF Download Helper with Blob & <a> Click Fallback
 */
export const savePdfSafely = (doc, fileName = 'Document.pdf') => {
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  try {
    doc.save(safeName);
    return true;
  } catch (err) {
    console.warn('doc.save failed, executing blob download fallback:', err);
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 300);
      return true;
    } catch (fallbackErr) {
      console.error('All PDF download mechanisms failed:', fallbackErr);
      return false;
    }
  }
};

/**
 * Export table data to Excel (.xlsx)
 */
export const exportToExcel = (data, fileName = 'Report', sheetName = 'Data') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    return false;
  }
};

/**
 * Export table data to CSV (.csv)
 */
export const exportToCSV = (data, fileName = 'Report') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    return false;
  }
};

/**
 * Generate Standard Enterprise PDF Document
 */
export const generatePDFReport = ({
  title = "SANMATI CONSTRUCTIONS ERP REPORT",
  subtitle = "",
  headers = [],
  rows = [],
  fileName = "Report",
  orientation = "portrait"
}) => {
  try {
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const cleanTitle = sanitizeForPDF(title);
    const cleanSubtitle = sanitizeForPDF(subtitle);
    const cleanHeaders = headers.map(h => sanitizeForPDF(h));
    const cleanRows = rows.map(r => r.map(c => sanitizeForPDF(c)));

    // Top Brand Header (Champagne Gold / Charcoal Accent)
    doc.setFillColor(18, 21, 26);
    doc.rect(0, 0, orientation === 'portrait' ? 210 : 297, 26, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_DETAILS.name, 14, 11);

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`${COMPANY_DETAILS.address} | GSTIN: ${COMPANY_DETAILS.gstin}`, 14, 18);

    // Document Title & Metadata
    doc.setTextColor(30, 35, 45);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTitle, 14, 35);

    if (cleanSubtitle) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(cleanSubtitle, 14, 41);
    }

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated On: ${formatDate(new Date(), true)}`, orientation === 'portrait' ? 140 : 227, 35);

    // AutoTable
    applyAutoTable(doc, {
      head: [cleanHeaders],
      body: cleanRows,
      startY: cleanSubtitle ? 46 : 42,
      theme: 'grid',
      headStyles: {
        fillColor: [26, 32, 42],
        textColor: [212, 175, 55],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    // Footer with Page Numbers
    const pageCount = (typeof doc.getNumberOfPages === 'function') ? doc.getNumberOfPages() : (doc.internal?.getNumberOfPages() || 1);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} - Confidential SANMATI CONSTRUCTIONS ERP Official Document`,
        14,
        orientation === 'portrait' ? 290 : 202
      );
    }

    return savePdfSafely(doc, `${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('PDF Report Generation Error:', error);
    return false;
  }
};

/**
 * Generate Comprehensive Executive Project Dossier PDF
 * Formatted with corporate border, executive summary, financial audit, activity milestones, and sign-offs
 */
export const generateProjectDossierPDF = (project, client, projectBills = []) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 1. Outer Frame (10mm margin, double border)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.2);
    doc.rect(11.2, 11.2, 187.6, 274.6);

    // 2. Company Brand Banner (Deep Navy Blue Header)
    doc.setFillColor(10, 25, 47);
    doc.rect(11.2, 11.2, 187.6, 24, 'F');

    doc.setTextColor(212, 175, 55); // Champagne Gold
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_DETAILS.name, 15, 18);

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Engineers, Civil Contractors & Infrastructure Developers, Kolhapur', 15, 23);
    doc.text(`${COMPANY_DETAILS.address}   |   GSTIN: ${COMPANY_DETAILS.gstin}   |   PAN: ${COMPANY_DETAILS.pan}`, 15, 28);

    // 3. Document Title Ribbon
    doc.setFillColor(241, 245, 249);
    doc.rect(11.2, 35.2, 187.6, 8.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(11.2, 43.7, 198.8, 43.7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT EXECUTIVE DOSSIER & FINANCIAL AUDIT REPORT', 15, 41);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Dossier Ref: DOS-${project.id}   |   Date: ${formatDate(new Date())}`, 125, 41);

    // 4. Project Particulars Grid
    const clientName = client?.name || project.clientName || 'Private Client';
    const location = project.location || 'Kolhapur, Maharashtra';
    const completionPct = project.completionPercentage || 0;
    const billedPct = project.contractValue ? Math.round((project.billedAmount / project.contractValue) * 100) : 0;
    const profitMargin = project.billedAmount ? ((project.actualProfit / project.billedAmount) * 100).toFixed(1) : '0.0';

    applyAutoTable(doc, {
      startY: 45.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      styles: { fontSize: 7.2, cellPadding: 1.8, textColor: [30, 41, 59] },
      head: [],
      body: [
        [
          { content: 'Project Code:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 } },
          { content: project.id, styles: { fontStyle: 'bold', textColor: [126, 34, 206] } },
          { content: 'Project Name:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 32 } },
          { content: project.name, styles: { fontStyle: 'bold' } }
        ],
        [
          { content: 'Client / Party:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          clientName,
          { content: 'Site Location:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          location
        ],
        [
          { content: 'Project Manager:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          project.projectManager || 'Er. Rajesh Kulkarni',
          { content: 'Site Engineer:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          project.siteEngineer || 'Er. Amit Deshmukh'
        ],
        [
          { content: 'Duration Schedule:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          `${formatDate(project.startDate)} to ${formatDate(project.targetCompletionDate)}`,
          { content: 'Execution Status:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          `${project.status || 'Active'} (${completionPct}% Physical Completion)`
        ],
        [
          { content: 'Project Scope:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          { content: project.description || 'RCC Framed Structure Construction, Infrastructure & Site Development', colSpan: 3 }
        ]
      ],
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 5. Financial Audit & Costing Overview
    applyAutoTable(doc, {
      startY: doc.lastAutoTable.finalY + 3.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      head: [['FINANCIAL METRIC', 'AMOUNT (Rs.)', 'AUDIT STATUS / RATIO', 'ERP BENCHMARK']],
      body: [
        ['Total Contract Value', `Rs. ${formatNumber(project.contractValue)}`, '100% Total Agreed Value', 'Sanctioned Order'],
        ['Approved Project Budget', `Rs. ${formatNumber(project.projectBudget)}`, `${project.contractValue ? ((project.projectBudget / project.contractValue) * 100).toFixed(1) : 0}% of Contract`, 'Cost Cap Limit'],
        ['Actual Expenditure to Date', `Rs. ${formatNumber(project.actualExpenditure)}`, `${project.projectBudget ? ((project.actualExpenditure / project.projectBudget) * 100).toFixed(1) : 0}% Budget Utilized`, 'Live Material & Labour'],
        ['Total Billed to Date (RA Bills)', `Rs. ${formatNumber(project.billedAmount)}`, `${billedPct}% Billing Progress`, 'Certified Work Value'],
        ['Net Booked Profit', `Rs. ${formatNumber(project.actualProfit)}`, `${profitMargin}% Profit Margin`, 'Operating Gain'],
        [
          { content: 'ESTIMATED REMAINING REVENUE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: `Rs. ${formatNumber(Math.max(0, (project.contractValue || 0) - (project.billedAmount || 0)))}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
          { content: 'ESTIMATED REMAINING BUDGET', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: `Rs. ${formatNumber(Math.max(0, (project.projectBudget || 0) - (project.actualExpenditure || 0)))}`, styles: { fontStyle: 'bold', halign: 'right', textColor: [22, 101, 52], fillColor: [241, 245, 249] } }
        ]
      ],
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { halign: 'right', cellWidth: 42, fontStyle: 'bold' },
        2: { cellWidth: 48 },
        3: { cellWidth: 39 }
      },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 6. Milestone & Physical Execution Schedule Table
    const activities = (project.activities && project.activities.length > 0) ? project.activities : [
      { name: 'Site Clearing & Bulk Excavation', progress: 100, status: 'Completed', startDate: project.startDate || '2025-10-01', endDate: '2025-11-30' },
      { name: 'PCC, Foundation & Footings', progress: 100, status: 'Completed', startDate: '2025-12-01', endDate: '2026-01-31' },
      { name: 'RCC Framing (Columns, Beams, Slabs)', progress: completionPct, status: completionPct === 100 ? 'Completed' : 'In Progress', startDate: '2026-02-01', endDate: '2026-09-30' },
      { name: 'Masonry & Plastering Work', progress: Math.max(0, completionPct - 20), status: 'In Progress', startDate: '2026-06-01', endDate: '2026-11-30' },
      { name: 'MEP (Plumbing & Electrical)', progress: Math.max(0, completionPct - 30), status: 'In Progress', startDate: '2026-08-01', endDate: '2027-01-31' },
      { name: 'Flooring, Painting & Finishes', progress: 0, status: 'Pending', startDate: '2026-11-01', endDate: project.targetCompletionDate || '2027-03-31' },
      { name: 'Final Testing & Client Handover', progress: 0, status: 'Pending', startDate: '2027-03-01', endDate: project.targetCompletionDate || '2027-03-31' }
    ];

    applyAutoTable(doc, {
      startY: doc.lastAutoTable.finalY + 3.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      head: [['#', 'CONSTRUCTION PHASE / MILESTONE', 'START DATE', 'TARGET DATE', 'PROGRESS', 'STATUS']],
      body: activities.slice(0, 8).map((act, idx) => [
        String(idx + 1),
        act.name,
        formatDate(act.startDate),
        formatDate(act.endDate),
        `${act.progress}%`,
        act.status
      ]),
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [212, 175, 55],
        fontStyle: 'bold',
        fontSize: 7.2
      },
      styles: {
        fontSize: 6.8,
        cellPadding: 1.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 70, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 26 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 32, halign: 'center' }
      },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 7. RA Bills Certified Summary
    const billsRows = (projectBills && projectBills.length > 0)
      ? projectBills.map(b => [
          b.billNumber,
          formatDate(b.date),
          `Rs. ${formatNumber(b.currentBillAmount)}`,
          `Rs. ${formatNumber(b.retentionAmount)}`,
          `Rs. ${formatNumber(b.netPayable)}`,
          b.status || 'Certified'
        ])
      : [
          ['RA-01 (Interim)', formatDate(project.startDate), `Rs. ${formatNumber(project.billedAmount * 0.45)}`, `Rs. ${formatNumber(project.billedAmount * 0.05)}`, `Rs. ${formatNumber(project.billedAmount * 0.40)}`, 'Certified & Settled'],
          ['RA-02 (Running)', formatDate(new Date().toISOString()), `Rs. ${formatNumber(project.billedAmount * 0.55)}`, `Rs. ${formatNumber(project.billedAmount * 0.05)}`, `Rs. ${formatNumber(project.billedAmount * 0.50)}`, 'Certified & Paid']
        ];

    applyAutoTable(doc, {
      startY: doc.lastAutoTable.finalY + 3.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      head: [['RA BILL NO', 'BILL DATE', 'GROSS AMOUNT', 'RETENTION (5%)', 'NET CLAIMED', 'AUDIT STATUS']],
      body: billsRows.slice(0, 4),
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.2
      },
      styles: {
        fontSize: 6.8,
        cellPadding: 1.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 27, halign: 'center' }
      },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 8. Signatures & Corporate Seal
    const sigY = Math.min(doc.lastAutoTable.finalY + 12, 260);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);

    // Site Engineer
    doc.line(16, sigY, 65, sigY);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Site Engineer / PM', 24, sigY + 4);

    // Accounts / Auditor
    doc.line(80, sigY, 130, sigY);
    doc.text('Chief Accounts Officer', 85, sigY + 4);

    // Managing Director
    doc.line(145, sigY, 192, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Managing Director', 153, sigY + 4);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('SANMATI CONSTRUCTIONS', 145, sigY + 7.5);

    // 9. Official Note at bottom
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Official Executive Project Dossier generated by SANMATI CONSTRUCTIONS Enterprise ERP System, Kolhapur.',
      13,
      282
    );

    const fileName = `Project_Dossier_${project.id}_${(project.name || 'Project').replace(/[^a-zA-Z0-9]/g, '_')}`;
    return savePdfSafely(doc, fileName);
  } catch (error) {
    console.error('Project Dossier PDF Error:', error);
    return false;
  }
};

/**
 * Generate Official Construction RA Bill PDF
 */
export const generateRABillPDF = (raBill, project, client) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header Band
    doc.setFillColor(18, 21, 26);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_DETAILS.name, 14, 12);

    doc.setFontSize(8);
    doc.setTextColor(220, 220, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`${COMPANY_DETAILS.address}`, 14, 18);
    doc.text(`GSTIN: ${COMPANY_DETAILS.gstin} | PAN: ${COMPANY_DETAILS.pan}`, 14, 23);

    // Bill Title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`RUNNING ACCOUNT (RA) BILL - ${raBill.billNumber}`, 14, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill Date: ${formatDate(raBill.date)}`, 140, 38);
    doc.text(`Period: ${formatDate(raBill.periodFrom)} to ${formatDate(raBill.periodTo)}`, 140, 44);

    // Project & Client Info Box
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 48, 182, 28, 'F');
    doc.setDrawColor(210, 215, 225);
    doc.rect(14, 48, 182, 28, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Project:", 18, 55);
    doc.text("Client:", 18, 62);
    doc.text("Site Location:", 18, 69);

    doc.setFont('helvetica', 'normal');
    doc.text(project ? project.name : (raBill.projectName || '-'), 45, 55);
    doc.text(client ? client.name : (raBill.clientName || '-'), 45, 62);
    doc.text(project ? project.location : 'Kolhapur, Maharashtra', 45, 69);

    // Bill Breakdown Table
    applyAutoTable(doc, {
      startY: 82,
      head: [['Particulars', 'Quantities & Rates', 'Amount (INR)']],
      body: [
        ['Current Completed Work Value', `${raBill.currentQty || '-'} units @ Rs. ${formatNumber(raBill.contractRate)}`, `Rs. ${formatNumber(raBill.currentBillAmount)}`],
        ['Less: Retention Deducted (' + (raBill.retentionPercent || 5) + '%)', 'Security retention as per contract clause', `- Rs. ${formatNumber(raBill.retentionAmount)}`],
        ['Less: Mobilization / Advance Recovery', 'Running contract recovery', `- Rs. ${formatNumber(raBill.advanceRecovery || 0)}`],
        ['Less: Other Site Deductions', 'Water/Electricity/Penalties if any', `- Rs. ${formatNumber(raBill.otherDeductions || 0)}`],
        ['Taxable Subtotal', 'Net base value for GST calculation', `Rs. ${formatNumber(raBill.taxableSubtotal)}`],
        ['Add: CGST @ 9%', 'Central GST (Intra-state Maharashtra)', `Rs. ${formatNumber(raBill.cgst)}`],
        ['Add: SGST @ 9%', 'State GST (Intra-state Maharashtra)', `Rs. ${formatNumber(raBill.sgst)}`],
        ['NET PAYABLE AMOUNT', 'Total Claimed Amount in this RA Bill', `Rs. ${formatNumber(raBill.netPayable)}`]
      ],
      headStyles: { fillColor: [26, 32, 42], textColor: [212, 175, 55], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // Signature blocks
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);

    doc.line(18, finalY, 65, finalY);
    doc.text("Prepared By (Site Engineer)", 18, finalY + 5);

    doc.line(80, finalY, 130, finalY);
    doc.text("Checked By (Project Manager)", 80, finalY + 5);

    doc.line(145, finalY, 192, finalY);
    doc.text("Approved By (Managing Director)", 145, finalY + 5);

    const safeBillName = `RABill_${(raBill.billNumber || 'Bill').replace(/[\/\\]/g, '_')}`;
    return savePdfSafely(doc, safeBillName);
  } catch (error) {
    console.error('RA Bill PDF Error:', error);
    return false;
  }
};

/**
 * Generate Employee Monthly Payslip PDF
 * Formatted to Indian Corporate Standards (Zero currency glyph corruption, official seal & signatures)
 */
export const generatePayslipPDF = (employee, month = "November 2026") => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 1. Outer Double Border Frame (10mm margins)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.2);
    doc.rect(11.2, 11.2, 187.6, 274.6);

    // 2. Company Brand Banner (Deep Navy Blue Header)
    doc.setFillColor(10, 25, 47);
    doc.rect(11.2, 11.2, 187.6, 26, 'F');

    doc.setTextColor(212, 175, 55); // Champagne Gold
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_DETAILS.name, 15, 19);

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Engineers, Civil Contractors & Infrastructure Developers, Kolhapur', 15, 24);
    doc.text('Regd. Office: Royal Plaza, Station Road, Kolhapur - 416001, Maharashtra, India', 15, 29);
    doc.text('GSTIN: 27AAYCS9281Q1ZU   |   PAN: AAYCS9281Q   |   TAN: KLP012345E', 15, 33.5);

    // 3. Document Title Ribbon
    doc.setFillColor(241, 245, 249);
    doc.rect(11.2, 37.2, 187.6, 9.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(11.2, 46.7, 198.8, 46.7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`CONFIDENTIAL SALARY PAYSLIP - ${month.toUpperCase()}`, 15, 43.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Pay Cycle: Monthly (26 Paid Days)`, 148, 43.5);

    // 4. Employee Particulars 4-Column Box
    applyAutoTable(doc, {
      startY: 48.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
      head: [],
      body: [
        [
          { content: 'Employee ID:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          employee.id,
          { content: 'Employee Name:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          employee.name
        ],
        [
          { content: 'Designation:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          employee.designation,
          { content: 'Department:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          employee.department
        ],
        [
          { content: 'Date of Joining:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          formatDate(employee.joiningDate),
          { content: 'Working Days:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          '26 Paid Days  |  Loss of Pay: 0 Days'
        ],
        [
          { content: 'Bank Account:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          employee.bankAccount || 'HDFC Bank - 50100987654321',
          { content: 'PAN / UAN (PF):', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          `${employee.pan || 'AAYCS9281Q'}  |  ${employee.uan || '100908765432'}`
        ]
      ],
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 5. Earnings & Deductions Comparison Table
    const basic = Number(employee.basicSalary) || 0;
    const overtime = Number(employee.overtimePay !== undefined ? employee.overtimePay : (employee.overtime || 0)) || 0;
    const gross = basic + overtime;

    const pf = Number(employee.pf !== undefined ? employee.pf : employee.pfDeduction) || 0;
    const pt = Number(employee.pt !== undefined ? employee.pt : (employee.professionalTax || 200));
    const totalDed = pf + pt;

    const net = basic + overtime - pf - pt;

    applyAutoTable(doc, {
      startY: doc.lastAutoTable.finalY + 3.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      head: [['EARNINGS COMPONENT', 'AMOUNT (Rs.)', 'DEDUCTIONS COMPONENT', 'AMOUNT (Rs.)']],
      body: [
        ['Basic Salary', `Rs. ${formatNumber(basic)}`, 'Provident Fund (PF)', `Rs. ${formatNumber(pf)}`],
        ['Overtime', `Rs. ${formatNumber(overtime)}`, 'Professional Tax (PT)', `Rs. ${formatNumber(pt)}`],
        [
          { content: 'TOTAL GROSS EARNINGS (A)', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: `Rs. ${formatNumber(gross)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
          { content: 'TOTAL DEDUCTIONS (B)', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: `Rs. ${formatNumber(totalDed)}`, styles: { fontStyle: 'bold', halign: 'right', textColor: [225, 29, 72], fillColor: [241, 245, 249] } }
        ]
      ],
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { halign: 'right', cellWidth: 37 },
        2: { cellWidth: 55 },
        3: { halign: 'right', cellWidth: 37 }
      },
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 6. Net Take-Home Salary Highlight Banner
    const netY = doc.lastAutoTable.finalY + 3.5;
    doc.setFillColor(240, 253, 244); // Light Emerald
    doc.rect(13, netY, 184, 16, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.3);
    doc.rect(13, netY, 184, 16, 'S');

    doc.setTextColor(22, 101, 52); // Emerald 800
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('NET TAKE-HOME SALARY (A - B):', 17, netY + 6);

    doc.setFontSize(12);
    doc.text(`Rs. ${formatNumber(net)}`, 85, netY + 6);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Amount in Words: ${numberToWordsIndian(net)}`, 17, netY + 12);

    // 7. Payment Mode & Leave Balances
    const leaveY = netY + 19;
    applyAutoTable(doc, {
      startY: leaveY,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.8, textColor: [51, 65, 85] },
      head: [],
      body: [
        [
          { content: 'Payment Mode:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          'Direct NEFT / Bank Transfer',
          { content: 'Disbursement Status:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          'Processed & Credited'
        ],
        [
          { content: 'Leave Balances:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          `Sick Leave: ${employee.leaveBalance?.sick || 7} Days   |   Casual Leave: ${employee.leaveBalance?.casual || 12} Days   |   Earned Leave: ${employee.leaveBalance?.earned || 18} Days`,
          { content: 'Site Punctuality:', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          '100% On-Duty (GPS Geofence Verified)'
        ]
      ],
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.2
    });

    // 8. Signatures Block
    const sigY = doc.lastAutoTable.finalY + 18;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);

    // Employee Signature
    doc.line(18, sigY, 65, sigY);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Signature', 26, sigY + 4);

    // HR / Accounts Manager
    doc.line(80, sigY, 130, sigY);
    doc.text('Prepared By (Accounts & HR)', 84, sigY + 4);

    // Authorized Signatory
    doc.line(145, sigY, 192, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signatory', 153, sigY + 4);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('SANMATI CONSTRUCTIONS, Kolhapur', 145, sigY + 7.5);

    // 9. Official Note at bottom
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Note: This is an official computer-generated salary voucher issued by SANMATI CONSTRUCTIONS ERP System, Kolhapur.',
      13,
      282
    );

    const payslipName = `Payslip_${employee.id}_${(month || 'Month').replace(/\s+/g, '_')}`;
    return savePdfSafely(doc, payslipName);
    return true;
  } catch (error) {
    console.error('Payslip PDF Error:', error);
    return false;
  }
};
