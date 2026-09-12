"use client"

import { useEffect, useState } from 'react';
import RefreshButton from '../component/refreshBtn';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useStore from '../store/store';
import Logo from '../component/logo';
import {
  Shield,
  LogOut,
  Users,
  Package,
  FileText,
  Search,
  BarChart3,
  Phone,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Home,
  X,
  Eye,
  ClipboardList,
  AlertCircle,
  Save,
  Archive,
  MessageSquare,
} from 'lucide-react';

// ============ Cut Type Labels ============
const CUT_TYPE_LABELS = {
  flat_thin: 'Flat Sheet - Thin',
  flat_thick: 'Flat Sheet - Thick',
  shutter_small: 'Shutter - Small',
  shutter_big: 'Shutter - Large',
  shutter_a: 'Shutter A',
  shutter_b: 'Shutter B',
  shutter_c: 'Shutter C',
  bend: 'Bend',
  cut: 'Simple Cut',
  custom: 'Custom',
  trapezoidal: 'Trapezoidal',
};

const getCutTypeLabel = (cutType) => {
  return CUT_TYPE_LABELS[cutType] || cutType || '---';
};

// ============ Main Component ============

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    adminUser,
    isAdminAuthenticated,
    adminLogout,
    allCustomers,
    allOrders,
    allInvoices,
    adminLoading,
    fetchAdminData,
  } = useStore();

  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Route protection
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/adminLogin');
    }
  }, [isAdminAuthenticated, router]);

  // Fetch data
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  const handleLogout = () => {
    adminLogout();
    router.push('/adminLogin');
  };

  // ============================================================
  // ✅ Calculate total cut weight of all invoices for an order
  // ============================================================
  const getOrderTotalCutWeight = (orderId) => {
    return allInvoices
      .filter((inv) => inv.orderId === orderId)
      .reduce((sum, inv) => sum + (inv.totalWeightInvoices || 0), 0);
  };

  // ============================================================
  // ✅ Finalize Invoice
  // ============================================================
  const handleFinalizeInvoice = async (invoice, order) => {
    const totalCutWeight = getOrderTotalCutWeight(order.id);
    const orderWeight = order?.totalWeight || 0;
    const remaining = Math.max(0, Math.round(orderWeight - totalCutWeight));
    const newStatus = remaining <= 50 ? 'تکمیل شده' : 'باز';

    try {
      await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        status: newStatus,
        remainingWeight: remaining,
        updatedAt: new Date().toISOString(),
      });

      await axios.patch(`http://localhost:4000/invoice/${invoice.id}`, {
        status: 'ثبت نهایی',
        finalizedAt: new Date().toISOString(),
      });

      setSelectedInvoice(null);
      await fetchAdminData();

      const updatedInvoice = useStore
        .getState()
        .allInvoices.find((inv) => inv.id === invoice.id);

      console.log('🔵 Invoice ID:', invoice.id);
      console.log('🟢 Status after fetch:', updatedInvoice?.status);

      if (updatedInvoice?.status === 'ثبت نهایی') {
        alert(
          remaining <= 50
            ? `✅ Order ${order.orderNumber} completed and archived!`
            : `✅ Invoice finalized and archived.`
        );
      } else {
        console.warn('⚠️ Server did not save the data!');
        alert(
          '⚠️ Save was successful but the server did not persist the data.\n' +
            'Please check json-server and db.json.'
        );
      }
    } catch (error) {
      console.error('❌ Error finalizing invoice:', error);
      alert('❌ Error finalizing invoice');
    }
  };

  if (!isAdminAuthenticated) return null;

  // 📊 Stats
  const totalCustomers = allCustomers.length;
  const totalInvoices = allInvoices.filter((inv) => inv.status !== 'ثبت نهایی').length;
  const totalOrdersWeight = allOrders.reduce(
    (sum, o) => sum + (o.totalWeight || 0),
    0
  );
  const totalCutWeight = allInvoices.reduce(
    (sum, inv) => sum + (inv.totalWeightInvoices || 0),
    0
  );
  const remainingWeight = Math.max(0, totalOrdersWeight - totalCutWeight);

  // 🔍 Filters
  const filteredCustomers = allCustomers.filter(
    (c) =>
      c.name?.includes(searchTerm) ||
      c.nationalId?.includes(searchTerm) ||
      c.phone?.includes(searchTerm)
  );

  const activeInvoices = allInvoices.filter((inv) => inv.status !== 'ثبت نهایی');
  const archivedInvoices = allInvoices.filter((inv) => inv.status === 'ثبت نهایی');

  const filteredInvoices = activeInvoices.filter(
    (inv) =>
      inv.orderNumber?.includes(searchTerm) ||
      inv.customerName?.includes(searchTerm) ||
      inv.status?.includes(searchTerm) ||
      inv.notes?.includes(searchTerm)
  );

  const filteredArchived = archivedInvoices.filter(
    (inv) =>
      inv.orderNumber?.includes(searchTerm) ||
      inv.customerName?.includes(searchTerm) ||
      inv.notes?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.10),transparent_50%)]" />

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo className='w-full h-32'/>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">Fouladyar Kourosh</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-sm font-medium text-white">{adminUser?.name}</p>
              <p className="text-[11px] text-blue-400">System Admin</p>
              
            </div>
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <Link
              href="/"
              className="p-2.5 hover:bg-slate-800 rounded-xl transition"
              title="Home"
            >
              <Home className="w-5 h-5 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Customers" value={totalCustomers} color="from-blue-500 to-blue-600" shadow="shadow-blue-500/20" />
          <StatCard icon={FileText} label="Active Invoices" value={totalInvoices} color="from-emerald-500 to-emerald-600" shadow="shadow-emerald-500/20" />
          <StatCard icon={TrendingUp} label="Total Weight (kg)" value={Math.round(totalOrdersWeight)} color="from-amber-500 to-amber-600" shadow="shadow-amber-500/20" />
          <StatCard icon={Clock} label="Remaining Weight (kg)" value={Math.round(remainingWeight)} color="from-blue-600 to-blue-700" shadow="shadow-blue-500/20" />
        </div>

        {/* Tabs + Search */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="border-b border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3 p-4">
              <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
                <button
                  onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'customers'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Customers
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'customers' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {totalCustomers}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('invoices'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'invoices'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Invoices
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'invoices' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {activeInvoices.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('archive'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'archive'
                      ? 'bg-slate-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  Archive
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'archive' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {archivedInvoices.length}
                  </span>
                </button>
              </div>

              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === 'customers'
                      ? 'Search by name, National ID, phone...'
                      : activeTab === 'invoices'
                      ? 'Search by order #, customer, notes...'
                      : 'Search archive...'
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <RefreshButton onRefresh={fetchAdminData} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" />
            </div>
          </div>

          {adminLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 mt-3 text-sm">Loading...</p>
            </div>
          ) : (
            <>
              {/* Customers */}
              {activeTab === 'customers' && (
                <div className="overflow-x-auto">
                  {filteredCustomers.length === 0 ? (
                    <EmptyState icon={Users} title={searchTerm ? 'No customers found' : 'No customers registered'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>#</Th>
                          <Th>Name</Th>
                          <Th>National ID</Th>
                          <Th>Phone</Th>
                          <Th>Address</Th>
                          <Th>Orders</Th>
                          <Th>Join Date</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredCustomers.map((customer, idx) => {
                          const customerOrders = allOrders.filter((o) => o.customerId === customer.id);
                          return (
                            <tr key={customer.id} className="hover:bg-slate-800/30 transition">
                              <Td className="text-slate-500">{idx + 1}</Td>
                              <Td>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {customer.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="font-semibold text-white">{customer.name}</span>
                                </div>
                              </Td>
                              <Td className="font-mono text-blue-400">{customer.nationalId}</Td>
                              <Td>
                                <span className="inline-flex items-center gap-1.5 text-slate-300">
                                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                                  {customer.phone || '---'}
                                </span>
                              </Td>
                              <Td>
                                <span className="inline-flex items-start gap-1.5 text-slate-400 text-xs max-w-[200px]">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">{customer.address || '---'}</span>
                                </span>
                              </Td>
                              <Td>
                                <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full">
                                  <Package className="w-3 h-3" />
                                  {customerOrders.length} orders
                                </span>
                              </Td>
                              <Td className="text-slate-500 text-xs">
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US') : '---'}
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Invoices */}
              {activeTab === 'invoices' && (
                <div className="overflow-x-auto">
                  {filteredInvoices.length === 0 ? (
                    <EmptyState icon={FileText} title={searchTerm ? 'No invoices found' : 'No active invoices'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>Date</Th>
                          <Th>Order #</Th>
                          <Th>Customer</Th>
                          <Th>Items</Th>
                          <Th>Cut Weight</Th>
                          <Th>Notes</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-800/30 transition">
                            <Td className="text-slate-500 text-xs">
                              {new Date(invoice.date).toLocaleDateString('en-US')}
                            </Td>
                            <Td className="font-mono text-blue-400 font-semibold">{invoice.orderNumber}</Td>
                            <Td className="text-white font-medium">{invoice.customerName}</Td>
                            <Td>
                              <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                                {invoice.totalItems} items
                              </span>
                            </Td>
                            <Td className="text-red-400 font-semibold">{invoice.totalWeightInvoices} kg</Td>

                            <Td className="max-w-[150px]">
                              {invoice.notes ? (
                                <span
                                  className="inline-flex items-center gap-1 text-amber-400 text-xs truncate max-w-[140px]"
                                  title={invoice.notes}
                                >
                                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{invoice.notes}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">---</span>
                              )}
                            </Td>

                            <Td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/10 border-blue-500/30 text-blue-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {invoice.status}
                              </span>
                            </Td>
                            <Td>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="inline-flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Archive */}
              {activeTab === 'archive' && (
                <div className="overflow-x-auto">
                  {filteredArchived.length === 0 ? (
                    <EmptyState icon={Archive} title={searchTerm ? 'No invoices found' : 'Archive is empty'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>Finalized Date</Th>
                          <Th>Order #</Th>
                          <Th>Customer</Th>
                          <Th>Items</Th>
                          <Th>Final Weight</Th>
                          <Th>Notes</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredArchived.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-800/30 transition">
                            <Td className="text-slate-500 text-xs">
                              {invoice.finalizedAt
                                ? new Date(invoice.finalizedAt).toLocaleDateString('en-US')
                                : new Date(invoice.date).toLocaleDateString('en-US')}
                            </Td>
                            <Td className="font-mono text-blue-400 font-semibold">{invoice.orderNumber}</Td>
                            <Td className="text-white font-medium">{invoice.customerName}</Td>
                            <Td>
                              <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                                {invoice.totalItems} items
                              </span>
                            </Td>
                            <Td className="text-emerald-400 font-semibold">{invoice.totalWeightInvoices} kg</Td>

                            <Td className="max-w-[150px]">
                              {invoice.notes ? (
                                <span
                                  className="inline-flex items-center gap-1 text-amber-400 text-xs truncate max-w-[140px]"
                                  title={invoice.notes}
                                >
                                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{invoice.notes}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">---</span>
                              )}
                            </Td>

                            <Td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                Finalized
                              </span>
                            </Td>
                            <Td>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="inline-flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Fouladyar Kourosh Group © 2026 — Admin Panel
        </p>
      </main>

      {/* Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          order={allOrders.find((o) => o.id === selectedInvoice.orderId)}
          totalCutWeightOfOrder={getOrderTotalCutWeight(selectedInvoice.orderId)}
          onClose={() => setSelectedInvoice(null)}
          onFinalize={handleFinalizeInvoice}
        />
      )}
    </div>
  );
}

// ============ Helper Components ============

function StatCard({ icon: Icon, label, value, color, shadow }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg ${shadow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <BarChart3 className="w-4 h-4 text-slate-700" />
      </div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-sm whitespace-nowrap ${className}`}>{children}</td>;
}

function EmptyState({ icon: Icon, title }) {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <p className="text-slate-500">{title}</p>
    </div>
  );
}

// ============ Invoice Detail Modal ============

function InvoiceDetailModal({ invoice, order, totalCutWeightOfOrder, onClose, onFinalize }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isArchived = invoice.status === 'ثبت نهایی';

  const totalCutWeight = totalCutWeightOfOrder || 0;
  const orderWeight = order?.totalWeight || 0;
  const remaining = Math.max(0, Math.round(orderWeight - totalCutWeight));

  const cutPercent = orderWeight > 0
    ? Math.min(100, Math.round((totalCutWeight / orderWeight) * 100))
    : 0;
  const remainingPercent = 100 - cutPercent;

  const getRemainingColor = () => {
    if (remaining <= 50) return {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
      label: 'Ready to Finalize',
    };
    if (remaining <= 200) return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      label: 'Close to Complete',
    };
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      bar: 'bg-red-500',
      label: 'High Remaining',
    };
  };

  const colors = getRemainingColor();
  const canFinalize = remaining <= 50;

  const handleFinalize = async () => {
    setIsSubmitting(true);
    await onFinalize(invoice, order);
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-blue-600/20 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cutting Invoice — Order {invoice.orderNumber}</h3>
              <p className="text-xs text-slate-400">
                {invoice.customerName} — {new Date(invoice.date).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/30 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Order Total Weight</p>
              <p className="text-lg font-bold text-white">{Math.round(orderWeight)} kg</p>
            </div>
            <div className="text-center border-x border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Total Cut Weight</p>
              <p className="text-lg font-bold text-red-400">{Math.round(totalCutWeight)} kg</p>
              <p className="text-[10px] text-red-400/70 mt-0.5">{cutPercent}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Remaining Weight</p>
              <p className={`text-lg font-bold ${colors.text}`}>{remaining} kg</p>
              <p className={`text-[10px] mt-0.5 ${colors.text} opacity-70`}>{remainingPercent}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Cutting Progress</span>
              <span className={colors.text}>{cutPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${colors.bar} transition-all duration-500`} style={{ width: `${cutPercent}%` }} />
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {isArchived
                ? '📚 This invoice is archived'
                : canFinalize
                ? '✅ Ready to finalize and close'
                : '❌ To finalize, remaining must be ≤ 50 kg'}
            </div>
          </div>

          {invoice.notes && invoice.notes.trim() !== '' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-400 mb-1">Notes:</p>
                  <p className="text-sm text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 rounded-lg">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">#</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Product</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Brand</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Thickness</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Width</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Length</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Quantity</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Bundle</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Weight</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500">Cut Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="px-3 py-2 text-slate-500 text-xs">{item.row || idx + 1}</td>
                    <td className="px-3 py-2 text-slate-300">{item.productType || '---'}</td>
                    <td className="px-3 py-2 text-slate-400">{item.brand || '---'}</td>
                    <td className="px-3 py-2 text-slate-300">{item.thickness || '---'}</td>
                    <td className="px-3 py-2 text-slate-300">{item.width || '---'}</td>
                    <td className="px-3 py-2 text-slate-300">{item.length || '---'}</td>
                    <td className="px-3 py-2 text-slate-300">{item.quantity || '---'}</td>
                    <td className="px-3 py-2 text-slate-500">{item.bundle || '---'}</td>
                    <td className="px-3 py-2 text-white font-semibold">{item.weight || 0} kg</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2 py-1 rounded-lg whitespace-nowrap">
                        {getCutTypeLabel(item.cutType)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800/30">
                <tr>
                  <td colSpan="8" className="px-3 py-3 text-right text-xs font-semibold text-slate-400">
                    Total Weight:
                  </td>
                  <td className="px-3 py-3 text-white font-bold">{invoice.totalWeightInvoices} kg</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {isArchived ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>This invoice is finalized and archived</span>
              </div>
            ) : canFinalize ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to finalize</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Remaining: {remaining} kg (must be ≤ 50)</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
            >
              Close
            </button>

            {!isArchived && (
              <button
                onClick={handleFinalize}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  canFinalize
                    ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/30 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Finalize{canFinalize ? ' & Close Order' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}