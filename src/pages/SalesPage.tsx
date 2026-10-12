import React, { useState } from 'react';
import { SalesOrder } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AreaTrendChart, DonutChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { ShoppingCart, Plus, Search, Filter, DollarSign, Layers, FileText } from 'lucide-react';
import { api } from '../services/api';
import { GSTInvoiceModal } from '../components/sales/GSTInvoiceModal';

interface SalesPageProps {
  orders: SalesOrder[];
  onAddOrder: (order: SalesOrder) => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({ orders, onAddOrder }) => {
  const [localOrders, setLocalOrders] = useState<SalesOrder[]>(orders);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // New Order State
  const [customer, setCustomer] = useState('');
  const [channel, setChannel] = useState<'Distributor' | 'Retail Supermarket' | 'Direct Consumer' | 'Institutional / Horeca'>('Distributor');
  const [product, setProduct] = useState('Full Cream Gold Milk 1L');
  const [qty, setQty] = useState('500');
  const [rate, setRate] = useState('64.0');

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

  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Pending'>('All');
  const [dateFilter, setDateFilter] = useState('All');

  const displayOrders = localOrders.length > 0 ? localOrders : orders;
  const filteredOrders = displayOrders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchesChan = channelFilter === 'All' || o.channel === channelFilter;
    const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;
    const matchesDate = dateFilter === 'All' || o.date === dateFilter;
    return matchesSearch && matchesChan && matchesPayment && matchesDate;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(qty) || 100;
    const r = parseFloat(rate) || 50;
    const total = q * r;

    const newOrder: SalesOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: `SO-2026-${1000 + orders.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      customerName: customer || 'Demo Retail Outlet',
      channel,
      product,
      quantityUnits: q,
      unitRate: r,
      totalAmount: total,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Dispatched',
    };

    onAddOrder(newOrder);
    setLocalOrders((prev) => [newOrder, ...prev]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Sales Orders & Revenue Operations
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Omni-channel commercial invoices across distributor networks, modern retail, Horeca banquets, and farm gate sales.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Sales Order</span>
        </button>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Daily Revenue Trajectory (₹)</h3>
            <span className="text-xs font-mono text-[#3fb950] font-bold">₹1.42 Lakhs Today</span>
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
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Sales Mix by Channel</h3>
            <span className="text-xs font-mono text-[#8b949e]">4 Active Channels</span>
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
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order SO#, Customer or Product..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8b949e]">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="All">All Channels</option>
              <option value="Distributor">Distributor</option>
              <option value="Retail Supermarket">Retail Supermarket</option>
              <option value="Institutional / Horeca">Institutional / Horeca</option>
              <option value="Direct Consumer">Direct Consumer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8b949e]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#8b949e]">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="All">All Dates</option>
              <option value="2026-10-06">2026-10-06 (Today)</option>
              <option value="2026-10-05">2026-10-05 (Yesterday)</option>
            </select>
          </div>

          <span className="text-xs text-[#8b949e] font-mono ml-1">
            Showing <strong className="text-[#58a6ff]">{filteredOrders.length}</strong> of {displayOrders.length}
          </span>

          {(search !== '' || channelFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setChannelFilter('All');
                setPaymentFilter('All');
                setDateFilter('All');
              }}
              className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#f85149] rounded text-[11px] font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
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
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#58a6ff]">{ord.orderNumber}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{ord.date}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">{ord.customerName}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{ord.channel}</td>
                  <td className="px-4 py-3 font-sans text-[#c9d1d9]">{ord.product}</td>
                  <td className="px-4 py-3">{ord.quantityUnits.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{ord.unitRate.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-[#3fb950]">₹{ord.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={ord.paymentStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{ord.fulfillmentStatus}</td>
                  <td className="px-4 py-3 text-right font-sans">
                    <button
                      onClick={async () => {
                        try {
                          const inv = await api.sales.getInvoice(ord.orderNumber);
                          if (inv?.data) {
                            setSelectedInvoice(inv.data);
                            setIsInvoiceModalOpen(true);
                            return;
                          }
                        } catch (err) {
                          console.warn('API invoice fetch notice, synthesizing client-side GST invoice:', err);
                        }

                        // Seamless client-side GST invoice synthesis
                        const pLower = ord.product.toLowerCase();
                        let hsnCode = '0401';
                        let gstRate = 0.05;
                        if (pLower.includes('ghee') || pLower.includes('butter')) {
                          hsnCode = '0405';
                          gstRate = 0.12;
                        } else if (pLower.includes('paneer') || pLower.includes('cheese')) {
                          hsnCode = '0406';
                          gstRate = 0.05;
                        } else if (pLower.includes('powder')) {
                          hsnCode = '0402';
                          gstRate = 0.05;
                        }

                        const taxableValue = +(ord.totalAmount / (1 + gstRate)).toFixed(2);
                        const totalGst = +(ord.totalAmount - taxableValue).toFixed(2);
                        const cgst = +(totalGst / 2).toFixed(2);
                        const sgst = +(totalGst / 2).toFixed(2);

                        setSelectedInvoice({
                          invoiceNumber: `INV-${ord.orderNumber.replace(/[^0-9]/g, '') || '2026-1001'}`,
                          orderNumber: ord.orderNumber,
                          invoiceDate: ord.date,
                          seller: {
                            legalName: 'DairyOS Operational Cooperative Enterprise Ltd.',
                            fssaiLicense: '10018021003456',
                            gstin: '24AAACC1209B1ZK',
                            plantAddress: 'Plant Yard 4, GIDC Industrial Estate, Anand, Gujarat - 388001',
                            contact: '+91 2692 245000',
                          },
                          buyer: {
                            customerName: ord.customerName,
                            channel: ord.channel,
                            state: 'Gujarat',
                            placeOfSupply: '24-Gujarat',
                          },
                          lineItems: [
                            {
                              itemNo: 1,
                              description: ord.product,
                              hsnCode,
                              quantity: ord.quantityUnits,
                              unit: 'Units / Packets',
                              unitRate: ord.unitRate,
                              taxableValue,
                              cgstRatePct: +(gstRate * 50).toFixed(1),
                              cgstAmount: cgst,
                              sgstRatePct: +(gstRate * 50).toFixed(1),
                              sgstAmount: sgst,
                              grossAmount: ord.totalAmount,
                            },
                          ],
                          totals: {
                            taxableSubtotal: taxableValue,
                            cgstTotal: cgst,
                            sgstTotal: sgst,
                            igstTotal: 0.0,
                            totalGstAmount: totalGst,
                            grandTotalINR: ord.totalAmount,
                            paymentStatus: ord.paymentStatus,
                            fulfillmentStatus: ord.fulfillmentStatus,
                          },
                          declaration: 'Certified that the particulars given above are true and correct, and the goods comply with FSSAI regulations.',
                        });
                        setIsInvoiceModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-sky-950/60 hover:bg-sky-900/80 text-sky-400 border border-sky-800/60 rounded text-xs cursor-pointer font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>GST Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Commercial Sales Invoice"
        subtitle="Issue wholesale distributor dispatch or direct institutional invoice"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vadodara Retail Mart"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Sales Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Distributor">Distributor</option>
                <option value="Retail Supermarket">Retail Supermarket</option>
                <option value="Institutional / Horeca">Institutional / Horeca</option>
                <option value="Direct Consumer">Direct Consumer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Product</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Quantity (Units)</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Unit Rate (₹)</label>
              <input
                type="number"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#0d1117] rounded border border-[#30363d] flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Calculated Invoice Amount:</span>
            <span className="text-base font-bold font-mono text-[#3fb950]">
              ₹{((parseInt(qty) || 0) * (parseFloat(rate) || 0)).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* GST TAX INVOICE MODAL */}
      <GSTInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceData={selectedInvoice}
        onOrderDispatched={(orderNum, status) => {
          // Update local orders list so table reflects status immediately
          setLocalOrders((prev) =>
            prev.map((o) =>
              o.orderNumber === orderNum ||
              orderNum.includes(o.orderNumber) ||
              o.orderNumber.includes(orderNum)
                ? { ...o, fulfillmentStatus: (status === 'Dispatched / In Transit' ? 'Dispatched' : status) as any }
                : o
            )
          );
          // Update selected invoice fulfillment status if viewed
          if (selectedInvoice) {
            setSelectedInvoice({
              ...selectedInvoice,
              totals: {
                ...selectedInvoice.totals,
                fulfillmentStatus: status,
              },
            });
          }
        }}
      />
    </div>
  );
};
