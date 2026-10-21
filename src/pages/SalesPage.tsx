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
    { label: 'Distributor Network', value: channelSales.Distributor, color: '#1b4332' },
    { label: 'Institutional / Horeca', value: channelSales.Horeca, color: '#2d6a4f' },
    { label: 'Retail Supermarket', value: channelSales.Retail, color: '#52b788' },
    { label: 'Farm Direct Consumer', value: channelSales.Direct, color: '#c59b27' },
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
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <ShoppingCart className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Sales Orders & Revenue Operations
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                GST 3-Ply Compliant
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Omni-channel commercial invoices across distributor networks, modern retail, Horeca banquets, and farm gate sales.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Sales Order</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <MetricCard label="Today's Gross Sales" value={`₹${todayRevenue.toLocaleString()}`} unit="" trend="up" changePct={2.4} changeText="Invoiced today" />
        <MetricCard label="Estimated Monthly Run" value="₹42.8 Lakhs" unit="" trend="up" changeText="30-day projection" />
        <MetricCard label="Commercial Orders" value={orders.length} unit="Invoices" trend="neutral" changeText="Active routes fulfillment" />
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
        <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Daily Revenue Trajectory (₹)</h3>
              <p className="text-[11px] text-stone-500">Gross billing trend over current cycle</p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              ₹1.42 Lakhs Today
            </span>
          </div>
          <AreaTrendChart
            data={salesTrend}
            primaryColor="#1b4332"
            primaryLabel="Daily Gross Sales"
            unit="₹"
            height={160}
          />
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Sales Mix by Channel</h3>
              <p className="text-[11px] text-stone-500">Offtake split across market channels</p>
            </div>
            <span className="text-xs font-mono text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full font-medium">
              4 Active Channels
            </span>
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
      <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order SO#, Customer or Product..."
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Channels</option>
              <option value="Distributor">Distributor</option>
              <option value="Retail Supermarket">Retail Supermarket</option>
              <option value="Institutional / Horeca">Institutional / Horeca</option>
              <option value="Direct Consumer">Direct Consumer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Dates</option>
              <option value="2026-10-06">2026-10-06 (Today)</option>
              <option value="2026-10-05">2026-10-05 (Yesterday)</option>
            </select>
          </div>

          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full">
            Showing <strong className="font-bold text-forest-950">{filteredOrders.length}</strong> of {displayOrders.length}
          </span>

          {(search !== '' || channelFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setChannelFilter('All');
                setPaymentFilter('All');
                setDateFilter('All');
              }}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#ede8df] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Commercial Order Book</h3>
            <p className="text-[11px] text-stone-500">Authorized sales orders, dispatch tracking and tax invoices</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            {displayOrders.length} Invoiced Orders
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Order #</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Customer</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Channel</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Product</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Quantity</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Unit Rate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Total Amount</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Payment</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Fulfillment</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-forest-900">{ord.orderNumber}</td>
                  <td className="px-4 py-3.5 text-stone-500">{ord.date}</td>
                  <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{ord.customerName}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {ord.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-sans text-stone-800 font-medium">{ord.product}</td>
                  <td className="px-4 py-3.5">{ord.quantityUnits.toLocaleString()}</td>
                  <td className="px-4 py-3.5">₹{ord.unitRate.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">₹{ord.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={ord.paymentStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 font-sans text-stone-600">{ord.fulfillmentStatus}</td>
                  <td className="px-4 py-3.5 text-right font-sans">
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
                      className="px-3 py-1.5 bg-sage-50 hover:bg-sage-100 text-forest-800 border border-sage-200 rounded-xl text-xs cursor-pointer font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-forest-700" />
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
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vadodara Retail Mart"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Sales Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              >
                <option value="Distributor">Distributor</option>
                <option value="Retail Supermarket">Retail Supermarket</option>
                <option value="Institutional / Horeca">Institutional / Horeca</option>
                <option value="Direct Consumer">Direct Consumer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Product</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Quantity (Units)</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Unit Rate (₹)</label>
              <input
                type="number"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df] flex items-center justify-between text-xs">
            <span className="text-stone-600 font-sans font-medium">Calculated Invoice Amount:</span>
            <span className="text-base font-bold font-mono text-forest-950">
              ₹{((parseInt(qty) || 0) * (parseFloat(rate) || 0)).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
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
          setLocalOrders((prev) =>
            prev.map((o) =>
              o.orderNumber === orderNum ||
              orderNum.includes(o.orderNumber) ||
              o.orderNumber.includes(orderNum)
                ? { ...o, fulfillmentStatus: (status === 'Dispatched / In Transit' ? 'Dispatched' : status) as any }
                : o
            )
          );
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

export default SalesPage;
