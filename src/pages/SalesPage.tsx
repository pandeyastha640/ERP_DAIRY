import React, { useState } from 'react';
import { Customer, PaymentTransaction, SalesOrder } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AreaTrendChart, DonutChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import { ShoppingCart, Plus, Search, Filter, DollarSign, Layers } from 'lucide-react';
import { api } from '../services/api';

interface SalesPageProps {
  orders: SalesOrder[];
  onAddOrder: (order: SalesOrder) => string | undefined;
  customers: Customer[];
  onSaveCustomer: (customer: Customer, existingId?: string) => string | undefined;
  onArchiveCustomer: (id: string) => void;
  payments: PaymentTransaction[];
}

export const SalesPage: React.FC<SalesPageProps> = ({ orders, onAddOrder, customers, onSaveCustomer, onArchiveCustomer, payments }) => {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<SalesOrder | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerError, setCustomerError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerChannel, setCustomerChannel] = useState<Customer['channel']>('Distributor');

  // New Order State
  const [customer, setCustomer] = useState('');
  const [channel, setChannel] = useState<'Distributor' | 'Retail Supermarket' | 'Direct Consumer' | 'Institutional / Horeca'>('Distributor');
  const [product, setProduct] = useState('Full Cream Gold Milk 1L');
  const [qty, setQty] = useState('500');
  const [rate, setRate] = useState('64.0');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [submitError, setSubmitError] = useState('');
  const activeCustomers = customers.filter((item) => !item.archivedAt);

  const openCustomerForm = (record?: Customer) => {
    setEditingCustomer(record ?? null);
    setCustomerError('');
    setCustomerName(record?.name ?? '');
    setCustomerContact(record?.contactName ?? '');
    setCustomerPhone(record?.phone ?? '');
    setCustomerAddress(record?.billingAddress ?? '');
    setCustomerChannel(record?.channel ?? 'Distributor');
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setCustomerError('Customer name is required.');
      return;
    }
    const record: Customer = {
      ...(editingCustomer ?? {} as Customer),
      id: editingCustomer?.id ?? `CUST-${Date.now()}`,
      name: customerName.trim(),
      channel: customerChannel,
      contactName: customerContact.trim(),
      phone: customerPhone.trim(),
      billingAddress: customerAddress.trim(),
    };
    const error = onSaveCustomer(record, editingCustomer?.id);
    if (error) {
      setCustomerError(error);
      return;
    }
    setCustomer(record.name);
    setIsCustomerModalOpen(false);
  };

  const todayRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const avgOrderValue = Math.round(todayRevenue / (orders.length || 1));
  const outstandingAmount = orders
    .filter((o) => o.paymentStatus !== 'Paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Channel breakdown
  const channelSales = {
    Distributor: orders.filter((o) => o.channel === 'Distributor').reduce((acc, o) => acc + o.totalAmount, 0),
    Retail: orders.filter((o) => o.channel === 'Retail Supermarket').reduce((acc, o) => acc + o.totalAmount, 0),
    Horeca: orders.filter((o) => o.channel === 'Institutional / Horeca').reduce((acc, o) => acc + o.totalAmount, 0),
    Direct: orders.filter((o) => o.channel === 'Direct Consumer').reduce((acc, o) => acc + o.totalAmount, 0),
  };

  const channelDonutSlices = [
    { label: 'Distributor Network', value: channelSales.Distributor, color: '#388bfd' },
    { label: 'Institutional / Horeca', value: channelSales.Horeca, color: '#3fb950' },
    { label: 'Retail Supermarket', value: channelSales.Retail, color: '#f0883e' },
    { label: 'Farm Direct Consumer', value: channelSales.Direct, color: '#bc8cff' },
  ];

  const salesTrend = [
    { label: '01 Oct', value: 135000 },
    { label: '02 Oct', value: 138000 },
    { label: '03 Oct', value: 140000 },
    { label: '04 Oct', value: 139000 },
    { label: '05 Oct', value: 139500 },
    { label: '06 Oct', value: todayRevenue },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchesChan = channelFilter === 'All' || o.channel === channelFilter;
    return matchesSearch && matchesChan;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty);
    const r = Number(rate);
    const selectedCustomer = activeCustomers.find((item) => item.name === customer);
    if (!selectedCustomer) {
      setSubmitError('Select an active customer from the customer master.');
      return;
    }
    if (!Number.isInteger(q) || q <= 0) {
      setSubmitError('Quantity must be a positive whole number.');
      return;
    }
    if (!Number.isFinite(r) || r <= 0) {
      setSubmitError('Unit price must be greater than zero.');
      return;
    }
    const total = q * r;

    const newOrder: SalesOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: `SO-2026-${1000 + orders.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      customerName: selectedCustomer.name,
      channel,
      product,
      quantityUnits: q,
      unitRate: r,
      totalAmount: total,
      paymentStatus,
      fulfillmentStatus: 'Pending Dispatch',
    };

    const error = onAddOrder(newOrder);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitError('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sales Orders & Revenue Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Omni-channel commercial invoices across distributor networks, modern retail, Horeca banquets, and farm gate sales.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => openCustomerForm()} className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold">Add Customer</button>
          <button
            onClick={() => { setSubmitError(''); setIsCreateModalOpen(true); }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Today's Gross Sales" value={`₹${todayRevenue.toLocaleString()}`} unit="" trend="up" changePct={2.4} changeText="Invoiced today" />
        <MetricCard label="Estimated Monthly Run" value="₹42.8 Lakhs" unit="" trend="up" changeText="30-day projection" />
        <MetricCard label="Commercial Orders" value={orders.length} unit="Invoices" trend="neutral" changeText="Active routes" />
        <MetricCard label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString()}`} unit="" trend="up" changeText="Wholesale average" />
        <MetricCard
          label="Payment Receivables"
          value={`₹${outstandingAmount.toLocaleString()}`}
          unit=""
          trend="down"
          isGoodWhenUp={false}
          changeText="Pending settlement"
        />
      </div>

      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Customer Master</h2>
          <span className="text-xs text-slate-500">{activeCustomers.length} active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr><th className="px-4 py-2">Customer ID</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Channel</th><th className="px-4 py-2">Contact</th><th className="px-4 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCustomers.map((record) => <tr key={record.id}>
                <td className="px-4 py-2 font-mono text-slate-600">{record.id}</td><td className="px-4 py-2 font-medium text-slate-900">{record.name}</td><td className="px-4 py-2 text-slate-600">{record.channel}</td><td className="px-4 py-2 text-slate-600">{record.contactName || record.phone || '-'}</td>
                <td className="px-4 py-2 text-right"><button onClick={() => openCustomerForm(record)} className="px-2 py-1 text-emerald-800">Edit</button><button onClick={() => { if (window.confirm(`Archive customer ${record.name}? Invoice history will remain.`)) onArchiveCustomer(record.id); }} className="px-2 py-1 text-rose-700">Archive</button></td>
              </tr>)}
              {activeCustomers.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No active customers. Add a customer to issue an invoice.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Daily Revenue Trajectory (₹)</h3>
            <span className="text-xs font-mono text-emerald-700 font-bold">₹1.42 Lakhs Today</span>
          </div>
          <AreaTrendChart
            data={salesTrend}
            primaryColor="#3fb950"
            primaryLabel="Daily Gross Sales"
            unit="₹"
            height={160}
          />
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Sales Mix by Channel</h3>
            <span className="text-xs font-mono text-slate-500">4 Active Channels</span>
          </div>
          <DonutChart
            slices={channelDonutSlices}
            size={140}
            centerLabel="Total Invoiced"
            centerValue={`₹${(todayRevenue / 1000).toFixed(0)}k`}
          />
        </div>
      </div>

      {/* Orders Filter & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order SO#, Customer or Product..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Channel:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none"
          >
            <option value="All">All Channels</option>
            <option value="Distributor">Distributor</option>
            <option value="Retail Supermarket">Retail Supermarket</option>
            <option value="Institutional / Horeca">Institutional / Horeca</option>
            <option value="Direct Consumer">Direct Consumer</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Channel</th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Unit Rate</th>
                <th className="px-4 py-2.5 font-medium">Total Amount</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium">Fulfillment</th>
                <th className="px-4 py-2.5 font-medium text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} onClick={() => setActiveOrder(ord)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-700">{ord.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{ord.date}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{ord.customerName}</td>
                  <td className="px-4 py-3 font-sans text-slate-500">{ord.channel}</td>
                  <td className="px-4 py-3 font-sans text-slate-700">{ord.product}</td>
                  <td className="px-4 py-3">{ord.quantityUnits.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{ord.unitRate.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">₹{ord.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={ord.paymentStatus} size="sm" />
                  </td>
<<<<<<< Updated upstream
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{ord.fulfillmentStatus}</td>
                  <td className="px-4 py-3 text-right font-sans">
                    <button
                      onClick={async () => {
                        try {
                          const inv = await api.sales.getInvoice(ord.orderNumber);
                          const d = inv.data;
                          alert(`=== OFFICIAL GST TAX INVOICE ===\nInvoice: ${d.invoiceNumber}\nDate: ${d.invoiceDate}\nSeller: ${d.seller.legalName}\nGSTIN: ${d.seller.gstin} | FSSAI: ${d.seller.fssaiLicense}\nCustomer: ${d.buyer.customerName}\nProduct: ${d.lineItems[0].description} (HSN ${d.lineItems[0].hsnCode})\nTaxable Value: ₹${d.totals.taxableSubtotal}\nCGST: ₹${d.totals.cgstTotal} | SGST: ₹${d.totals.sgstTotal}\nGrand Total: ₹${d.totals.grandTotalINR}`);
                        } catch (err: any) {
                          alert(`Tax Invoice Notice: ${err.message}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded text-xs cursor-pointer font-medium"
                    >
                      GST Invoice
                    </button>
                  </td>
=======
                  <td className="px-4 py-3 font-sans text-slate-500">{ord.fulfillmentStatus}</td>
>>>>>>> Stashed changes
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeOrder && (
        <EntityDetailDrawer
          isOpen={!!activeOrder}
          onClose={() => setActiveOrder(null)}
          title={`Sales Invoice ${activeOrder.orderNumber}`}
          subtitle={`${activeOrder.customerName} · ${activeOrder.date}`}
        >
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Status', activeOrder.paymentStatus],
              ['Fulfillment', activeOrder.fulfillmentStatus],
              ['Product', activeOrder.product],
              ['Quantity', `${activeOrder.quantityUnits} units`],
              ['Unit Price', `₹${activeOrder.unitRate.toFixed(2)}`],
              ['Invoice Total', `₹${activeOrder.totalAmount.toLocaleString()}`],
              ['Paid', `₹${(activeOrder.paidAmount ?? (activeOrder.paymentStatus === 'Paid' ? activeOrder.totalAmount : 0)).toLocaleString()}`],
              ['Outstanding', `₹${Math.max(0, activeOrder.totalAmount - (activeOrder.paidAmount ?? (activeOrder.paymentStatus === 'Paid' ? activeOrder.totalAmount : 0))).toLocaleString()}`],
            ].map(([label, value]) => <div key={label} className="rounded border border-slate-200 bg-slate-50 p-3"><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">Related Payments</h3>
            <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
              {payments.filter((payment) => payment.recipientName === activeOrder.customerName && payment.notes.includes(activeOrder.orderNumber)).map((payment) => <div key={payment.id} className="flex justify-between gap-3 py-2 text-xs"><span className="text-slate-700">{payment.transactionRef} · {payment.status}</span><span className="font-mono font-semibold text-slate-900">₹{payment.amount.toLocaleString()}</span></div>)}
              {payments.filter((payment) => payment.recipientName === activeOrder.customerName && payment.notes.includes(activeOrder.orderNumber)).length === 0 && <p className="py-3 text-xs text-slate-500">No payment transactions linked to this invoice.</p>}
            </div>
          </section>
        </EntityDetailDrawer>
      )}

      {/* CREATE ORDER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Commercial Sales Invoice"
        subtitle="Issue wholesale distributor dispatch or direct institutional invoice"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          {submitError && <p role="alert" className="text-xs text-rose-700">{submitError}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
            <select
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            >
              <option value="">Select customer</option>
              {activeCustomers.map((record) => <option key={record.id} value={record.name}>{record.name} · {record.id}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sales Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Distributor">Distributor</option>
                <option value="Retail Supermarket">Retail Supermarket</option>
                <option value="Institutional / Horeca">Institutional / Horeca</option>
                <option value="Direct Consumer">Direct Consumer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Unit Rate (₹)</label>
              <input
                type="number"
                min="0.01"
                required
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending')}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid now</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Calculated Invoice Amount:</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              ₹{((parseInt(qty) || 0) * (parseFloat(rate) || 0)).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title={editingCustomer ? `Edit Customer ${editingCustomer.id}` : 'Add Customer'} subtitle="Maintain the customer master used by invoices" maxWidth="md">
        <form onSubmit={handleSaveCustomer} className="space-y-3.5">
          {customerError && <p role="alert" className="text-xs text-rose-700">{customerError}</p>}
          <label className="block text-xs font-medium text-slate-700">Customer Name<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-xs font-medium text-slate-700">Channel<select value={customerChannel} onChange={(e) => setCustomerChannel(e.target.value as Customer['channel'])} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">{(['Distributor', 'Retail Supermarket', 'Direct Consumer', 'Institutional / Horeca'] as const).map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-medium text-slate-700">Contact Name<input value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-xs font-medium text-slate-700">Phone<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label></div>
          <label className="block text-xs font-medium text-slate-700">Billing Address<input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3"><button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-3 py-2 text-xs text-slate-600">Cancel</button><button type="submit" className="px-3 py-2 rounded bg-emerald-700 text-xs font-semibold text-white">{editingCustomer ? 'Save Changes' : 'Save Customer'}</button></div>
        </form>
      </Modal>
    </div>
  );
};
