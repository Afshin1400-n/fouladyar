// src/app/dashboard/page.js

"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../store/store';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalWeight: 0,
    totalPrice: 0,
    pendingOrders: 0,
    shippedOrders: 0
  });

  // چک کردن لاگین
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // گرفتن حواله‌ها
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      
      try {
        const res = await axios.get('http://localhost:4000/orders');
        const allOrders = res.data;
        
        // ✅ فیلتر کردن حواله‌های کاربر فعلی با customerId
        const userOrders = allOrders.filter((o) => o.customerId === currentUser.id);
        
        setOrders(userOrders);

        // محاسبه آمار
        const totalOrders = userOrders.length;
        const totalWeight = userOrders.reduce((sum, o) => sum + (o.totalWeight || 0), 0);
        const totalPrice = userOrders.reduce((sum, o) => sum + (o.finalPrice || 0), 0);
        const pendingOrders = userOrders.filter(o => o.status === 'باز').length;
        const shippedOrders = userOrders.filter(o => o.status === 'خارج شده' || o.status === 'صورت‌برش شده').length;

        setStats({
          totalOrders,
          totalWeight,
          totalPrice,
          pendingOrders,
          shippedOrders
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    if (isAuthenticated && currentUser) {
      fetchOrders();
    }
  }, [isAuthenticated, currentUser]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">گروه فولادیار کوروش</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm hidden md:inline">
              خوش آمدی {currentUser?.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            سلام {currentUser?.name} 👋
          </h2>
          <p className="text-gray-500 mt-1">به داشبورد مدیریت حواله خوش آمدید</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <p className="text-sm text-gray-500">کل حواله‌ها</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <p className="text-sm text-gray-500">وزن کل</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalWeight.toFixed(0)} kg</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <p className="text-sm text-gray-500">مبلغ کل</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-200">
              <p className="text-sm text-yellow-600">در انتظار</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-green-200">
              <p className="text-sm text-green-600">خارج شده</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.shippedOrders}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/orders/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
          >
            + ثبت حواله جدید
          </Link>
          <Link
            href="/customers"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
          >
            مدیریت مشتریان
          </Link>
          <Link
            href="/orders"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
          >
            مشاهده همه حواله‌ها
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">حواله‌های اخیر</h3>
            <Link href="/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              مشاهده همه
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>هیچ حواله‌ای ثبت نشده است</p>
              <Link href="/orders/new" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                ثبت اولین حواله
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">شماره حواله</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">مشتری</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">تاریخ</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">وزن</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">مبلغ</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">وضعیت</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.totalWeight} kg</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {order.finalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'باز' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'خارج شده' ? 'bg-green-100 text-green-700' :
                          order.status === 'صورت‌برش شده' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/invoice/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          صورت‌برش
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