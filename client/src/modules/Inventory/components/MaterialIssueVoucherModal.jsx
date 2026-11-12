import React from 'react';
import { Printer, Building2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { COMPANY_DETAILS } from '../../../utils/constants';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const MaterialIssueVoucherModal = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Material Issue Voucher - ${voucher.voucherNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 28px; color: #0f172a; }
            .box { border: 2px solid #002046; border-radius: 8px; padding: 24px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #002046; padding-bottom: 14px; margin-bottom: 18px; }
            .company { font-size: 20px; font-weight: 800; color: #002046; margin: 0; }
            .sub { font-size: 11px; color: #475569; margin-top: 4px; }
            .badge { background: #002046; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; font-size: 12px; }
            .cell { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
            .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .val { font-size: 13px; font-weight: 700; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
            th { background: #002046; color: #ffffff; text-align: left; padding: 9px 10px; font-size: 11px; text-transform: uppercase; }
            td { border: 1px solid #cbd5e1; padding: 10px; }
            .num { text-align: right; font-family: monospace; }
            .sigs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 48px; text-align: center; font-size: 11px; }
            .sig-line { border-top: 1px solid #334155; padding-top: 6px; font-weight: 700; color: #334155; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="header">
              <div>
                <p class="company">${COMPANY_DETAILS.name}</p>
                <div class="sub">${COMPANY_DETAILS.address}</div>
                <div class="sub">GSTIN: ${COMPANY_DETAILS.gstin} | Phone: ${COMPANY_DETAILS.phone}</div>
              </div>
              <div style="text-align:right">
                <div class="badge">MATERIAL ISSUE VOUCHER</div>
                <div style="margin-top:8px; font-weight:700; font-size:14px;">${voucher.voucherNo}</div>
                <div class="sub">Issue Date: ${formatDate(voucher.date)}</div>
              </div>
            </div>

            <div class="grid">
              <div class="cell">
                <div class="label">Target Project / Site</div>
                <div class="val">${voucher.projectName || 'General Dispatch'}</div>
              </div>
              <div class="cell">
                <div class="label">Issued To (Receiver)</div>
                <div class="val">${voucher.issuedTo || 'Site Engineer'}</div>
              </div>
              <div class="cell">
                <div class="label">Issued By (Store)</div>
                <div class="val">${voucher.issuedBy || 'Storekeeper'}</div>
              </div>
              <div class="cell">
                <div class="label">Purpose / Reason</div>
                <div class="val">${voucher.reason || 'Site Construction Work'}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Material Description</th>
                  <th>Unit</th>
                  <th class="num">Issued Qty</th>
                  <th class="num">Unit Rate</th>
                  <th class="num">Total Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${voucher.materialId}</strong></td>
                  <td><strong>${voucher.materialName}</strong><br/><span style="color:#64748b;font-size:11px;">${voucher.category || ''}</span></td>
                  <td>${voucher.unit}</td>
                  <td class="num"><strong>${Number(voucher.quantity).toLocaleString('en-IN')}</strong></td>
                  <td class="num">${formatCurrency(Number(voucher.rate) || 0)}</td>
                  <td class="num"><strong>${formatCurrency(Number(voucher.totalValue) || 0)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div style="font-size:11px; color:#475569;">
              Remaining Warehouse Stock After Issue: <strong>${Number(voucher.resultingStock ?? 0).toLocaleString('en-IN')} ${voucher.unit}</strong>
            </div>

            <div class="sigs">
              <div class="sig-line">Issued By (${voucher.issuedBy || 'Storekeeper'})</div>
              <div class="sig-line">Received By (${voucher.issuedTo || 'Site Receiver'})</div>
              <div class="sig-line">Authorized Signatory / PM</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <Modal
      isOpen={Boolean(voucher)}
      onClose={onClose}
      title={`Material Issue Voucher • ${voucher.voucherNo}`}
      subtitle={`Issued on ${formatDate(voucher.date)} to ${voucher.projectName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="border-2 border-[#002046]/20 rounded-2xl p-5 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#002046] text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#002046]">{COMPANY_DETAILS.name}</p>
                <p className="text-[11px] text-slate-500">Material Issue Voucher</p>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#002046] text-white font-mono text-xs font-bold">
                {voucher.voucherNo}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Date: {formatDate(voucher.date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Target Project</p>
              <p className="font-bold text-slate-900 mt-0.5">{voucher.projectName}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Received By</p>
              <p className="font-bold text-slate-900 mt-0.5">{voucher.issuedTo}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Issued By</p>
              <p className="font-bold text-slate-900 mt-0.5">{voucher.issuedBy}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Reason / Purpose</p>
              <p className="font-semibold text-slate-800 mt-0.5">{voucher.reason}</p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left">Code</th>
                  <th className="text-left">Material</th>
                  <th className="text-right">Issued Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono font-bold">{voucher.materialId}</td>
                  <td>
                    <span className="font-bold text-slate-900">{voucher.materialName}</span>
                  </td>
                  <td className="text-right font-mono font-bold text-[#002046]">
                    {Number(voucher.quantity).toLocaleString('en-IN')} {voucher.unit}
                  </td>
                  <td className="text-right font-mono">{formatCurrency(Number(voucher.rate) || 0)}</td>
                  <td className="text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(Number(voucher.totalValue) || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Balance After Issue: {Number(voucher.resultingStock ?? 0).toLocaleString('en-IN')} {voucher.unit}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Issue Voucher</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
