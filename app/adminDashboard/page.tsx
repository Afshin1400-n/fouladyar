"use client"

import { useEffect, useState } from 'react';
import RefreshButton from '../component/refreshBtn';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useStore from '../store/store';
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

// ============ نام فارسی انواع برش ============
const CUT_TYPE_LABELS = {
  flat_thin: 'ورق صاف نازک',
  flat_thick: 'ورق صاف ضخیم',
  shutter_small: 'کرکره کوچک',
  shutter_big: 'کرکره بزرگ',
  shutter_a: 'کرکره A',
  shutter_b: 'کرکره B',
  shutter_c: 'کرکره C',
  bend: 'خم',
  cut: 'برش ساده',
  custom: 'سفارشی',
  trapezoidal: 'ذوزنقه',
};

const getCutTypeLabel = (cutType) => {
  return CUT_TYPE_LABELS[cutType] || cutType || '---';
};

// ============ کامپوننت اصلی ============

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

  // محافظت از صفحه
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/adminLogin');
    }
  }, [isAdminAuthenticated, router]);

  // گرفتن دیتا
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
  // ✅ محاسبه مجموع وزن برش همه‌ی صورت‌برش‌های یک حواله
  // ============================================================
  const getOrderTotalCutWeight = (orderId) => {
    return allInvoices
      .filter((inv) => inv.orderId === orderId)
      .reduce((sum, inv) => sum + (inv.totalWeightInvoices || 0), 0);
  };

  // ============================================================
  // ✅ ثبت نهایی صورت‌برش
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
            ? `✅ حواله ${order.orderNumber} تکمیل و بایگانی شد!`
            : `✅ صورت‌برش ثبت نهایی و بایگانی شد.`
        );
      } else {
        console.warn('⚠️ سرور دیتا رو ذخیره نکرده!');
        alert(
          '⚠️ ثبت انجام شد اما سرور دیتا رو ذخیره نکرده.\n' +
            'لطفاً json-server رو بررسی کن و db.json رو چک کن.'
        );
      }
    } catch (error) {
      console.error('❌ Error finalizing invoice:', error);
      alert('❌ خطا در ثبت نهایی');
    }
  };

  if (!isAdminAuthenticated) return null;

  // 📊 آمار
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

  // 🔍 فیلترها
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
      inv.notes?.includes(searchTerm)  // ✅ جستجو در توضیحات
  );

  const filteredArchived = archivedInvoices.filter(
    (inv) =>
      inv.orderNumber?.includes(searchTerm) ||
      inv.customerName?.includes(searchTerm) ||
      inv.notes?.includes(searchTerm)  // ✅ جستجو در توضیحات
  );

  return (
    <div className="min-h-screen bg-slate-950" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">پنل مدیریت</h1>
              <p className="text-xs text-slate-400">فولادیار کوروش</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-left">
              <p className="text-sm font-medium text-white">{adminUser?.name}</p>
              <p className="text-[11px] text-indigo-400">مدیر سیستم</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {adminUser?.name?.charAt(0) || 'م'}
            </div>
            <Link
              href="/"
              className="p-2.5 hover:bg-slate-800 rounded-xl transition"
              title="صفحه اصلی"
            >
              <Home className="w-5 h-5 text-slate-400" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="کل مشتریان" value={totalCustomers} color="from-blue-500 to-blue-600" shadow="shadow-blue-500/20" />
          <StatCard icon={FileText} label="صورت‌برش‌های فعال" value={totalInvoices} color="from-emerald-500 to-emerald-600" shadow="shadow-emerald-500/20" />
          <StatCard icon={TrendingUp} label="وزن کل (kg)" value={Math.round(totalOrdersWeight)} color="from-amber-500 to-amber-600" shadow="shadow-amber-500/20" />
          <StatCard icon={Clock} label="وزن باقی‌مانده (kg)" value={Math.round(remainingWeight)} color="from-purple-500 to-purple-600" shadow="shadow-purple-500/20" />
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  مشتریان
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'customers' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {totalCustomers}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('invoices'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'invoices'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  صورت‌برش‌ها
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'invoices' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {activeInvoices.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('archive'); setSearchTerm(''); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'archive'
                      ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  بایگانی
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'archive' ? 'bg-white/20' : 'bg-slate-700'}`}>
                    {archivedInvoices.length}
                  </span>
                </button>
              </div>

              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === 'customers'
                      ? 'جستجو در نام، کد ملی، تلفن...'
                      : activeTab === 'invoices'
                      ? 'جستجو در شماره حواله، مشتری، توضیحات...'
                      : 'جستجو در بایگانی...'
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-2.5 pr-10 pl-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <RefreshButton onRefresh={fetchAdminData} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" />
            </div>
          </div>

          {adminLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-400 mt-3 text-sm">در حال بارگذاری...</p>
            </div>
          ) : (
            <>
              {/* مشتریان */}
              {activeTab === 'customers' && (
                <div className="overflow-x-auto">
                  {filteredCustomers.length === 0 ? (
                    <EmptyState icon={Users} title={searchTerm ? 'مشتری‌ای یافت نشد' : 'هیچ مشتری‌ای ثبت نشده'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>ردیف</Th>
                          <Th>نام</Th>
                          <Th>کد ملی</Th>
                          <Th>تلفن</Th>
                          <Th>آدرس</Th>
                          <Th>تعداد حواله</Th>
                          <Th>تاریخ عضویت</Th>
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
                                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {customer.name?.charAt(0) || '؟'}
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
                                <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                                  <Package className="w-3 h-3" />
                                  {customerOrders.length} حواله
                                </span>
                              </Td>
                              <Td className="text-slate-500 text-xs">
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('fa-IR') : '---'}
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* صورت‌برش‌ها */}
              {activeTab === 'invoices' && (
                <div className="overflow-x-auto">
                  {filteredInvoices.length === 0 ? (
                    <EmptyState icon={FileText} title={searchTerm ? 'صورت‌برشی یافت نشد' : 'هیچ صورت‌برش فعالی ثبت نشده'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>تاریخ</Th>
                          <Th>شماره حواله</Th>
                          <Th>مشتری</Th>
                          <Th>تعداد آیتم</Th>
                          <Th>وزن برش</Th>
                          <Th>توضیحات</Th>  {/* ✅ ستون توضیحات */}
                          <Th>وضعیت</Th>
                          <Th>عملیات</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-800/30 transition">
                            <Td className="text-slate-500 text-xs">
                              {new Date(invoice.date).toLocaleDateString('fa-IR')}
                            </Td>
                            <Td className="font-mono text-blue-400 font-semibold">{invoice.orderNumber}</Td>
                            <Td className="text-white font-medium">{invoice.customerName}</Td>
                            <Td>
                              <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                                {invoice.totalItems} آیتم
                              </span>
                            </Td>
                            <Td className="text-red-400 font-semibold">{invoice.totalWeightInvoices} kg</Td>

                            {/* ✅ ستون توضیحات */}
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
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-500/10 border-purple-500/30 text-purple-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {invoice.status}
                              </span>
                            </Td>
                            <Td>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="inline-flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                جزئیات
                              </button>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* بایگانی */}
              {activeTab === 'archive' && (
                <div className="overflow-x-auto">
                  {filteredArchived.length === 0 ? (
                    <EmptyState icon={Archive} title={searchTerm ? 'صورت‌برشی یافت نشد' : 'بایگانی خالی است'} />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>تاریخ ثبت نهایی</Th>
                          <Th>شماره حواله</Th>
                          <Th>مشتری</Th>
                          <Th>تعداد آیتم</Th>
                          <Th>وزن نهایی</Th>
                          <Th>توضیحات</Th>  {/* ✅ ستون توضیحات */}
                          <Th>وضعیت</Th>
                          <Th>عملیات</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredArchived.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-800/30 transition">
                            <Td className="text-slate-500 text-xs">
                              {invoice.finalizedAt
                                ? new Date(invoice.finalizedAt).toLocaleDateString('fa-IR')
                                : new Date(invoice.date).toLocaleDateString('fa-IR')}
                            </Td>
                            <Td className="font-mono text-blue-400 font-semibold">{invoice.orderNumber}</Td>
                            <Td className="text-white font-medium">{invoice.customerName}</Td>
                            <Td>
                              <span className="inline-flex items-center gap-1 bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                                {invoice.totalItems} آیتم
                              </span>
                            </Td>
                            <Td className="text-emerald-400 font-semibold">{invoice.totalWeightInvoices} kg</Td>

                            {/* ✅ ستون توضیحات */}
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
                                ثبت نهایی
                              </span>
                            </Td>
                            <Td>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="inline-flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                مشاهده
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
          گروه فولادیار کوروش © ۱۴۰۵ — پنل مدیریت
        </p>
      </main>

      {/* مودال جزئیات */}
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

// ============ کامپوننت‌های کمکی ============

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
    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
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

// ============ مودال جزئیات صورت‌برش ============

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
      label: 'قابل تکمیل',
    };
    if (remaining <= 200) return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      label: 'نزدیک به تکمیل',
    };
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      bar: 'bg-red-500',
      label: 'باقی‌مانده زیاد',
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
      dir="rtl"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">صورت‌برش حواله {invoice.orderNumber}</h3>
              <p className="text-xs text-slate-400">
                {invoice.customerName} — {new Date(invoice.date).toLocaleDateString('fa-IR')}
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
              <p className="text-xs text-slate-500 mb-1">وزن کل حواله</p>
              <p className="text-lg font-bold text-white">{Math.round(orderWeight)} kg</p>
            </div>
            <div className="text-center border-x border-slate-800">
              <p className="text-xs text-slate-500 mb-1">مجموع وزن برش</p>
              <p className="text-lg font-bold text-red-400">{Math.round(totalCutWeight)} kg</p>
              <p className="text-[10px] text-red-400/70 mt-0.5">{cutPercent}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">وزن باقی‌مانده</p>
              <p className={`text-lg font-bold ${colors.text}`}>{remaining} kg</p>
              <p className={`text-[10px] mt-0.5 ${colors.text} opacity-70`}>{remainingPercent}%</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">پیشرفت برش</span>
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
                ? '📚 این صورت‌برش در بایگانی است'
                : canFinalize
                ? '✅ قابل تکمیل و بستن'
                : '❌ برای تکمیل باید باقی‌مانده ≤ ۵۰ کیلو باشه'}
            </div>
          </div>

          {/* ✅ توضیحات (داخل مودال) */}
          {invoice.notes && invoice.notes.trim() !== '' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-400 mb-1">توضیحات:</p>
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
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">#</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">محصول</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">برند</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">ضخامت</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">عرض</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">طول</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">تعداد</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">بندیل</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">وزن</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500">نوع برش</th>
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
                      <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-lg whitespace-nowrap">
                        {getCutTypeLabel(item.cutType)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800/30">
                <tr>
                  <td colSpan="8" className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                    مجموع وزن:
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
                <span>این صورت‌برش ثبت نهایی شده و در بایگانی است</span>
              </div>
            ) : canFinalize ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>آماده ثبت نهایی</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>باقی‌مانده: {remaining} kg (باید ≤ 50 بشه)</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
            >
              بستن
            </button>

            {!isArchived && (
              <button
                onClick={handleFinalize}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  canFinalize
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    ثبت نهایی
                    {canFinalize ? ' و بستن حواله' : ''}
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