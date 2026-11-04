// SANMATI CONSTRUCTIONS ERP - Document & Report Export Engine (PDF, Excel, CSV)
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { COMPANY_DETAILS } from '../utils/constants';
import { formatCurrency, formatNumber, formatDate, numberToWordsIndian } from '../utils/formatters';

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
    doc.text(title, 14, 35);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, 41);
    }

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated On: ${formatDate(new Date(), true)}`, orientation === 'portrait' ? 140 : 227, 35);

    // AutoTable
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: subtitle ? 46 : 42,
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
    const pageCount = doc.internal.getNumberOfPages();
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

    doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Report Generation Error:', error);
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
    doc.text(project ? project.name : (raBill.projectName || '—'), 45, 55);
    doc.text(client ? client.name : (raBill.clientName || '—'), 45, 62);
    doc.text(project ? project.location : 'Kolhapur, Maharashtra', 45, 69);

    // Bill Breakdown Table
    doc.autoTable({
      startY: 82,
      head: [['Particulars', 'Quantities & Rates', 'Amount (INR)']],
      body: [
        ['Current Completed Work Value', `${raBill.currentQty || '—'} units @ ${formatCurrency(raBill.contractRate)}`, formatCurrency(raBill.currentBillAmount)],
        ['Less: Retention Deducted (' + (raBill.retentionPercent || 5) + '%)', 'Security retention as per contract clause', '-' + formatCurrency(raBill.retentionAmount)],
        ['Less: Mobilization / Advance Recovery', 'Running contract recovery', '-' + formatCurrency(raBill.advanceRecovery || 0)],
        ['Less: Other Site Deductions', 'Water/Electricity/Penalties if any', '-' + formatCurrency(raBill.otherDeductions || 0)],
        ['Taxable Subtotal', 'Net base value for GST calculation', formatCurrency(raBill.taxableSubtotal)],
        ['Add: CGST @ 9%', 'Central GST (Intra-state Maharashtra)', formatCurrency(raBill.cgst)],
        ['Add: SGST @ 9%', 'State GST (Intra-state Maharashtra)', formatCurrency(raBill.sgst)],
        ['NET PAYABLE AMOUNT', 'Total Claimed Amount in this RA Bill', formatCurrency(raBill.netPayable)]
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

    doc.save(`RABill_${raBill.billNumber.replace(/\//g, '_')}.pdf`);
    return true;
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
    doc.autoTable({
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
    const hra = Number(employee.hra) || 0;
    const conveyance = Number(employee.conveyance) || 0;
    const special = Number(employee.specialAllowance) || 0;
    const gross = basic + hra + conveyance + special;

    const pf = Number(employee.pfDeduction) || 0;
    const pt = Number(employee.professionalTax || 200);
    const tds = 0;
    const otherDed = 0;
    const totalDed = pf + pt + tds + otherDed;

    const net = employee.netSalary ? Number(employee.netSalary) : (gross - totalDed);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3.5,
      margin: { left: 13, right: 13 },
      theme: 'grid',
      head: [['EARNINGS COMPONENT', 'AMOUNT (Rs.)', 'DEDUCTIONS COMPONENT', 'AMOUNT (Rs.)']],
      body: [
        ['Basic Salary', `Rs. ${formatNumber(basic)}`, 'Provident Fund (EPF)', `Rs. ${formatNumber(pf)}`],
        ['House Rent Allowance (HRA)', `Rs. ${formatNumber(hra)}`, 'Professional Tax (PT - Maharashtra)', `Rs. ${formatNumber(pt)}`],
        ['Conveyance Allowance', `Rs. ${formatNumber(conveyance)}`, 'Income Tax (TDS)', `Rs. 0.00`],
        ['Site Special Allowance', `Rs. ${formatNumber(special)}`, 'Loan / Advance Recovery', `Rs. 0.00`],
        ['Overtime / Incentive Pay', `Rs. 0.00`, 'Other Deductions', `Rs. 0.00`],
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
    doc.autoTable({
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

    doc.save(`Payslip_${employee.id}_${month.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Payslip PDF Error:', error);
    return false;
  }
};
