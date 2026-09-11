// src/app/admin/dashboard/page.js

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Home,
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('customers'); // customers | orders
  const [searchTerm, setSearchTerm] = useState('');

  // محافظت از صفحه
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin/login');
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
    router.push('/admin/login');
  };

  if (!isAdminAuthenticated) return null;

  // 📊 محاسبه آمار
  const totalCustomers = allCustomers.length;
  const totalOrders = allOrders.length;
  const totalOrdersWeight = allOrders.reduce(
    (sum, o) => sum + (o.totalWeight || 0),
    0
  );
  const totalCutWeight = allInvoices.reduce(
    (sum, inv) => sum + (inv.totalWeightInvoices || 0),
    0
  );
  const remainingWeight = totalOrdersWeight - totalCutWeight;

  // 🔍 فیلتر مشتری‌ها
  const filteredCustomers = allCustomers.filter(
    (c) =>
      c.name?.includes(searchTerm) ||
      c.nationalId?.includes(searchTerm) ||
      c.phone?.includes(searchTerm)
  );

  // 🔍 فیلتر حواله‌ها
  const filteredOrders = allOrders.filter(
    (o) =>
      o.orderNumber?.includes(searchTerm) ||
      o.customerName?.includes(searchTerm) ||
      o.productType?.includes(searchTerm) ||
      o.brand?.includes(searchTerm) ||
      o.status?.includes(searchTerm)
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
              <p className="text-sm font-medium text-white">
                {adminUser?.name}
              </p>
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

        {/* Welcome */}
        <div className="bg-gradient-to-r from-indigo-600/90 to-purple-700/90 backdrop-blur rounded-2xl p-6 mb-8 shadow-xl shadow-indigo-500/20 border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-white mb-2">
            سلام ادمین {adminUser?.name} 👋
          </h2>
          <p className="text-indigo-100 text-sm">
            اینجا می‌تونی همه مشتری‌ها، حواله‌ها و آمار سیستم رو ببینی.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="کل مشتریان"
            value={totalCustomers}
            color="from-blue-500 to-blue-600"
            shadow="shadow-blue-500/20"
          />
          <StatCard
            icon={Package}
            label="کل حواله‌ها"
            value={totalOrders}
            color="from-emerald-500 to-emerald-600"
            shadow="shadow-emerald-500/20"
          />
          <StatCard
            icon={TrendingUp}
            label="وزن کل (kg)"
            value={Math.round(totalOrdersWeight)}
            color="from-amber-500 to-amber-600"
            shadow="shadow-amber-500/20"
          />
          <StatCard
            icon={Clock}
            label="وزن باقی‌مانده (kg)"
            value={Math.round(remainingWeight)}
            color="from-purple-500 to-purple-600"
            shadow="shadow-purple-500/20"
          />
        </div>

        {/* Tabs + Search */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Tabs Header */}
          <div className="border-b border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3 p-4">
              <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveTab('customers');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'customers'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  مشتریان
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'customers' ? 'bg-white/20' : 'bg-slate-700'
                  }`}>
                    {totalCustomers}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  حواله‌ها
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20' : 'bg-slate-700'
                  }`}>
                    {totalOrders}
                  </span>
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === 'customers'
                      ? 'جستجو در نام، کد ملی، تلفن...'
                      : 'جستجو در شماره، مشتری، وضعیت...'
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-2.5 pr-10 pl-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {adminLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-400 mt-3 text-sm">در حال بارگذاری...</p>
            </div>
          ) : (
            <>
              {/* ============ مشتریان ============ */}
              {activeTab === 'customers' && (
                <div className="overflow-x-auto">
                  {filteredCustomers.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title={searchTerm ? 'مشتری‌ای یافت نشد' : 'هیچ مشتری‌ای ثبت نشده'}
                    />
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
                          const customerOrders = allOrders.filter(
                            (o) => o.customerId === customer.id
                          );
                          return (
                            <tr
                              key={customer.id}
                              className="hover:bg-slate-800/30 transition"
                            >
                              <Td className="text-slate-500">{idx + 1}</Td>
                              <Td>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {customer.name?.charAt(0) || '؟'}
                                  </div>
                                  <span className="font-semibold text-white">
                                    {customer.name}
                                  </span>
                                </div>
                              </Td>
                              <Td className="font-mono text-blue-400">
                                {customer.nationalId}
                              </Td>
                              <Td>
                                <span className="inline-flex items-center gap-1.5 text-slate-300">
                                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                                  {customer.phone || '---'}
                                </span>
                              </Td>
                              <Td>
                                <span className="inline-flex items-start gap-1.5 text-slate-400 text-xs max-w-[200px]">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {customer.address || '---'}
                                  </span>
                                </span>
                              </Td>
                              <Td>
                                <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                                  <Package className="w-3 h-3" />
                                  {customerOrders.length} حواله
                                </span>
                              </Td>
                              <Td className="text-slate-500 text-xs">
                                {customer.createdAt
                                  ? new Date(customer.createdAt).toLocaleDateString('fa-IR')
                                  : '---'}
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ============ حواله‌ها ============ */}
              {activeTab === 'orders' && (
                <div className="overflow-x-auto">
                  {filteredOrders.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title={searchTerm ? 'حواله‌ای یافت نشد' : 'هیچ حواله‌ای ثبت نشده'}
                    />
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <Th>تاریخ</Th>
                          <Th>شماره</Th>
                          <Th>مشتری</Th>
                          <Th>محصول</Th>
                          <Th>برند</Th>
                          <Th>وزن کل</Th>
                          <Th>برش</Th>
                          <Th>باقی‌مانده</Th>
                          <Th>وضعیت</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredOrders.map((order) => {
                          const orderInvoices = allInvoices.filter(
                            (inv) => inv.orderId === order.id
                          );
                          const cutWeight = orderInvoices.reduce(
                            (sum, inv) => sum + (inv.totalWeightInvoices || 0),
                            0
                          );
                          const remaining = Math.round(
                            (order.totalWeight || 0) - cutWeight
                          );

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-slate-800/30 transition"
                            >
                              <Td className="text-slate-500 text-xs">
                                {new Date(order.date).toLocaleDateString('fa-IR')}
                              </Td>
                              <Td className="font-mono text-blue-400 font-semibold">
                                {order.orderNumber}
                              </Td>
                              <Td className="text-white font-medium">
                                {order.customerName}
                              </Td>
                              <Td className="text-slate-300">
                                {order.productType}
                              </Td>
                              <Td className="text-slate-400">{order.brand}</Td>
                              <Td className="text-white font-semibold">
                                {Math.round(order.totalWeight)} kg
                              </Td>
                              <Td className="text-red-400 font-semibold">
                                {Math.round(cutWeight)} kg
                              </Td>
                              <Td className="text-emerald-400 font-semibold">
                                {remaining} kg
                              </Td>
                              <Td>
                                <StatusBadge status={order.status} />
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          گروه فولادیار کوروش © ۱۴۰۵ — پنل مدیریت
        </p>
      </main>
    </div>
  );
}

// ============ کامپوننت‌های کمکی ============

function StatCard({ icon: Icon, label, value, color, shadow }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg ${shadow}`}
        >
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
  return (
    <td className={`px-4 py-3 text-sm whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'باز': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    'خارج شده': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'صورت‌برش شده': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    'صورت برش شده': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    'تکمیل شده': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };
  const style = styles[status] || 'bg-slate-700/30 border-slate-600 text-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}
    >
      <CheckCircle2 className="w-3 h-3" />
      {status}
    </span>
  );
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