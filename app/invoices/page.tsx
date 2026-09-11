// src/app/invoices/page.js

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../store/store';
import axios from 'axios';


export default function InvoicesPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalWeight: 0,
  });

  const fetchInvoices = async () => {
    if (!currentUser) return;
    
    try {
      const res = await axios.get('http://localhost:4000/invoice');
      const allInvoices = res.data;
      
      const userInvoices = allInvoices.filter((inv) => inv.customerId === currentUser.id);
      
      setInvoices(userInvoices);
      setFilteredInvoices(userInvoices);

      const totalInvoices = userInvoices.length;
      const totalWeight = userInvoices.reduce((sum, inv) => sum + (inv.totalWeight || 0), 0);

      setStats({
        totalInvoices,
        totalWeight: Math.round(totalWeight),
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('./login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchInvoices();
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter((invoice) =>
        invoice.orderNumber?.includes(searchTerm) ||
        invoice.productType?.includes(searchTerm) ||
        invoice.brand?.includes(searchTerm) ||
        invoice.customerName?.includes(searchTerm) ||
        invoice.invoiceNumber?.includes(searchTerm)
      );
      setFilteredInvoices(filtered);
    }
  }, [searchTerm, invoices]);

  const handleLogout = () => {
    logout();
    router.push('./login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              ف
            </div>
            <h1 className="text-2xl font-bold text-slate-900">گروه فولادیار کوروش</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition border border-blue-100"
              >
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUser?.name?.charAt(0) || 'م'}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.phone || 'شماره ثبت نشده'}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl shadow-slate-900/5 border border-slate-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">کد ملی: {currentUser?.nationalId}</p>
                    <p className="text-xs text-slate-500">تلفن: {currentUser?.phone || '---'}</p>
                    <p className="text-xs text-slate-500">آدرس: {currentUser?.address || '---'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-3 text-red-600 hover:bg-red-50 transition font-medium text-sm flex items-center gap-2"
                  >
                    <span>🚪</span>
                    خروج از حساب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 border border-slate-200 transition">
              <p className="text-sm text-slate-500">تعداد صورت‌برش‌ها</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalInvoices}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 border border-slate-200 transition">
              <p className="text-sm text-slate-500">وزن کل</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalWeight.toFixed(0)} kg</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 جستجو در شماره حواله، نوع محصول، برند، شماره صورت‌برش..."
              className="w-full px-6 py-4 pr-12 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition shadow-sm hover:shadow-md bg-white placeholder:text-slate-400"
            />
            <svg
              className="absolute left-4 top-4 w-6 h-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-900">📋 صورت‌برش‌ها</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {filteredInvoices.length} مورد
              </span>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                ← بازگشت به داشبورد
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">در حال بارگذاری...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-lg">
                {searchTerm ? '🔍 هیچ صورت‌برشی با این جستجو یافت نشد' : '📭 هیچ صورت‌برشی ثبت نشده است'}
              </p>
              {!searchTerm && (
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mt-3 inline-block font-medium">
                  ← بازگشت به داشبورد
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">شماره صورت‌برش</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">تاریخ ثبت برش</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">شماره حواله</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">تعداد ابعاد</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">وزن</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">توضیحات</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.slice(0, 20).map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-sm text-blue-600 font-bold">
                        {invoice.invoiceNumber || invoice.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(invoice.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-bold">
                        {invoice.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">{invoice.totalItems}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {Math.round(invoice.totalWeightInvoices || 0)} kg
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px]">
                        {invoice.notes ? (
                          <span className="block truncate" title={invoice.notes}>
                            📝 {invoice.notes}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">---</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/invoice-view/${invoice.orderNumber}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          مشاهده
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}