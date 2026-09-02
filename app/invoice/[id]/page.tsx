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
  const [remainingWeight, setRemainingWeight] = useState(0);
  const [totalInvoiceWeight, setTotalInvoiceWeight] = useState(0);
  
  const [rows, setRows] = useState([
    { id: 1, length: '', width: '', thickness: '', quantity: '', bundle: '', cutType: '' }
  ]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = params.id;
        
        try {
          const res = await axios.get(`http://localhost:4000/orders/${id}`);
          setOrder(res.data);
          
          if (res.data) {
            const invoiceRes = await axios.get(`http://localhost:4000/invoice?orderId=${res.data.id}`);
            const orderInvoices = invoiceRes.data;
            const totalInvoiceWeight = orderInvoices.reduce((sum, inv) => sum + (inv.weight || 0), 0);
            
            setTotalInvoiceWeight(Math.round(totalInvoiceWeight));
            setRemainingWeight(Math.round((res.data.totalWeight || 0) - totalInvoiceWeight));

            setRows([{
              id: 1,
              length: res.data.length || '',
              width: res.data.width || '',
              thickness: res.data.thickness || '',
              quantity: res.data.quantity || '',
              bundle: '',
              cutType: ''
            }]);
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
          setOrder(foundOrder);
          
          const invoiceRes = await axios.get(`http://localhost:4000/invoice?orderId=${foundOrder.id}`);
          const orderInvoices = invoiceRes.data;
          const totalInvoiceWeight = orderInvoices.reduce((sum, inv) => sum + (inv.weight || 0), 0);
          
          setTotalInvoiceWeight(Math.round(totalInvoiceWeight));
          setRemainingWeight(Math.round((foundOrder.totalWeight || 0) - totalInvoiceWeight));

          setRows([{
            id: 1,
            length: foundOrder.length || '',
            width: foundOrder.width || '',
            thickness: foundOrder.thickness || '',
            quantity: foundOrder.quantity || '',
            bundle: '',
            cutType: ''
          }]);
        } else {
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

  const calculateRowWeight = (row) => {
    const length = parseFloat(row.length) || 0;
    const width = parseFloat(row.width) || 0;
    const thickness = parseFloat(row.thickness) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    
    const density = 7.85;
    return Math.round(length * width * thickness * density * quantity);
  };

  const calculateTotalWeight = () => {
    return rows.reduce((sum, row) => sum + calculateRowWeight(row), 0);
  };

  // ✅ محاسبه مجموع بندل‌ها
  const calculateTotalBundle = () => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.bundle) || 0), 0);
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { 
      id: newId, 
      length: order?.length || '', 
      width: order?.width || '', 
      thickness: order?.thickness || '', 
      quantity: '', 
      bundle: '', 
      cutType: '' 
    }]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) {
      alert('حداقل یک ردیف باید وجود داشته باشد');
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const totalWeight = calculateTotalWeight();
      const totalBundle = calculateTotalBundle();
      
      if (totalWeight <= 0) {
        alert('❌ وزن کل باید بزرگتر از صفر باشد');
        setSubmitting(false);
        return;
      }

      // ✅ بررسی مجموع بندل‌ها
      if (totalBundle < 1) {
        alert('❌ مجموع بندل‌ها باید حداقل 1 باشد');
        setSubmitting(false);
        return;
      }

      if (totalWeight > remainingWeight) {
        alert(`❌ وزن کل (${totalWeight} kg) از وزن باقی‌مانده (${remainingWeight} kg) بیشتر است!`);
        setSubmitting(false);
        return;
      }

      for (const row of rows) {
        const rowWeight = calculateRowWeight(row);
        if (rowWeight <= 0) continue;
        
        const unitPrice = parseFloat(order.unitPrice) || 0;
        const newPrice = rowWeight * unitPrice;

        const invoicePayload = {
          id: `INV-${Date.now()}-${row.id}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerName: order.customerName,
          date: new Date().toISOString(),
          productType: order.productType,
          brand: order.brand,
          thickness: row.thickness || order.thickness,
          width: row.width || order.width,
          length: row.length || order.length,
          quantity: row.quantity || order.quantity,
          bundle: row.bundle || 0,
          weight: rowWeight,
          unit: order.unit,
          unitPrice: unitPrice,
          totalPrice: newPrice,
          cutType: row.cutType || 'standard',
          status: 'صورت‌برش شده',
          createdAt: new Date().toISOString()
        };

        await axios.post('http://localhost:4000/invoice', invoicePayload);
      }

      const newRemainingWeight = Math.round(remainingWeight - totalWeight);
      const currentPrice = parseFloat(order.totalPrice) || 0;
      const remainingPriceAfter = currentPrice - (totalWeight * parseFloat(order.unitPrice) || 0);

      await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        status: newRemainingWeight <= 0 ? 'تکمیل شده' : order.status,
        totalWeight: newRemainingWeight > 0 ? newRemainingWeight : 0,
        totalPrice: remainingPriceAfter > 0 ? remainingPriceAfter : 0,
        finalPrice: remainingPriceAfter > 0 ? remainingPriceAfter : 0,
        invoiceIssued: true,
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString()
      });

      setRemainingWeight(newRemainingWeight > 0 ? newRemainingWeight : 0);
      setTotalInvoiceWeight(Math.round(totalInvoiceWeight + totalWeight));
      
      setRows([{ 
        id: 1, 
        length: order.length || '', 
        width: order.width || '', 
        thickness: order.thickness || '', 
        quantity: '', 
        bundle: '', 
        cutType: '' 
      }]);

      setSubmitting(false);
      setShowModal(false);
      
      if (newRemainingWeight <= 0) {
        alert('✅ صورت‌برش با موفقیت ثبت شد و حواله تکمیل گردید!');
      } else {
        alert(`✅ صورت‌برش با موفقیت ثبت شد! وزن باقی‌مانده: ${newRemainingWeight} kg`);
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

  const totalWeight = calculateTotalWeight();
  const totalBundle = calculateTotalBundle();

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
                <h2 className="text-2xl font-bold text-blue-600">صورت‌برش</h2>
                <p className="text-sm text-gray-500 mt-1">شماره حواله: <span className="text-blue-600">{order.orderNumber}</span></p>
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
            <h3 className="text-lg font-bold text-blue-600 mb-4">جزئیات حواله</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm text-gray-500">نوع محصول</p>
                <p className="font-medium text-blue-600">{order.productType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">برند</p>
                <p className="font-medium text-blue-600">{order.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">وزن کل</p>
                <p className="font-medium text-blue-600">{Math.round(order.totalWeight)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">واحد</p>
                <p className="font-medium text-blue-600">{order.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">عرض</p>
                <p className="font-medium text-blue-600">{order.width}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ضخامت</p>
                <p className="font-medium text-blue-600">{order.thickness}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">وزن کل حواله</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(order.totalWeight)} kg</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">وزن باقی‌مانده قابل برش</p>
                <p className="text-2xl font-bold text-blue-600">{remainingWeight} kg</p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-400">مجموع وزن صورت‌برش‌های ثبت شده: {totalInvoiceWeight} kg</p>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">ثبت صورت‌برش</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">وزن باقی‌مانده قابل برش</p>
              <p className="text-lg font-bold text-blue-600">{remainingWeight} kg</p>
              <p className="text-sm text-gray-500 mt-1">وزن کل انتخاب شده: <span className="text-blue-600 font-bold">{totalWeight} kg</span></p>
              <p className="text-sm text-gray-500 mt-1">مجموع بندل‌ها: <span className="text-blue-600 font-bold">{totalBundle}</span></p>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-blue-50">
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[35px]">ردیف</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[150px]">نوع برش</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[55px]">تعداد</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[55px]">بندل</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[55px]">طول</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[55px]">عرض</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[55px]">ضخامت</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-blue-600 w-[60px]">وزن</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-blue-600 w-[40px]">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const rowWeight = calculateRowWeight(row);
                      return (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                          <td className="px-3 py-2 text-center text-sm text-blue-600 font-bold">{index + 1}</td>
                          <td className="px-3 py-2">
                            <select
                              value={row.cutType}
                              onChange={(e) => updateRow(row.id, 'cutType', e.target.value)}
                              className="w-full px-2 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600"
                              required
                            >
                              <option value="">انتخاب...</option>
                              {cutTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="1"
                              min={1}
                              value={row.quantity}
                              onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600 text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="1"
                              min={0}
                              value={row.bundle}
                              onChange={(e) => updateRow(row.id, 'bundle', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600 text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.length}
                              onChange={(e) => updateRow(row.id, 'length', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600 text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.width}
                              onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-blue-600 text-center bg-gray-50"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.thickness}
                              onChange={(e) => updateRow(row.id, 'thickness', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-not-allowed text-center"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-blue-600">
                            {rowWeight}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1 rounded hover:bg-red-50 transition"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addRow}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition border-2 border-dashed border-blue-300"
              >
                + اضافه کردن ردیف جدید
              </button>

              <div className="bg-blue-50 rounded-lg p-3 text-center border-2 border-blue-200">
                <p className="text-sm text-gray-500">وزن کل انتخاب شده</p>
                <p className="text-2xl font-bold text-blue-600">{totalWeight} kg</p>
                <p className="text-sm text-gray-500 mt-1">مجموع بندل‌ها: <span className="text-blue-600 font-bold">{totalBundle}</span></p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || totalWeight <= 0 || totalWeight > remainingWeight || totalBundle < 1}
                  className={`flex-1 py-3 font-semibold rounded-lg transition ${
                    submitting || totalWeight <= 0 || totalWeight > remainingWeight || totalBundle < 1
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
              {totalWeight > remainingWeight && (
                <p className="text-red-500 text-sm text-center">
                  ⚠️ وزن کل ({totalWeight} kg) از وزن باقی‌مانده ({remainingWeight} kg) بیشتر است!
                </p>
              )}
              {totalWeight <= 0 && (
                <p className="text-amber-500 text-sm text-center">
                  ⚠️ لطفاً حداقل یک ردیف با وزن بیشتر از صفر وارد کنید
                </p>
              )}
              {totalBundle < 1 && totalWeight > 0 && (
                <p className="text-red-500 text-sm text-center">
                  ⚠️ مجموع بندل‌ها باید حداقل 1 باشد (مقدار فعلی: {totalBundle})
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}