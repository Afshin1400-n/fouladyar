// src/app/invoice-view/[orderNumber]/page.js

"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store/store';
import axios from 'axios';

const cutTypes = [
  { id: 'flat_thick', label: 'صاف ضخیم' },
  { id: 'flat_thin', label: 'صاف نازک' },
  { id: 'shutter_b', label: 'کرکره نوع B' },
  { id: 'shutter_small', label: 'کرکره ریز' },
  { id: 'trapezoidal', label: 'ذوزنقه' },
  { id: 'corrugated', label: 'موجدار' },
  { id: 'perforated', label: 'سوراخدار' },
  { id: 'custom', label: 'سفارشی' },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderNumber = params.orderNumber;
        
        // گرفتن همه invoice ها
        const res = await axios.get('http://localhost:4000/invoice');
        const allInvoices = res.data;
        
        // پیدا کردن با orderNumber
        const foundInvoice = allInvoices.find((inv) => inv.orderNumber === orderNumber);
        setInvoice(foundInvoice);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [params.orderNumber, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePrint = () => {
    window.print();
  };

  const getCutTypeLabel = (cutTypeId) => {
    if (!cutTypeId) return '---';
    const found = cutTypes.find(c => c.id === cutTypeId);
    return found ? found.label : cutTypeId;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-lg">❌ صورت‌برشی با این شماره حواله یافت نشد</p>
          <p className="text-gray-500 text-sm mt-2">شماره حواله: {params.orderNumber}</p>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            بازگشت به لیست صورت‌برش‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95 print:shadow-none print:border-none">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              ف
            </div>
            <h1 className="text-2xl font-bold text-gray-900">گروه فولادیار کوروش</h1>
          </div>
          <div className="flex items-center gap-4 print:hidden">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <span className="text-blue-600 text-sm font-medium hidden sm:inline">
                {currentUser?.name}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser?.name?.charAt(0) || 'م'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow-md"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 print:shadow-none print:border-none">
          <div className="flex justify-end mb-6 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🖨️ چاپ
            </button>
          </div>

          <div className="border-b-2 border-blue-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-blue-600">صورت‌برش</h2>
                <p className="text-sm text-gray-500 mt-1">شماره صورت‌برش: <span className="text-blue-600 font-medium">{invoice.invoiceNumber || invoice.id}</span></p>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">تاریخ</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(invoice.date).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 rounded-xl p-6">
            <div>
              <p className="text-sm text-gray-500">نام مشتری</p>
              <p className="text-lg font-bold text-gray-900">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">شماره حواله</p>
              <p className="text-lg font-bold text-blue-600">{invoice.orderNumber}</p>
            </div>
          </div>

          {/* مشخصات فنی */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">مشخصات فنی</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">نوع محصول</p>
                <p className="font-bold text-blue-600">{invoice.productType || '---'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">برند</p>
                <p className="font-bold text-blue-600">{invoice.brand || '---'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">واحد</p>
                <p className="font-bold text-blue-600">{invoice.unit || '---'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">نوع برش</p>
                <p className="font-bold text-blue-600">{getCutTypeLabel(invoice.cutType)}</p>
              </div>
            </div>
          </div>

          {/* آیتم‌های صورت‌برش */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">آیتم‌های صورت‌برش</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">ردیف</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">نوع برش</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">تعداد</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">طول</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">عرض</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">ضخامت</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">وزن</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">قیمت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30">
                        <td className="px-4 py-2 text-center text-sm text-blue-600">{item.row}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{getCutTypeLabel(item.cutType)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.length} m</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.width} m</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.thickness} mm</td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">{item.weight} kg</td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">{item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="6" className="px-4 py-2 text-left font-bold text-gray-900">جمع کل</td>
                      <td className="px-4 py-2 text-center font-bold text-blue-600">{invoice.totalWeight} kg</td>
                      <td className="px-4 py-2 text-center font-bold text-green-600">{invoice.totalPrice.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* خلاصه قیمت */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">خلاصه قیمت</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">وزن کل</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(invoice.totalWeight || 0)} kg</p>
                </div>
                <div className="border-t border-gray-200 pt-4 col-span-2">
                  <p className="text-sm text-gray-500">قیمت کل</p>
                  <p className="text-3xl font-bold text-green-600">{invoice.totalPrice?.toLocaleString() || 0} ریال</p>
                </div>
              </div>
            </div>
          </div>

          {/* وضعیت */}
          <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
            <span className="text-sm text-gray-500">وضعیت:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              invoice.status === 'صورت‌برش شده' ? 'bg-green-100 text-green-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {invoice.status || 'ثبت شده'}
            </span>
            <span className="text-sm text-gray-400">
              تاریخ ثبت: {new Date(invoice.createdAt).toLocaleString('fa-IR')}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}