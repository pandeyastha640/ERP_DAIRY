import React, { useState } from 'react';
import { PaymentTransaction } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import { CreditCard, Plus, CheckCircle2, Clock, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { api } from '../services/api';

interface PaymentsPageProps {
  payments?: PaymentTransaction[];
  onAddPayment?: (txn: PaymentTransaction) => string | undefined;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ payments: propPayments, onAddPayment: propOnAddPayment }) => {
  const {
    paymentsList: contextPayments,
    recordPayment,
    procurementSummary,
    salesOrdersList,
    auditLogs,
  } = useDairyERP();

  const payments = propPayments || contextPayments;
  const onAddPayment = propOnAddPayment || recordPayment;

  const [filterType, setFilterType] = useState('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<PaymentTransaction | null>(null);

  // New Payment Form
  const [recipient, setRecipient] = useState('');
  const [partyType, setPartyType] = useState<'Farmer' | 'Distributor' | 'Feed Supplier' | 'Packaging Vendor'>('Farmer');
  const [amount, setAmount] = useState('2500');
  const [method, setMethod] = useState<'UPI' | 'Direct Bank IMPS' | 'NEFT' | 'Cash'>('Direct Bank IMPS');
  const [notes, setNotes] = useState('Shift milk settlement');
  const [submitError, setSubmitError] = useState('');

  const totalFarmerPayables = procurementSummary.totalPayablesToday;
  const totalPayablesPending = payments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalCollectedToday = payments
    .filter((p) => p.status === 'Completed' && (p.partyType === 'Distributor' || p.amount > 0))
    .reduce((acc, p) => acc + p.amount, 0);
  const totalReceivables = salesOrdersList
    .filter((o) => o.paymentStatus !== 'Paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const filtered = payments.filter((p) => filterType === 'All' || p.partyType === filterType);

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newTxn: PaymentTransaction = {
      id: `PAY-${Date.now()}`,
      transactionRef: `TXN-MANUAL-${Math.floor(10000 + Math.random() * 90000)}`,
      recipientName: recipient || 'Farmer Direct Account',
      partyType,
      amount: Number(amount),
      paymentDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: method,
      status: 'Completed',
      notes,
    };

    const error = onAddPayment(newTxn);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitError('');
    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payments & Settlement Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Producer bank disbursements, distributor receivables collection, and supplier trade payables reconciliation.
          </p>
        </div>

<<<<<<< Updated upstream
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const res = await api.payments.disburseAllPending();
                alert(`Bank Gateway Response: ${res.message} (₹${res.totalAmountDisbursed?.toLocaleString('en-IN') || 0} disbursed via IMPS)`);
                window.location.reload();
              } catch (err: any) {
                alert(`Settlement Notice: ${err.message}`);
              }
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Disburse All Pending (IMPS)</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
=======
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
>>>>>>> Stashed changes
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Farmer Payables (Today)" value={`₹${totalFarmerPayables.toLocaleString()}`} unit="" trend="neutral" changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`} />
        <MetricCard label="Collected Today" value={`₹${totalCollectedToday.toLocaleString()}`} unit="" trend="up" changeText="Distributor collections" />
        <MetricCard label="Commercial Receivables" value={`₹${totalReceivables.toLocaleString()}`} unit="" trend="down" isGoodWhenUp={false} changeText="Horeca & Modern retail" />
        <MetricCard label="Pending Disbursements" value={`₹${totalPayablesPending.toLocaleString()}`} unit="" trend="neutral" changeText="Processing in bank queue" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">Filter Party Type:</span>
        <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
          {(['All', 'Farmer', 'Distributor', 'Feed Supplier'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === t ? 'bg-emerald-700 text-white font-medium' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Txn Ref #</th>
                <th className="px-4 py-2.5 font-medium">Recipient / Payer</th>
                <th className="px-4 py-2.5 font-medium">Party Type</th>
                <th className="px-4 py-2.5 font-medium">Milk Supplied</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Payment Mode</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {filtered.map((txn) => (
                <tr key={txn.id} onClick={() => setActiveTransaction(txn)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-700">{txn.transactionRef}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{txn.recipientName}</td>
                  <td className="px-4 py-3 font-sans text-slate-500">{txn.partyType}</td>
                  <td className="px-4 py-3">{txn.milkLitres ? `${txn.milkLitres} L` : '-'}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{txn.paymentDate}</td>
                  <td className="px-4 py-3 font-sans text-blue-700">{txn.paymentMethod}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={txn.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500 text-[11px] truncate max-w-xs">{txn.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeTransaction && (
        <EntityDetailDrawer
          isOpen={!!activeTransaction}
          onClose={() => setActiveTransaction(null)}
          title={`Payment ${activeTransaction.transactionRef}`}
          subtitle={`${activeTransaction.recipientName} · ${activeTransaction.partyType}`}
        >
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Status', activeTransaction.status],
              ['Amount', `₹${activeTransaction.amount.toLocaleString()}`],
              ['Payment Date', activeTransaction.paymentDate],
              ['Method', activeTransaction.paymentMethod],
              ['Milk Volume', activeTransaction.milkLitres ? `${activeTransaction.milkLitres} L` : 'Not applicable'],
              ['Notes', activeTransaction.notes],
            ].map(([label, value]) => <div key={label} className="rounded border border-slate-200 bg-slate-50 p-3"><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">Audit Activity</h3>
            {auditLogs.filter((entry) => entry.entityId === activeTransaction.id || entry.recordId === activeTransaction.transactionRef).map((entry) => <div key={entry.id} className="mt-2 rounded border border-slate-200 p-3 text-xs"><div className="font-semibold text-slate-900">{entry.action} · {entry.timestamp}</div><p className="mt-1 text-slate-600">{entry.description}</p></div>)}
            {auditLogs.every((entry) => entry.entityId !== activeTransaction.id && entry.recordId !== activeTransaction.transactionRef) && <p className="mt-2 text-xs text-slate-500">No audit event found for this payment.</p>}
          </section>
        </EntityDetailDrawer>
      )}

      {/* RECORD TRANSACTION MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Financial Settlement"
        subtitle="Post direct bank IMPS, UPI or cash voucher transaction"
        maxWidth="md"
      >
        <form onSubmit={handleRecord} className="space-y-3.5">
          {submitError && <p role="alert" className="text-xs text-rose-700">{submitError}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Party / Recipient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rameshwar Patel (FARM-001)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Party Category</label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Farmer">Farmer Producer</option>
                <option value="Distributor">Distributor Receivable</option>
                <option value="Feed Supplier">Feed Supplier</option>
                <option value="Packaging Vendor">Packaging Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Settlement Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Direct Bank IMPS">Direct Bank IMPS</option>
                <option value="UPI">UPI Instant</option>
                <option value="NEFT">NEFT Transfer</option>
                <option value="Cash">Cash Voucher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Narration / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              Post Settlement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
