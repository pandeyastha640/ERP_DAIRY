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
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <CreditCard className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Payments & Settlement Ledger
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Direct Bank IMPS / UPI
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Producer bank disbursements, distributor receivables collection, and supplier trade payables reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBatchPayoutModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>Disburse All Pending (IMPS)</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-xs font-semibold text-forest-900 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-forest-700" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <MetricCard label="Farmer Payables (Today)" value={`₹${totalFarmerPayables.toLocaleString()}`} unit="" trend="neutral" changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`} />
        <MetricCard label="Collected Today" value={`₹${totalCollectedToday.toLocaleString()}`} unit="" trend="up" changeText="Distributor collections" />
        <MetricCard label="Commercial Receivables" value={`₹${totalReceivables.toLocaleString()}`} unit="" trend="down" isGoodWhenUp={false} changeText="Horeca & Modern retail" />
        <MetricCard label="Pending Disbursements" value={`₹${totalPayablesPending.toLocaleString()}`} unit="" trend="neutral" changeText="Processing in bank queue" />
      </div>

      {/* Comprehensive Filter and Search Bar */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Recipient, Txn Ref, Method, Notes..."
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-500 font-medium font-sans">Party:</span>
            <div className="flex bg-cream-50 border border-[#ede8df] rounded-xl p-0.5 text-xs flex-wrap">
              {(['All', 'Farmer', 'Distributor', 'Feed Supplier', 'Packaging Vendor'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#ede8df] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium font-sans">Settlement Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Settlement Statuses</option>
              <option value="Completed">Completed Only</option>
              <option value="Processing">Processing (Bank Queue)</option>
              <option value="Pending">Pending Authorization</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full">
              Showing <strong className="font-bold text-forest-950">{filtered.length}</strong> of {payments.length}
            </span>

            {(search !== '' || filterType !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterType('All');
                  setStatusFilter('All');
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#ede8df] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Financial Settlement Journal</h3>
            <p className="text-[11px] text-stone-500">Real-time banking gateway disbursement log and direct credits</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            {payments.length} Recorded Transactions
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Txn Ref #</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Recipient / Payer</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Party Type</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Milk Supplied</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Amount</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Timestamp</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Payment Mode</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-forest-900">{txn.transactionRef}</td>
                  <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{txn.recipientName}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {txn.partyType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{txn.milkLitres ? `${txn.milkLitres} L` : '—'}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-stone-500">{txn.paymentDate}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2.5 py-0.5 bg-sage-50 border border-sage-200 text-forest-800 rounded-md text-[11px] font-semibold">
                      {txn.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={txn.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 font-sans text-stone-500 text-[11px] truncate max-w-xs">{txn.notes}</td>
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
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Party / Recipient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rameshwar Patel (FARM-001)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Party Category</label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as any)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              >
                <option value="Farmer">Farmer Producer</option>
                <option value="Distributor">Distributor Receivable</option>
                <option value="Feed Supplier">Feed Supplier</option>
                <option value="Packaging Vendor">Packaging Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Settlement Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              >
                <option value="Direct Bank IMPS">Direct Bank IMPS</option>
                <option value="UPI">UPI Instant</option>
                <option value="NEFT">NEFT Transfer</option>
                <option value="Cash">Cash Voucher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Narration / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
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

export default PaymentsPage;
