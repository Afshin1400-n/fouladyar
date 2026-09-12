"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store/store';
import axios from 'axios';
import RefreshButton from '../../component/refreshBtn';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingWeight, setRemainingWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const { fetchAdminData } = useStore()

  const [rows, setRows] = useState([
    { id: 1, length: '', width: '', thickness: '', quantity: '', bundle: '', cutType: '' }
  ]);

  const cutTypes = [
    { id: 'flat_thick', label: 'Flat Sheet - Thick' },
    { id: 'flat_thin', label: 'Flat Sheet - Thin' },
    { id: 'shutter_b', label: 'Shutter Type B' },
    { id: 'shutter_small', label: 'Small Shutter' },
    { id: 'trapezoidal', label: 'Trapezoidal' },
    { id: 'corrugated', label: 'Corrugated' },
    { id: 'perforated', label: 'Perforated' },
    { id: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = params.id;

        const allOrdersRes = await axios.get('http://localhost:4000/orders');
        const allOrders = allOrdersRes.data;
        const foundOrder = allOrders.find((o) => o.orderNumber === id);

        if (foundOrder) {
          setOrder(foundOrder);

          const invoiceRes = await axios.get(`http://localhost:4000/invoice?orderId=${foundOrder.id}`);
          const orderInvoices = invoiceRes.data;

          const totalCutWeight = orderInvoices.reduce((sum, inv) => sum + (inv.totalWeightInvoices || 0), 0);
          const remaining = Math.round((foundOrder.totalWeight || 0) - totalCutWeight);

          setRemainingWeight(remaining);

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
      alert('At least one row is required');
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
      const totalWeightInvoices = calculateTotalWeight();
      const totalBundle = calculateTotalBundle();

      if (order.remainingWeight <= 0) {
        alert('❌ Weight must be greater than zero');
        setSubmitting(false);
        return;
      }

      if (totalWeightInvoices <= 0) {
        alert('❌ Weight must be greater than zero');
        setSubmitting(false);
        return;
      }

      if (totalBundle < 1) {
        alert('❌ Total bundles must be at least 1');
        setSubmitting(false);
        return;
      }

      if (totalWeightInvoices > order.remainingWeight) {
        alert(`❌ Entered weight (${totalWeightInvoices} kg) exceeds remaining weight (${order.remainingWeight} kg)!`);
        setSubmitting(false);
        return;
      }

      const invoiceItems = rows.map((row, index) => {
        const rowWeight = calculateRowWeight(row);
        return {
          row: index + 1,
          productType: order.productType,
          brand: order.brand,
          thickness: row.thickness || order.thickness,
          width: row.width || order.width,
          length: row.length,
          quantity: row.quantity,
          bundle: row.bundle,
          weight: rowWeight,
          cutType: row.cutType || 'standard'
        };
      });

      const invoicePayload = {
        id: `INV-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        date: new Date().toISOString(),
        status: 'ثبت صورت برش',
        items: invoiceItems,
        totalItems: invoiceItems.length,
        totalWeightInvoices: totalWeightInvoices,
        notes: notes.trim() || null,
        createdAt: new Date().toISOString()
      };

      await axios.post('http://localhost:4000/invoice', invoicePayload);

      const currentOrder = await axios.get(`http://localhost:4000/orders/${order.id}`);
      const currentCutWeight = currentOrder.data.cutWeight || 0;

      const newCutWeight = Math.round(currentCutWeight + totalWeightInvoices);
      const newRemainingWeight = Math.round((order.totalWeight || 0) - newCutWeight);

      let newStatus = order.status;
      if (newRemainingWeight < order.totalWeight) {
        newStatus = 'صورت برش شده';
      } else if (order.status === 'باز') {
        newStatus = 'باز';
      } else if (newRemainingWeight === 0) {
        newStatus = ' تکمیل شده';
      }

      const updatedOrder = await axios.patch(`http://localhost:4000/orders/${order.id}`, {
        status: newStatus,
        cutWeight: newCutWeight,
        remainingWeight: newRemainingWeight,
        invoiceIssued: true,
        invoiceNumber: invoicePayload.id,
        invoiceDate: new Date().toISOString()
      });

      setOrder(updatedOrder.data);
      setRemainingWeight(newRemainingWeight);

      setRows([{
        id: 1,
        length: order.length || '',
        width: order.width || '',
        thickness: order.thickness || '',
        quantity: '',
        bundle: '',
        cutType: ''
      }]);

      setNotes('');
      setSubmitting(false);
      setShowModal(false);

      if (newRemainingWeight <= 0) {
        alert('✅ Cutting invoice saved successfully and order completed!');
      } else {
        alert(`✅ Cutting invoice saved successfully! Remaining weight: ${newRemainingWeight} kg`);
      }

      router.refresh();

    } catch (error) {
      console.error('Error submitting invoice:', error);

      if (error.response) {
        alert(`❌ Error: ${error.response.data || 'Server error'}`);
      } else if (error.request) {
        alert('❌ Server connection error');
      } else {
        alert(`❌ Error: ${error.message}`);
      }

      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 text-lg">❌ No order found with this number</p>
          <p className="text-slate-500 text-sm mt-2">ID: {params.id}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalWeightInvoices = calculateTotalWeight();
  const totalBundle = calculateTotalBundle();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Fouladyar Kourosh Group</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <span className="text-blue-600 text-sm font-medium hidden sm:inline">
                {currentUser?.name}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="border-b border-slate-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Cutting Invoice</h2>
                <p className="text-sm text-slate-500 mt-1">Order #: <span className="text-blue-600 font-semibold">{order.orderNumber}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(order.date).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Product Type</p>
                <p className="font-medium text-slate-900">{order.productType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Brand</p>
                <p className="font-medium text-slate-900">{order.brand}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Width</p>
                <p className="font-medium text-slate-900">{order.width}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Thickness</p>
                <p className="font-medium text-slate-900">{order.thickness}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <p className="text-sm text-slate-500">Total Order Weight</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(order.totalWeight)} kg</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-sm text-red-600">Cut Weight</p>
                <p className="text-2xl font-bold text-red-600">{Math.round(order.cutWeight)} kg</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p className="text-sm text-green-600">Remaining Weight</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(order.remainingWeight)} kg</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowModal(true)}
              disabled={order.remainingWeight <= 0}
              className={`px-8 py-3 font-semibold rounded-xl transition ${
                order.remainingWeight <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {order.remainingWeight <= 0 ? '✅ Completed' : '📝 Create Cutting Invoice'}
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Create Cutting Invoice</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-green-50 rounded-xl text-center border border-green-200">
              <p className="text-sm text-slate-500">Available weight to cut</p>
              <p className="text-2xl font-bold text-green-600">{order.remainingWeight} kg</p>
              <p className="text-sm text-slate-500 mt-1">Selected total weight: <span className="text-blue-600 font-bold">{totalWeightInvoices} kg</span></p>
              <p className="text-sm text-slate-500 mt-1">Total bundles: <span className="text-blue-600 font-bold">{totalBundle}</span></p>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="overflow-x-auto max-h-[50vh] overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="bg-blue-50">
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[35px] border-b border-blue-100">#</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[150px] border-b border-blue-100">Cut Type</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[55px] border-b border-blue-100">Qty</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[55px] border-b border-blue-100">Length</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[55px] border-b border-blue-100">Bundle</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[55px] border-b border-blue-100">Width</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[55px] border-b border-blue-100">Thickness</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-blue-700 w-[60px] border-b border-blue-100">Weight</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-blue-700 w-[40px] border-b border-blue-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const rowWeight = calculateRowWeight(row);
                      return (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 text-center text-sm text-blue-600 font-bold">{index + 1}</td>
                          <td className="px-3 py-2">
                            <select
                              value={row.cutType}
                              onChange={(e) => updateRow(row.id, 'cutType', e.target.value)}
                              className="w-full px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900"
                              required
                            >
                              <option value="">Select...</option>
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
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900 text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min={0.25}
                              value={row.length}
                              onChange={(e) => updateRow(row.id, 'length', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900 text-center"
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
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900 text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.width}
                              onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg outline-none text-slate-500 text-center bg-slate-50 cursor-not-allowed"
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
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-slate-100 text-slate-500 cursor-not-allowed text-center"
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
                              className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition"
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
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition border border-dashed border-blue-300"
              >
                + Add New Row
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g.: project-specific cuts, technical notes, warehouse remarks..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900 resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-sm text-slate-500">Selected Total Weight</p>
                <p className="text-2xl font-bold text-blue-600">{totalWeightInvoices} kg</p>
                <p className="text-sm text-slate-500 mt-1">Total bundles: <span className="text-blue-600 font-bold">{totalBundle}</span></p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || totalWeightInvoices <= 0 || totalWeightInvoices > remainingWeight || totalBundle < 1}
                  className={`flex-1 py-3 font-semibold rounded-lg transition ${
                    submitting || totalWeightInvoices <= 0 || totalWeightInvoices > remainingWeight || totalBundle < 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Save Cutting Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition border border-slate-200"
                >
                  Cancel
                </button>
              </div>

              {totalWeightInvoices > remainingWeight && (
                <p className="text-red-500 text-sm text-center">
                  ⚠️ Total weight ({totalWeightInvoices} kg) exceeds remaining weight ({remainingWeight} kg)!
                </p>
              )}
              {totalWeightInvoices <= 0 && (
                <p className="text-amber-500 text-sm text-center">
                  ⚠️ Please enter at least one row with weight greater than zero
                </p>
              )}
              {totalBundle < 1 && totalWeightInvoices > 0 && (
                <p className="text-red-500 text-sm text-center">
                  ⚠️ Total bundles must be at least 1 (current: {totalBundle})
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}