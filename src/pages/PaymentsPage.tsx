import React, { useState } from 'react';
import { PaymentTransaction } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { BankPayoutBatchModal } from '../components/finance/BankPayoutBatchModal';
import { CreditCard, Plus, CheckCircle2, Clock, ArrowDownLeft, ArrowUpRight, Search, Zap } from 'lucide-react';
import { api } from '../services/api';

interface PaymentsPageProps {
  payments?: PaymentTransaction[];
  onAddPayment?: (txn: PaymentTransaction) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ payments: propPayments, onAddPayment: propOnAddPayment }) => {
  const {
    paymentsList: contextPayments,
    recordPayment,
    procurementSummary,
    salesOrdersList,
  } = useDairyERP();

  const payments = propPayments || contextPayments;
  const onAddPayment = propOnAddPayment || recordPayment;

  const [filterType, setFilterType] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Processing' | 'Pending'>('All');
  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isBatchPayoutModalOpen, setIsBatchPayoutModalOpen] = useState(false);

  // New Payment Form
  const [recipient, setRecipient] = useState('');
  const [partyType, setPartyType] = useState<'Farmer' | 'Distributor' | 'Feed Supplier' | 'Packaging Vendor'>('Farmer');
  const [amount, setAmount] = useState('2500');
  const [method, setMethod] = useState<'UPI' | 'Direct Bank IMPS' | 'NEFT' | 'Cash'>('Direct Bank IMPS');
  const [notes, setNotes] = useState('Shift milk settlement');

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

  const filtered = payments.filter((p) => {
    const mParty = filterType === 'All' || p.partyType === filterType;
    const mStatus = statusFilter === 'All' || p.status === statusFilter;
    const mSearch =
      p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    return mParty && mStatus && mSearch;
  });

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newTxn: PaymentTransaction = {
      id: `PAY-${Date.now()}`,
      transactionRef: `TXN-MANUAL-${Math.floor(10000 + Math.random() * 90000)}`,
      recipientName: recipient || 'Farmer Direct Account',
      partyType,
      amount: parseFloat(amount) || 0,
      paymentDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: method,
      status: 'Completed',
      notes,
    };

    onAddPayment(newTxn);
    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Payments & Settlement Ledger
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Producer bank disbursements, distributor receivables collection, and supplier trade payables reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchPayoutModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
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
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Farmer Payables (Today)" value={`₹${totalFarmerPayables.toLocaleString()}`} unit="" trend="neutral" changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`} />
        <MetricCard label="Collected Today" value={`₹${totalCollectedToday.toLocaleString()}`} unit="" trend="up" changeText="Distributor collections" />
        <MetricCard label="Commercial Receivables" value={`₹${totalReceivables.toLocaleString()}`} unit="" trend="down" isGoodWhenUp={false} changeText="Horeca & Modern retail" />
        <MetricCard label="Pending Disbursements" value={`₹${totalPayablesPending.toLocaleString()}`} unit="" trend="neutral" changeText="Processing in bank queue" />
      </div>

      {/* Comprehensive Filter and Search Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Recipient, Txn Ref, Method, Notes..."
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8b949e]">Party:</span>
            <div className="flex bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 text-xs flex-wrap">
              {(['All', 'Farmer', 'Distributor', 'Feed Supplier', 'Packaging Vendor'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterType === t ? 'bg-[#388bfd] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#21262d] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e]">Settlement Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="All">All Settlement Statuses</option>
              <option value="Completed">Completed Only</option>
              <option value="Processing">Processing (Bank Queue)</option>
              <option value="Pending">Pending Authorization</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8b949e] font-mono">
              Showing <strong className="text-[#58a6ff]">{filtered.length}</strong> of {payments.length}
            </span>

            {(search !== '' || filterType !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterType('All');
                  setStatusFilter('All');
                }}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#f85149] rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
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
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#58a6ff]">{txn.transactionRef}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">{txn.recipientName}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{txn.partyType}</td>
                  <td className="px-4 py-3">{txn.milkLitres ? `${txn.milkLitres} L` : '-'}</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{txn.paymentDate}</td>
                  <td className="px-4 py-3 font-sans text-[#58a6ff]">{txn.paymentMethod}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={txn.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-[#8b949e] text-[11px] truncate max-w-xs">{txn.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD TRANSACTION MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Financial Settlement"
        subtitle="Post direct bank IMPS, UPI or cash voucher transaction"
        maxWidth="md"
      >
        <form onSubmit={handleRecord} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Party / Recipient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rameshwar Patel (FARM-001)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Party Category</label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Farmer">Farmer Producer</option>
                <option value="Distributor">Distributor Receivable</option>
                <option value="Feed Supplier">Feed Supplier</option>
                <option value="Packaging Vendor">Packaging Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Settlement Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Direct Bank IMPS">Direct Bank IMPS</option>
                <option value="UPI">UPI Instant</option>
                <option value="NEFT">NEFT Transfer</option>
                <option value="Cash">Cash Voucher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Narration / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Post Settlement
            </button>
          </div>
        </form>
      </Modal>

      {/* AUTOMATED BANKING PAYOUT GATEWAY MODAL */}
      <BankPayoutBatchModal
        isOpen={isBatchPayoutModalOpen}
        onClose={() => setIsBatchPayoutModalOpen(false)}
        pendingAmount={totalPayablesPending}
        farmerCount={payments.filter((p) => p.status === 'Pending').length}
        onSuccess={(disbursedCount, totalAmount) => {
          // Asynchronously update context if available
        }}
      />
    </div>
  );
};

