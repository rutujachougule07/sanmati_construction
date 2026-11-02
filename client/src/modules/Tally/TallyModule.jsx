// MODULE 4: TALLY INTEGRATION
import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, RefreshCw, Download, Code, AlertTriangle, ShieldCheck, Database, Layers } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { buildTallySalesVoucherXML, buildTallyLedgerXML, downloadTallyXML } from '../../services/tallyService';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export const TallyModule = () => {
  const { tallyConfig, syncToTally, raBills } = useERPData();
  const [selectedVoucherForSync, setSelectedVoucherForSync] = useState(null);
  const [xmlPreview, setXmlPreview] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('sync'); // sync, mapping, logs

  const handleTestTallySync = (bill) => {
    setIsSyncing(true);
    setTimeout(() => {
      syncToTally('Sales Voucher (RA Bill)', bill.billNumber, bill.netPayable);
      setIsSyncing(false);
    }, 800);
  };

  const handleInspectXML = (bill) => {
    const xml = buildTallySalesVoucherXML({
      companyName: tallyConfig.companyName,
      voucherNo: bill.billNumber,
      date: bill.date,
      partyLedger: bill.clientName || 'Client Ledger A/c',
      amount: bill.currentBillAmount,
      cgst: bill.cgst || 0,
      sgst: bill.sgst || 0,
      narration: `Being RA Bill No. ${bill.billNumber} for ${bill.projectName || 'Civil Project'} passed for payment.`
    });
    setXmlPreview({ title: `Tally XML Payload: ${bill.billNumber}`, content: xml, fileName: `${bill.billNumber.replace(/\//g, '_')}_Tally.xml` });
  };

  const syncLogsColumns = [
    { key: 'timestamp', header: 'Sync Time', render: (row) => <span className="text-slate-300 font-mono text-[11px]">{row.timestamp}</span> },
    { key: 'id', header: 'Sync Log ID', render: (row) => <span className="font-bold text-gold-400">{row.id}</span> },
    { key: 'voucherType', header: 'Voucher Type', render: (row) => <span className="text-white font-medium">{row.voucherType}</span> },
    { key: 'voucherNo', header: 'Ref Voucher', render: (row) => <span className="font-mono text-slate-200">{row.voucherNo}</span> },
    { key: 'amount', header: 'Amount (INR)', align: 'right', render: (row) => <span className="font-bold font-mono text-white">{formatCurrency(row.amount)}</span> },
    { key: 'tallyMasterId', header: 'Tally Master ID', render: (row) => <span className="font-mono text-xs text-gold-400">{row.tallyMasterId}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Tally ERP / TallyPrime Integration</h2>
          <p className="text-xs text-slate-400">Automated two-way XML connector for Sales, Purchase, Payment & Receipt vouchers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'sync' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Pending Vouchers
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'mapping' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Ledger Mapping
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'logs' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Sync History
          </button>
        </div>
      </div>

      {/* Tally Connection Health Status Bar */}
      <div className="bg-gradient-to-r from-[#17202c] via-[#141922] to-[#12161e] p-5 rounded-2xl border border-gold-400/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/40 flex items-center justify-center text-gold-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-heading">{tallyConfig.companyName}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Gateway: <span className="font-mono text-slate-300">{tallyConfig.tallyHost}</span> • Last Sync: {tallyConfig.lastSyncTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSyncing(true);
              setTimeout(() => {
                syncToTally('Master Ledgers Refresh', 'ALL_MASTERS', 0);
                setIsSyncing(false);
              }, 700);
            }}
            disabled={isSyncing}
            className="erp-btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Test Connection & Ping</span>
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white font-heading mb-1">
              Synchronize Construction Vouchers to Tally
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select any verified RA Bill or Expense Voucher to post directly via Tally XML Gateway.
            </p>

            <div className="space-y-3">
              {raBills.map((bill) => (
                <div key={bill.id} className="p-4 bg-[#14181f] rounded-xl border border-[#242b37] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gold-400 text-xs font-mono">{bill.billNumber}</span>
                      <StatusBadge status={bill.status} />
                      <span className="text-[11px] text-slate-400">{bill.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{bill.clientName}</h4>
                    <p className="text-xs text-slate-400">{bill.projectName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Voucher Value</span>
                      <span className="text-base font-bold font-mono text-emerald-400">{formatCurrency(bill.netPayable)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInspectXML(bill)}
                        title="View XML Payload"
                        className="p-2 rounded-lg bg-[#202734] hover:bg-[#2b3545] border border-[#2c3747] text-slate-300 hover:text-gold-400 transition-colors"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTestTallySync(bill)}
                        disabled={isSyncing}
                        className="erp-btn-primary text-xs flex items-center gap-1.5"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Sync to Tally</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Chart of Accounts & Tally Ledger Mapping</h3>
              <p className="text-xs text-slate-400">Maps SANMATI ERP heads directly to Tally Standard Groups.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#14181f] text-gold-400 border-b border-[#28303d]">
                  <th className="p-3 font-semibold">ERP Category</th>
                  <th className="p-3 font-semibold">Tally Target Ledger</th>
                  <th className="p-3 font-semibold">Tally Account Group</th>
                  <th className="p-3 font-semibold text-center">Mapping Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222935]">
                {tallyConfig.ledgerMapping.map((map, idx) => (
                  <tr key={idx} className="hover:bg-[#1a202c]">
                    <td className="p-3 font-bold text-white">{map.erpCategory}</td>
                    <td className="p-3 text-gold-400 font-mono">{map.tallyLedger}</td>
                    <td className="p-3 text-slate-300">{map.group}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Mapped
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <DataTable
          columns={syncLogsColumns}
          data={tallyConfig.recentSyncLogs}
          searchKey="voucherNo"
          searchPlaceholder="Search sync records by voucher number..."
          exportFileName="Sanmati_Tally_Sync_Logs"
        />
      )}

      {/* XML Code Preview Modal */}
      {xmlPreview && (
        <Modal
          isOpen={Boolean(xmlPreview)}
          onClose={() => setXmlPreview(null)}
          title={xmlPreview.title}
          subtitle="Tally Standard XML Data Interchange Payload"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TALLYREQUEST: Import Data</span>
              <button
                onClick={() => downloadTallyXML(xmlPreview.content, xmlPreview.fileName)}
                className="erp-btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .XML File</span>
              </button>
            </div>
            <pre className="p-4 bg-[#0e1115] border border-[#252c38] rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-96">
              {xmlPreview.content}
            </pre>
          </div>
        </Modal>
      )}
    </div>
  );
};
