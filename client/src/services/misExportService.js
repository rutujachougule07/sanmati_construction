// SANMATI CONSTRUCTIONS ERP - MIS Report PDF, Excel & Print Export Engine
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { applyAutoTable, sanitizeForPDF, savePdfSafely } from './exportService';
import { COMPANY_DETAILS } from '../utils/constants';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

export const hasDevanagari = (val) => DEVANAGARI_RE.test(String(val ?? ''));

/**
 * Sanitizes strings for PDF while keeping Devanagari characters intact for canvas glyph rendering
 * and converting Unicode Rupee / punctuation symbols to safe ASCII forms.
 */
export const sanitizeMISPdfText = (val) => {
  if (val === undefined || val === null) return '';
  const str = String(val)
    .replace(/\u20B9|₹/g, 'Rs. ')
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  if (hasDevanagari(str)) {
    return str.trim();
  }
  return sanitizeForPDF(str);
};

/**
 * Renders Devanagari/Marathi + mixed UTF-8 text to a high-DPI PNG data URL so jsPDF never outputs mojibake.
 */
const renderUnicodeTextToPng = (text, { widthMm = 40, fontSizePt = 8, bold = false, color = '#0f172a', align = 'left' } = {}) => {
  if (typeof document === 'undefined') return null;
  try {
    const pxPerMm = 3.7795275591;
    const scale = 3;
    const canvasWidth = Math.max(40, Math.round(widthMm * pxPerMm * scale));
    const fontPx = Math.max(20, Math.round(fontSizePt * 1.333 * scale));
    const lineHeight = Math.round(fontPx * 1.28);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fontFamily = '"Nirmala UI", "Noto Sans Devanagari", "Mangal", "Segoe UI", sans-serif';
    const fontSpec = `${bold ? 'bold ' : ''}${fontPx}px ${fontFamily}`;
    ctx.font = fontSpec;

    // Word-wrap across lines if text exceeds available width
    const words = String(text).split(/\s+/);
    const lines = [];
    let currentLine = '';
    const maxLinePx = canvasWidth - 6 * scale;

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxLinePx || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    const visibleLines = lines.slice(0, 3);

    const canvasHeight = Math.max(lineHeight + 6 * scale, visibleLines.length * lineHeight + 6 * scale);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.font = fontSpec;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';

    visibleLines.forEach((line, idx) => {
      const y = (idx + 0.5) * lineHeight + 3 * scale;
      if (align === 'right') {
        ctx.textAlign = 'right';
        ctx.fillText(line, canvasWidth - 3 * scale, y);
      } else if (align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(line, canvasWidth / 2, y);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(line, 2 * scale, y);
      }
    });

    return {
      dataUrl: canvas.toDataURL('image/png'),
      widthMm: canvasWidth / (pxPerMm * scale),
      heightMm: canvasHeight / (pxPerMm * scale)
    };
  } catch {
    return null;
  }
};

/**
 * Draws the Sanmati Constructions geometric emblem cleanly in vector PDF coordinates.
 */
const drawCompanyVectorLogo = (doc, x, y, sizeMm = 11) => {
  doc.setFillColor(0, 32, 70);
  doc.roundedRect(x, y, sizeMm, sizeMm, 1.8, 1.8, 'F');

  // Crisp architectural tower silhouette in white
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 2.2, y + 4.4, 1.9, 4.8, 'F');
  doc.rect(x + 4.6, y + 2.6, 2.2, 6.6, 'F');
  doc.rect(x + 7.2, y + 5.2, 1.8, 4.0, 'F');

  // Amber engineering accent bar
  doc.setFillColor(217, 119, 6);
  doc.rect(x + 1.8, y + 9.4, sizeMm - 3.6, 0.9, 'F');
};

/**
 * Generates an institutional A4 Portrait or Landscape MIS PDF Report with:
 * - Company Logo & Corporate Header
 * - Period & Project Filter Metadata
 * - Executive Summary KPI Cards
 * - Auto-paginated Table with repeated headers & Grand Totals
 * - Devanagari/Marathi cell rendering support
 * - Page X of Y Footer & Authorized Signature Block
 */
