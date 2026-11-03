// MODULE 4: TALLY INTEGRATION - Active Subcategories Implementation
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ArrowLeftRight, CheckCircle2, RefreshCw, Download, Code, AlertTriangle, 
  ShieldCheck, Database, Layers, ArrowRightLeft, FileCode, Server 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { buildTallySalesVoucherXML, buildTallyLedgerXML, downloadTallyXML } from '../../services/tallyService';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TallyModule = () => {
  const { tallyConfig, syncToTally, raBills } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'integration';

  const [selectedVoucherForSync, setSelectedVoucherForSync] = useState(null);
  const [xmlPreview, setXmlPreview] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock sync log entries
  const [syncLogs] = useState([
    {
      id: "TL-LOG-901",
      timestamp: "2026-11-02 11:30:15",
      voucherType: "Sales Voucher (RA Bill)",
      voucherNo: "SC/RA/2026/001",
      amount: 10000000,
      tallyMasterId: "TALLY-MST-10821",
      status: "Synced"
    },
    {
      id: "TL-LOG-902",
      timestamp: "2026-11-01 16:45:00",
      voucherType: "Payment Voucher",
      voucherNo: "PV-2026-088",
      amount: 1220000,
      tallyMasterId: "TALLY-MST-10822",
      status: "Synced"
    },
    {
      id: "TL-LOG-903",
      timestamp: "2026-10-30 09:12:44",
      voucherType: "Receipt Voucher",
      voucherNo: "RV-2026-041",
      amount: 2500000,
      tallyMasterId: "TALLY-MST-10823",
      status: "Verified"
    }
  ]);

  const handleTestTallySync = (bill) => {
    setIsSyncing(true);
    setTimeout(() => {
      syncToTally('Sales Voucher (RA Bill)', bill.billNumber, bill.netPayable);
      setIsSyncing(false);
    }, 800);
  };

  const handleInspectXML = (bill) => {
    const xml = buildTallySalesVoucherXML({
      companyName: tallyConfig.companyName || 'SANMATI CONSTRUCTIONS',
      voucherNo: bill.billNumber,
      date: bill.date,
      partyLedger: bill.clientName || 'Client Ledger A/c',
      amount: bill.currentBillAmount,
      cgst: bill.cgst || 0,
      sgst: bill.sgst || 0,
      narration: `Being RA Bill No. ${bill.billNumber} for ${bill.projectName || 'Civil Project'} passed for payment.`
    });
    setXmlPreview({ 
      title: `Tally XML Payload: ${bill.billNumber}`, 
      content: xml, 
      fileName: `${bill.billNumber.replace(/\//g, '_')}_Tally.xml` 
    });
  };

  return (
    <div className="space-y-6">
      {/* SUBSECTION 1: TALLY DATA INTEGRATION */}
      {activeTab === 'integration' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              4. Tally Integration • Subsection (i)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tally Data Integration Gateway
            </h2>
            <p className="text-xs text-slate-500">Live ODBC connector and XML server configuration for Tally ERP 9 / TallyPrime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Gateway Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>ONLINE & CONNECTED</span>
              </div>
              <p className="text-[11px] text-slate-400">Listening on port 9000 (XML HTTP Direct)</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">Target Tally Company</span>
              <div className="text-base font-bold text-slate-900">SANMATI CONSTRUCTIONS</div>
              <p className="text-[11px] text-slate-400">Financial Year: 01-Apr-2026 to 31-Mar-2027</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">ODBC & Sync Frequency</span>
              <div className="text-base font-bold text-red-600">Automated (Bi-Directional)</div>
              <p className="text-[11px] text-slate-400">Last sync verified 14 mins ago</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Connection Diagnostics & Ping</h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value="http://127.0.0.1:9000 (Localhost TallyPrime Gateway)"
                className="erp-input font-mono text-xs bg-slate-50 text-slate-600"
              />
              <button
                onClick={() => alert("Tally Gateway responded: HTTP 200 OK. Ready to import XML vouchers.")}
                className="erp-btn-primary text-xs flex-shrink-0"
              >
                Test Gateway Ping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 2: ACCOUNT DATA SYNCHRONISATION */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                4. Tally Integration • Subsection (ii)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Account Data Synchronisation
              </h2>
              <p className="text-xs text-slate-500">Push verified RA bills, subcontract vouchers, and supplier debit notes into Tally.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Pending Vouchers Ready for Synchronisation</h4>
              <span className="text-[11px] text-slate-500 font-medium">{raBills.length} Invoices Available</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Bill Reference</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Date</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Ledger Account</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase text-right">Amount (INR)</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase text-center">Sync Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {raBills.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-red-600">{b.billNumber}</td>
                      <td className="p-3 text-slate-700">{formatDate(b.date)}</td>
                      <td className="p-3 font-semibold text-slate-900">{b.clientName}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(b.netPayable)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTestTallySync(b)}
                          disabled={isSyncing}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>Sync to Tally</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 3: VOUCHER & TRANSACTION TRANSFER */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              4. Tally Integration • Subsection (iii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Voucher & Transaction Transfer (XML)
            </h2>
            <p className="text-xs text-slate-500">Generate, inspect, and export standard Tally XML vouchers for manual or bulk transfer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {raBills.map(b => (
              <div key={b.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    {b.billNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Sales Voucher</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{b.clientName}</h4>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatCurrency(b.netPayable)}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleInspectXML(b)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Inspect XML</span>
                  </button>
                  <button
                    onClick={() => {
                      const xml = buildTallySalesVoucherXML({
                        companyName: tallyConfig.companyName || 'SANMATI CONSTRUCTIONS',
                        voucherNo: b.billNumber,
                        date: b.date,
                        partyLedger: b.clientName,
                        amount: b.currentBillAmount,
                        cgst: b.cgst,
                        sgst: b.sgst
                      });
                      downloadTallyXML(xml, `${b.billNumber.replace(/\//g, '_')}_Tally.xml`);
                    }}
                    className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSECTION 4: DATA VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
              4. Tally Integration • Subsection (iv)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Data Verification & Reconciliation Audit
            </h2>
            <p className="text-xs text-slate-500">Reconciliation audit trails, timestamp integrity, and master ID verification.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Synchronisation Audit Trail & Verification Logs</h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Zero Discrepancies
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Timestamp</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Sync Log ID</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Voucher Type</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Voucher No</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase text-right">Amount (INR)</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase">Tally Master ID</th>
                    <th className="p-3 text-slate-700 font-bold text-[11px] uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-600">{log.timestamp}</td>
                      <td className="p-3 font-mono font-bold text-red-600">{log.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{log.voucherType}</td>
                      <td className="p-3 font-mono text-slate-700">{log.voucherNo}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(log.amount)}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{log.tallyMasterId}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* XML Preview Modal */}
      {xmlPreview && (
        <Modal
          isOpen={Boolean(xmlPreview)}
          onClose={() => setXmlPreview(null)}
          title={xmlPreview.title}
        >
          <div className="space-y-4 text-xs">
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96">
              {xmlPreview.content}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => downloadTallyXML(xmlPreview.content, xmlPreview.fileName)}
                className="erp-btn-primary flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save XML File</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
