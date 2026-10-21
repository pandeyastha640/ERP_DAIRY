import React, { useState } from 'react';
import { SalesOrder } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AreaTrendChart, DonutChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { ShoppingCart, Plus, Search, Filter, DollarSign, Layers, FileText, Calendar, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { GSTInvoiceModal } from '../components/sales/GSTInvoiceModal';

interface SalesPageProps {
  orders: SalesOrder[];
  onAddOrder: (order: SalesOrder) => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({ orders, onAddOrder }) => {
  const { setCurrentModule, setSelectedItemId } = useDairyERP();
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

  // 14-Day Timeline with calendar filtering
  const masterSalesHistory = [
    { isoDate: '2026-09-23', label: '23 Sep', value: 128000 },
    { isoDate: '2026-09-24', label: '24 Sep', value: 131500 },
    { isoDate: '2026-09-25', label: '25 Sep', value: 129000 },
    { isoDate: '2026-09-26', label: '26 Sep', value: 134200 },
    { isoDate: '2026-09-27', label: '27 Sep', value: 136000 },
    { isoDate: '2026-09-28', label: '28 Sep', value: 132000 },
    { isoDate: '2026-09-29', label: '29 Sep', value: 135800 },
    { isoDate: '2026-09-30', label: '30 Sep', value: 137400 },
    { isoDate: '2026-10-01', label: '01 Oct', value: 135000 },
    { isoDate: '2026-10-02', label: '02 Oct', value: 138000 },
    { isoDate: '2026-10-03', label: '03 Oct', value: 140000 },
    { isoDate: '2026-10-04', label: '04 Oct', value: 139000 },
    { isoDate: '2026-10-05', label: '05 Oct', value: 139500 },
    { isoDate: '2026-10-06', label: '06 Oct', value: todayRevenue },
  ];

  const [trendDays, setTrendDays] = useState<7 | 14>(7);
  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');

  const activeSalesTrend = React.useMemo(() => {
    let result = masterSalesHistory;
    if (chartStartDate && chartEndDate) {
      result = result.filter((d) => d.isoDate >= chartStartDate && d.isoDate <= chartEndDate);
      return result.length > 0 ? result : masterSalesHistory.slice(-7);
    }
    return result.slice(-trendDays);
  }, [trendDays, chartStartDate, chartEndDate, todayRevenue]);

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

      {/* Omni-Channel Flow Links */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <span className="text-stone-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">Commercial Flow:</span>
        <button
          onClick={() => setCurrentModule('products')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Tab 06 Product SKUs & Pricing</span>
        </button>
        <button
          onClick={() => setCurrentModule('inventory')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Tab 07 Finished Stock</span>
        </button>
        <button
          onClick={() => setCurrentModule('distribution')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Tab 10 Route Distribution & Crates</span>
        </button>
        <button
          onClick={() => setCurrentModule('payments')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Tab 15 Farmer & Buyer Accounts</span>
        </button>
        <button
          onClick={() => setCurrentModule('finance')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Tab 16 Profitability & Unit Economics</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div onClick={() => setCurrentModule('finance')} className="cursor-pointer group" title="Click to view Gross Sales in Finance Ledger">
          <MetricCard label="Today's Gross Sales" value={`₹${todayRevenue.toLocaleString()}`} unit="" trend="up" changePct={2.4} changeText="Invoiced today →" />
        </div>
        <div onClick={() => setCurrentModule('reports')} className="cursor-pointer group" title="Click to view 30-day projection in Reports">
          <MetricCard label="Estimated Monthly Run" value="₹42.8 Lakhs" unit="" trend="up" changeText="30-day projection →" />
        </div>
        <MetricCard label="Commercial Orders" value={orders.length} unit="Invoices" trend="neutral" changeText="Active routes fulfillment" />
        <div onClick={() => setCurrentModule('finance')} className="cursor-pointer group" title="Click to inspect wholesale economics">
          <MetricCard label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString()}`} unit="" trend="up" changeText="Wholesale average →" />
        </div>
        <div onClick={() => setCurrentModule('payments')} className="cursor-pointer group" title="Click to view payment receivables & collections">
          <MetricCard
            label="Payment Receivables"
            value={`₹${outstandingAmount.toLocaleString()}`}
            unit=""
            trend="down"
            isGoodWhenUp={false}
            changeText="Pending settlement →"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend with Calendar Filter */}
        <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Daily Revenue Trajectory (₹)</h3>
              <p className="text-[11px] text-stone-500">Gross billing trend over current cycle</p>
            </div>
            
            {/* Calendar & Timeframe Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-cream-50 border border-[#ede8df] rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => {
                    setChartStartDate('');
                    setChartEndDate('');
                    setTrendDays(7);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                    trendDays === 7 && !chartStartDate ? 'bg-forest-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => {
                    setChartStartDate('');
                    setChartEndDate('');
                    setTrendDays(14);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                    trendDays === 14 && !chartStartDate ? 'bg-forest-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  14D
                </button>
              </div>

              {/* HTML5 Calendar Range Picker */}
              <div className="flex items-center gap-1 bg-[#fcfbf9] border border-[#ede8df] rounded-lg px-2 py-0.5 text-[11px]">
                <Calendar className="w-3 h-3 text-forest-700 shrink-0" />
                <input
                  type="date"
                  value={chartStartDate}
                  onChange={(e) => setChartStartDate(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer"
                  title="Chart Start Date"
                />
                <span className="text-stone-400">→</span>
                <input
                  type="date"
                  value={chartEndDate}
                  onChange={(e) => setChartEndDate(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer"
                  title="Chart End Date"
                />
                {(chartStartDate || chartEndDate) && (
                  <button
                    onClick={() => {
                      setChartStartDate('');
                      setChartEndDate('');
                    }}
                    className="ml-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    title="Clear calendar filter"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <AreaTrendChart
            data={activeSalesTrend}
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

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-stone-500 font-medium font-sans">Calendar Date:</span>
            <div className="flex items-center gap-1 bg-[#fdfcfb] border border-[#ede8df] rounded-xl px-2.5 py-1 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <input
                type="date"
                value={dateFilter === 'All' ? '' : dateFilter}
                onChange={(e) => setDateFilter(e.target.value || 'All')}
                className="bg-transparent text-xs font-mono text-forest-950 outline-none cursor-pointer"
                title="Select Order Date"
              />
              {dateFilter !== 'All' && (
                <button
                  onClick={() => setDateFilter('All')}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer ml-1 text-[11px] font-bold"
                  title="Show all dates"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDateFilter('2026-10-06')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                  dateFilter === '2026-10-06'
                    ? 'bg-forest-900 text-white border-forest-950 shadow-2xs'
                    : 'bg-cream-50 text-stone-700 border-[#ede8df] hover:bg-cream-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('2026-10-05')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                  dateFilter === '2026-10-05'
                    ? 'bg-forest-900 text-white border-forest-950 shadow-2xs'
                    : 'bg-cream-50 text-stone-700 border-[#ede8df] hover:bg-cream-100'
                }`}
              >
                Yesterday
              </button>
            </div>
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
                  <td className="px-4 py-3.5 font-sans">
                    <button
                      onClick={() => {
                        setSelectedItemId(ord.customerName);
                        setCurrentModule('distribution');
                      }}
                      className="font-bold text-forest-950 hover:underline hover:text-forest-700 text-left flex items-center gap-1 cursor-pointer group"
                      title="Jump to Route Logistics & Customer Orders"
                    >
                      <span>{ord.customerName}</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-forest-700">→</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {ord.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <button
                      onClick={() => {
                        setSelectedItemId(ord.product);
                        setCurrentModule('products');
                      }}
                      className="font-medium text-stone-800 hover:underline hover:text-forest-800 text-left flex items-center gap-1 cursor-pointer group"
                      title="Jump to SKU Catalog"
                    >
                      <span>{ord.product}</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-forest-700">→</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5">{ord.quantityUnits.toLocaleString()}</td>
                  <td className="px-4 py-3.5">₹{ord.unitRate.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">
                    <button
                      onClick={() => setCurrentModule('finance')}
                      className="hover:underline text-forest-950 cursor-pointer font-bold inline-flex items-center gap-1 group"
                      title="Jump to Finance Ledger"
                    >
                      <span>₹{ord.totalAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-forest-700">→</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <button
                      onClick={() => setCurrentModule('payments')}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      title="Jump to Farmer & Customer Payment Ledger"
                    >
                      <StatusBadge status={ord.paymentStatus} size="sm" />
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <button
                      onClick={() => setCurrentModule('distribution')}
                      className="text-stone-600 hover:text-forest-800 hover:underline cursor-pointer flex items-center gap-1"
                      title="Jump to Route Dispatch & Fleet Tracking"
                    >
                      <span>{ord.fulfillmentStatus}</span>
                      <span className="text-[10px] text-stone-400">→</span>
                    </button>
                  </td>
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
