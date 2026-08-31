// src/app/invoice/[id]/page.js

"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store/store';
import axios from 'axios';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    length: '',
    width: '',
    thickness: '',
    quantity: '',
    bundle: '',
    weight: 0
  });
  const [remainingWeight, setRemainingWeight] = useState(0);
  const [totalInvoiceWeight, setTotalInvoiceWeight] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = params.id;
        console.log('🔍 ID from URL:', id);
        
        try {
          const res = await axios.get(`http://localhost:4000/orders/${id}`);
          console.log('✅ Found by ID:', res.data);
          setOrder(res.data);
          
          if (res.data) {
            // گرفتن صورت‌برش‌های این حواله
            const invoiceRes = await axios.get(`http://localhost:4000/invoice?orderId=${res.data.id}`);
            const orderInvoices = invoiceRes.data;
            const totalInvoiceWeight = orderInvoices.reduce((sum, inv) => sum + (inv.weight || 0), 0);
            
            setTotalInvoiceWeight(totalInvoiceWeight);
            setRemainingWeight((res.data.totalWeight || 0) - totalInvoiceWeight);
            
            setInvoiceData({
              length: res.data.length || '',
              width: res.data.width || '',
              thickness: res.data.thickness || '',
              quantity: res.data.quantity || '',
              bundle: '',
              weight: 0
            });
          }
          
          setLoading(false);
          return;
        } catch (idError) {
          console.log('❌ Not found by ID, trying orderNumber...');
        }
        
        const allOrdersRes = await axios.get('http://localhost:4000/orders');
        const allOrders = allOrdersRes.data;
        const foundOrder = allOrders.find((o) => o.orderNumber === id);
        
        if (foundOrder) {
          console.log('✅ Found by orderNumber:', foundOrder);
          setOrder(foundOrder);
          
          // گرفتن صورت‌برش‌های این حواله
          const invoiceRes = await axios.get(`http://localhost:4000/invoice?orderId=${foundOrder.id}`);
          const orderInvoices = invoiceRes.data;
          const totalInvoiceWeight = orderInvoices.reduce((sum, inv) => sum + (inv.weight || 0), 0);
          
          setTotalInvoiceWeight(totalInvoiceWeight);
          setRemainingWeight((foundOrder.totalWeight || 0) - totalInvoiceWeight);
          
          setInvoiceData({
            length: foundOrder.length || '',
            width: foundOrder.width || '',
            thickness: foundOrder.thickness || '',
            quantity: foundOrder.quantity || '',
            bundle: '',
            weight: 0
          });
        } else {
          console.log('❌ Order not found by ID or orderNumber');
          setOrder(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrder();
    }
  }, [params.id, isAuthenticated]);

  // محاسبه وزن
  useEffect(() => {
    const length = parseFloat(invoiceData.length) || 0;
    const width = parseFloat(invoiceData.width) || 0;
    const thickness = parseFloat(invoiceData.thickness) || 0;
    const quantity = parseFloat(invoiceData.quantity) || 0;
    
    const density = 7.85;
    const calculatedWeight = (length * width * thickness * density * quantity);
    
    setInvoiceData(prev => ({
      ...prev,
      weight: calculatedWeight
    }));
  }, [invoiceData.length, invoiceData.width, invoiceData.thickness, invoiceData.quantity]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newWeight = parseFloat(invoiceData.weight) || 0;
      const unitPrice = parseFloat(order.unitPrice) || 0;
      const newPrice = newWeight * unitPrice;

      if (newWeight <= 0) {
        alert('❌ وزن باید بزرگتر از صفر باشد');
        setSubmitting(false);
        return;
      }

      if (newWeight > remainingWeight) {
        alert(`❌ وزن وارد شده (${newWeight} kg) از وزن باقی‌مانده (${remainingWeight.toFixed(2)} kg) بیشتر است!`);
        setSubmitting(false);
        return;
      }

      const invoicePayload = {
        id: `INV-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        date: new Date().toISOString(),
        productType: order.productType,
        brand: order.brand,
        thickness: invoiceData.thickness || order.thickness,
        width: invoiceData.width || order.width,
        length: invoiceData.length || order.length,
        quantity: invoiceData.quantity || order.quantity,
        bundle: invoiceData.bundle || 0,
        weight: newWeight,
        unit: order.unit,
        unitPrice: unitPrice,
        totalPrice: newPrice,
        status: 'صورت‌برش شده',
        createdAt: new Date().toISOString()
      };

      await axios.post('http://localhost:4000/invoice', invoicePayload);

      const currentWeight = parseFloat(order.totalWeight) || 0;
      const currentPrice = parseFloat(order.totalPrice) || 0;
      
      const newRemainingWeight = remainingWeight - newWeight;
      const remainingPriceAfter = currentPrice - newPrice;

      // بروزرسانی حواله
      const updatedOrder = await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        status: newRemainingWeight <= 0 ? 'تکمیل شده' : order.status,
        totalWeight: newRemainingWeight > 0 ? newRemainingWeight : 0,
        totalPrice: remainingPriceAfter > 0 ? remainingPriceAfter : 0,
        finalPrice: remainingPriceAfter > 0 ? remainingPriceAfter : 0,
        invoiceIssued: true,
        invoiceNumber: invoicePayload.id,
        invoiceDate: new Date().toISOString()
      });

      // به‌روزرسانی state
      setOrder(updatedOrder.data);
      setRemainingWeight(newRemainingWeight > 0 ? newRemainingWeight : 0);
      setTotalInvoiceWeight(totalInvoiceWeight + newWeight);
      
      // ریست کردن فرم
      setInvoiceData({
        length: '',
        width: '',
        thickness: invoiceData.thickness || order.thickness,
        quantity: '',
        bundle: '',
        weight: 0
      });

      setSubmitting(false);
      setShowModal(false);
      
      if (newRemainingWeight <= 0) {
        alert('✅ صورت‌برش با موفقیت ثبت شد و حواله تکمیل گردید!');
      } else {
        alert(`✅ صورت‌برش با موفقیت ثبت شد! وزن باقی‌مانده: ${newRemainingWeight.toFixed(2)} kg`);
      }
      
      router.refresh();

    } catch (error) {
      console.error('Error submitting invoice:', error);
      
      if (error.response) {
        alert(`❌ خطا: ${error.response.data || 'مشکلی در سرور وجود دارد'}`);
      } else if (error.request) {
        alert('❌ خطا در ارتباط با سرور');
      } else {
        alert(`❌ خطا: ${error.message}`);
      }
      
      setSubmitting(false);
    }
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

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-lg">❌ حواله‌ای با این شماره یافت نشد</p>
          <p className="text-gray-500 text-sm mt-2">ID: {params.id}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              ف
            </div>
            <h1 className="text-2xl font-bold text-gray-900">گروه فولادیار کوروش</h1>
          </div>
          <div className="flex items-center gap-4">
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">صورت‌برش</h2>
                <p className="text-sm text-gray-500 mt-1">شماره حواله: {order.orderNumber}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">تاریخ</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.date).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">جزئیات حواله</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm text-gray-500">نوع محصول</p>
                <p className="font-medium text-gray-900">{order.productType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">برند</p>
                <p className="font-medium text-gray-900">{order.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">وزن کل</p>
                <p className="font-medium text-gray-900">{order.totalWeight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">واحد</p>
                <p className="font-medium text-gray-900">{order.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">عرض</p>
                <p className="font-medium text-gray-900">{order.width}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ضخامت</p>
                <p className="font-medium text-gray-900">{order.thickness}</p>
              </div>
            </div>
          </div>

          {/* نمایش وزن باقی‌مونده */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">وزن کل حواله</p>
                <p className="text-2xl font-bold text-gray-900">{order.totalWeight} kg</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">وزن باقی‌مانده قابل برش</p>
                <p className="text-2xl font-bold text-blue-600">{remainingWeight.toFixed(2)} kg</p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-400">مجموع وزن صورت‌برش‌های ثبت شده: {totalInvoiceWeight.toFixed(2)} kg</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">وضعیت:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'باز' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'خارج شده' ? 'bg-green-100 text-green-700' :
                order.status === 'صورت‌برش شده' || order.status === 'تکمیل شده' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {order.status}
              </span>
              {order.paid && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✓ پرداخت شده
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
            >
              🖨️ چاپ صورت‌برش
            </button>
            <button
              onClick={() => setShowModal(true)}
              disabled={remainingWeight <= 0}
              className={`px-8 py-3 font-semibold rounded-xl transition shadow-md hover:shadow-lg ${
                remainingWeight <= 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {remainingWeight <= 0 ? '✅ تکمیل شده' : '📝 ثبت صورت‌برش'}
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ثبت صورت‌برش</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">وزن باقی‌مانده قابل برش</p>
              <p className="text-lg font-bold text-blue-600">{remainingWeight.toFixed(2)} kg</p>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تعداد</label>
                  <input
                    type="number"
                    value={invoiceData.quantity}
                    onChange={(e) => setInvoiceData({...invoiceData, quantity: e.target.value})}
                    placeholder="تعداد"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تعداد بندل</label>
                  <input
                    type="number"
                    value={invoiceData.bundle}
                    onChange={(e) => setInvoiceData({...invoiceData, bundle: e.target.value})}
                    placeholder="تعداد بندل"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">طول (متر)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceData.length}
                    onChange={(e) => setInvoiceData({...invoiceData, length: e.target.value})}
                    placeholder="طول"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عرض (متر)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceData.width}
                    onChange={(e) => setInvoiceData({...invoiceData, width: e.target.value})}
                    placeholder="عرض"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ضخامت (میلی‌متر)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceData.thickness}
                    onChange={(e) => setInvoiceData({...invoiceData, thickness: e.target.value})}
                    placeholder="ضخامت"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وزن (کیلوگرم)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceData.weight.toFixed(2)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || invoiceData.weight <= 0 || invoiceData.weight > remainingWeight}
                  className={`flex-1 py-3 font-semibold rounded-lg transition ${
                    submitting || invoiceData.weight <= 0 || invoiceData.weight > remainingWeight
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitting ? 'در حال ثبت...' : 'ثبت صورت‌برش'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  انصراف
                </button>
              </div>
              {invoiceData.weight > remainingWeight && (
                <p className="text-red-500 text-sm text-center">
                  ⚠️ وزن وارد شده ({invoiceData.weight.toFixed(2)} kg) از وزن باقی‌مانده ({remainingWeight.toFixed(2)} kg) بیشتر است!
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}