export const generateMISReportPDF = ({
  title = 'MIS Management Report',
  subtitle = '',
  periodLabel = '',
  projectLabel = 'All Projects',
  departmentLabel = 'All Departments',
  generatedBy = 'ERP Administrator',
  orientation = 'auto',
  summaryCards = [],
  headers = [],
  rows = [],
  totalsRow = null,
  numericColumnIndices = [],
  notes = [],
  fileName = 'Sanmati_MIS_Report.pdf'
}) => {
  const resolvedOrientation =
    orientation === 'portrait' || orientation === 'p'
      ? 'p'
      : orientation === 'landscape' || orientation === 'l'
        ? 'l'
        : headers.length >= 7
          ? 'l'
          : 'p';

  const doc = new jsPDF({
    orientation: resolvedOrientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const contentWidth = pageWidth - marginX * 2;
  const generatedTimestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Top Corporate Navy Banner
  doc.setFillColor(0, 32, 70);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 24, pageWidth, 1.1, 'F');

  drawCompanyVectorLogo(doc, marginX, 6.2, 11.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(sanitizeMISPdfText(COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS'), marginX + 14.5, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(203, 213, 225);
  const subLine = [COMPANY_DETAILS.address, COMPANY_DETAILS.gstin ? `GSTIN: ${COMPANY_DETAILS.gstin}` : '', COMPANY_DETAILS.pan ? `PAN: ${COMPANY_DETAILS.pan}` : '']
    .filter(Boolean)
    .join('  |  ');
  doc.text(sanitizeMISPdfText(subLine), marginX + 14.5, 15.8, { maxWidth: contentWidth - 78 });

  if (COMPANY_DETAILS.email || COMPANY_DETAILS.phone) {
    doc.text(
      sanitizeMISPdfText([COMPANY_DETAILS.phone, COMPANY_DETAILS.email].filter(Boolean).join('  |  ')),
      marginX + 14.5,
      20.2
    );
  }

  // Right-aligned Report Tag in Banner
  doc.setFillColor(11, 68, 155);
  doc.roundedRect(pageWidth - marginX - 52, 6, 52, 12.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MIS ANALYTICS', pageWidth - marginX - 26, 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(219, 234, 254);
  doc.text(sanitizeMISPdfText(`Gen: ${generatedTimestamp}`), pageWidth - marginX - 26, 15.8, { align: 'center' });

  // 2. Report Title & Filter Metadata Strip
  let y = 31;
  doc.setTextColor(0, 32, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  if (hasDevanagari(title)) {
    const img = renderUnicodeTextToPng(title, { widthMm: contentWidth, fontSizePt: 12, bold: true, color: '#002046' });
    if (img) doc.addImage(img.dataUrl, 'PNG', marginX, y - 4.5, img.widthMm, img.heightMm);
  } else {
    doc.text(sanitizeMISPdfText(title), marginX, y);
  }

  y += 5;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(sanitizeMISPdfText(subtitle), marginX, y, { maxWidth: contentWidth });
    y += 5;
  }

  // Filter Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, y, contentWidth, 12.5, 1.2, 1.2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporting Period:', marginX + 3, y + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeMISPdfText(periodLabel || 'All Time'), marginX + 29, y + 4.8);

  doc.setFont('helvetica', 'bold');
  doc.text('Project Scope:', marginX + contentWidth * 0.48, y + 4.8);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeMISPdfText(projectLabel || 'All Projects'), marginX + contentWidth * 0.48 + 23, y + 4.8, {
    maxWidth: contentWidth * 0.52 - 26
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', marginX + 3, y + 9.8);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeMISPdfText(departmentLabel || 'All Departments'), marginX + 29, y + 9.8);

  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By:', marginX + contentWidth * 0.48, y + 9.8);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeMISPdfText(generatedBy || 'Administrator'), marginX + contentWidth * 0.48 + 23, y + 9.8);

  y += 16;

  // 3. Summary Cards Strip
  if (Array.isArray(summaryCards) && summaryCards.length > 0) {
    const cards = summaryCards.slice(0, 6);
    const colsPerRow = resolvedOrientation === 'l' ? Math.min(cards.length, 6) : Math.min(cards.length, 3);
    const cardGap = 3;
    const cardWidth = (contentWidth - cardGap * (colsPerRow - 1)) / colsPerRow;
    const cardHeight = 13.5;

    cards.forEach((card, idx) => {
      const col = idx % colsPerRow;
      const row = Math.floor(idx / colsPerRow);
      const cx = marginX + col * (cardWidth + cardGap);
      const cy = y + row * (cardHeight + 2.5);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(cx, cy, cardWidth, cardHeight, 1.2, 1.2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(sanitizeMISPdfText(String(card.label || '').toUpperCase()), cx + 2.5, cy + 4.5, {
        maxWidth: cardWidth - 5
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 32, 70);
      doc.text(sanitizeMISPdfText(card.value ?? '0'), cx + 2.5, cy + 10.5, {
        maxWidth: cardWidth - 5
      });
    });

    const totalCardRows = Math.ceil(cards.length / colsPerRow);
    y += totalCardRows * (cardHeight + 2.5) + 3;
  }

  // 4. Detailed Data Table
  const normalizedHeaders = headers.map((h) => sanitizeMISPdfText(h));
  const normalizedRows =
    rows.length > 0
      ? rows.map((r) => r.map((cell) => sanitizeMISPdfText(cell)))
      : [[sanitizeMISPdfText('No matching ERP records found for the selected filters.'), ...headers.slice(1).map(() => '')]];

  const normalizedFoot = totalsRow ? [totalsRow.map((cell) => sanitizeMISPdfText(cell))] : undefined;

  const columnStyles = {};
  numericColumnIndices.forEach((colIdx) => {
    columnStyles[colIdx] = { halign: 'right' };
  });

  applyAutoTable(doc, {
    startY: y,
    head: [normalizedHeaders],
    body: normalizedRows,
    foot: normalizedFoot,
    showHead: 'everyPage',
    showFoot: 'lastPage',
    rowPageBreak: 'avoid',
    margin: { left: marginX, right: marginX, top: 14, bottom: 20 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: resolvedOrientation === 'l' ? 7.6 : 7.3,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [0, 32, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.4,
      halign: 'left'
    },
    footStyles: {
      fillColor: [226, 232, 240],
      textColor: [0, 32, 70],
      fontStyle: 'bold',
      fontSize: 7.6
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles,
    willDrawCell: (data) => {
      const rawCellText = Array.isArray(data.cell.text) ? data.cell.text.join(' ') : String(data.cell.text || '');
      if (hasDevanagari(rawCellText)) {
        data.cell._devanagariOriginal = rawCellText;
        data.cell.text = [''];
      }
    },
    didDrawCell: (data) => {
      if (data.cell._devanagariOriginal) {
        const isHead = data.section === 'head';
        const img = renderUnicodeTextToPng(data.cell._devanagariOriginal, {
          widthMm: Math.max(12, data.cell.width - 3),
          fontSizePt: isHead ? 7.4 : 7.2,
          bold: isHead || data.section === 'foot',
          color: isHead ? '#ffffff' : '#0f172a',
          align: data.cell.styles?.halign || 'left'
        });
        if (img) {
          const drawH = Math.min(data.cell.height - 1.5, img.heightMm);
          doc.addImage(img.dataUrl, 'PNG', data.cell.x + 1.5, data.cell.y + 1, Math.min(data.cell.width - 2.5, img.widthMm), drawH);
        }
      }
    }
  });

  // 5. Audit Notes & Authorized Signature Block
  let finalY = (doc.lastAutoTable?.finalY || y + 20) + 7;
  if (finalY > pageHeight - 44) {
    doc.addPage();
    finalY = 18;
  }

  if (Array.isArray(notes) && notes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(0, 32, 70);
    doc.text('Audit & Accounting Notes:', marginX, finalY);
    finalY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(71, 85, 105);
    notes.slice(0, 4).forEach((note) => {
      const wrapped = doc.splitTextToSize(`- ${sanitizeMISPdfText(note)}`, contentWidth);
      doc.text(wrapped, marginX, finalY);
      finalY += wrapped.length * 3.4;
    });
    finalY += 4;
  }

  if (finalY > pageHeight - 36) {
    doc.addPage();
    finalY = 20;
  }

  // Authorized Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.line(marginX, finalY + 14, marginX + 58, finalY + 14);
  doc.line(pageWidth - marginX - 65, finalY + 14, pageWidth - marginX, finalY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(30, 41, 59);
  doc.text('Prepared & Verified By', marginX, finalY + 18.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeMISPdfText(generatedBy || 'MIS System'), marginX, finalY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(0, 32, 70);
  doc.text(`For ${sanitizeMISPdfText(COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS')}`, pageWidth - marginX, finalY + 4, { align: 'right' });
  doc.text('Authorized Signatory', pageWidth - marginX, finalY + 18.2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(100, 116, 139);
  doc.text('Management / Accounts Seal', pageWidth - marginX, finalY + 22, { align: 'right' });

  // 6. Repeated Footer & Page Numbers Across All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      sanitizeMISPdfText(`${COMPANY_DETAILS.name || 'Sanmati Constructions'} | Confidential Management Information System`),
      marginX,
      pageHeight - 8.5
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 8.5, { align: 'right' });
  }

  savePdfSafely(doc, fileName);
  return { success: true, pages: totalPages, fileName };
};

/**
 * Generates a formatted multi-sheet Excel Workbook (.xlsx) matching the active MIS preview and filters.
 */
export const exportMISReportExcel = ({
  title = 'MIS Report',
  periodLabel = '',
  projectLabel = 'All Projects',
  departmentLabel = 'All Departments',
  generatedBy = 'ERP Administrator',
  summaryCards = [],
  headers = [],
  rows = [],
  totalsRow = null,
  numericColumnIndices = [],
  notes = [],
  extraSheets = [],
  fileName = 'Sanmati_MIS_Report.xlsx'
}) => {
  const wb = XLSX.utils.book_new();
  const generatedAt = new Date().toLocaleString('en-IN');

  // Sheet 1: Executive Summary
  const summaryAOA = [
    [COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS', ''],
    [title, ''],
    ['Generated At', generatedAt],
    ['Generated By', generatedBy],
    ['Reporting Period', periodLabel || 'All Time'],
    ['Project Filter', projectLabel || 'All Projects'],
    ['Department Filter', departmentLabel || 'All Departments'],
    ['', ''],
    ['Key Summary Metric', 'Value']
  ];

  summaryCards.forEach((card) => {
    const raw = card.rawValue !== undefined ? card.rawValue : card.value;
    summaryAOA.push([card.label, raw]);
  });

  if (notes.length > 0) {
    summaryAOA.push(['', '']);
    summaryAOA.push(['Audit & Accounting Notes', '']);
    notes.forEach((n) => summaryAOA.push([`- ${n}`, '']));
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAOA);
  wsSummary['!cols'] = [{ wch: 36 }, { wch: 28 }];

  // Apply INR currency number format to currency numeric cells on summary sheet
  summaryCards.forEach((card, idx) => {
    if (typeof card.rawValue === 'number' && card.isCurrency) {
      const cellRef = XLSX.utils.encode_cell({ r: 9 + idx, c: 1 });
      if (wsSummary[cellRef]) {
        wsSummary[cellRef].z = '"₹"#,##0.00';
      }
    }
  });
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // Sheet 2: Detailed Report Data
  const dataAOA = [
    [COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS'],
    [`${title} — ${periodLabel || 'All Time'}`],
    [`Project: ${projectLabel} | Department: ${departmentLabel} | Generated: ${generatedAt}`],
    [],
    headers
  ];

  rows.forEach((r) => dataAOA.push(r));
  if (totalsRow) {
    dataAOA.push(totalsRow);
  }

  const wsData = XLSX.utils.aoa_to_sheet(dataAOA);
  const headerRowIdx = 4;
  const lastRowIdx = dataAOA.length - 1;

  // Format numeric currency cells cleanly
  const numSet = new Set(numericColumnIndices);
  for (let r = headerRowIdx + 1; r <= lastRowIdx; r += 1) {
    numSet.forEach((c) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (wsData[ref] && typeof wsData[ref].v === 'number') {
        wsData[ref].z = '#,##0.00';
      }
    });
  }

  // Compute readable column widths
  wsData['!cols'] = headers.map((hdr, colIdx) => {
    let maxLen = String(hdr || '').length + 3;
    rows.forEach((r) => {
      maxLen = Math.max(maxLen, String(r[colIdx] ?? '').length + 2);
    });
    if (totalsRow) {
      maxLen = Math.max(maxLen, String(totalsRow[colIdx] ?? '').length + 2);
    }
    return { wch: Math.min(46, Math.max(12, maxLen)) };
  });

  XLSX.utils.book_append_sheet(wb, wsData, 'Report Data');

  // Extra Sheets (Milestones / Breakdown / Risk Register / Tally Verification)
  if (Array.isArray(extraSheets)) {
    extraSheets.forEach((sheet) => {
      if (!sheet || !Array.isArray(sheet.headers) || !Array.isArray(sheet.rows)) return;
      const safeName = String(sheet.name || 'Breakdown').replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Sheet';
      const aoa = [sheet.headers, ...sheet.rows];
      if (sheet.totalsRow) aoa.push(sheet.totalsRow);
      const wsExtra = XLSX.utils.aoa_to_sheet(aoa);
      wsExtra['!cols'] = sheet.headers.map((h, i) => {
        let maxL = String(h || '').length + 3;
        sheet.rows.forEach((r) => {
          maxL = Math.max(maxL, String(r[i] ?? '').length + 2);
        });
        return { wch: Math.min(44, Math.max(12, maxL)) };
      });
      XLSX.utils.book_append_sheet(wb, wsExtra, safeName);
    });
  }

  XLSX.writeFile(wb, fileName);
  return { success: true, fileName };
};

/**
 * Triggers isolated A4 print output using body.mis-print-mode + #mis-print-stage.
 */
export const triggerMISPrintReport = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  document.body.classList.add('mis-print-mode');

  const cleanup = () => {
    document.body.classList.remove('mis-print-mode');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  // Allow React portal paint flush before print dialog captures layout
  setTimeout(() => {
    window.print();
    setTimeout(cleanup, 1500);
  }, 80);
};
