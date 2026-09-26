// app/invoice/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import useStore from '../../store/store';
import Header from '../../component/header';

// ============ Types ============
interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: string;
  productType: string;
  brand: string;
  thickness: number;
  width: number;
  length?: number;
  quantity?: number;
  totalWeight: number;
  cutWeight: number;
  remainingWeight: number;
}

interface InvoiceRow {
  id: number;
  length: string;
  width: string;
  thickness: string;
  quantity: string;
  bundle: string;
  cutType: string;
}

// ============ Cut Types ============
const CUT_TYPES = [
  { id: 'flat_thick', label: 'Flat Sheet - Thick' },
  { id: 'flat_thin', label: 'Flat Sheet - Thin' },
  { id: 'shutter_b', label: 'Shutter Type B' },
  { id: 'shutter_small', label: 'Small Shutter' },
  { id: 'trapezoidal', label: 'Trapezoidal' },
  { id: 'corrugated', label: 'Corrugated' },
  { id: 'perforated', label: 'Perforated' },
  { id: 'custom', label: 'Custom' },
];

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingWeight, setRemainingWeight] = useState(0);
  const [notes, setNotes] = useState('');

  const [rows, setRows] = useState<InvoiceRow[]>([
    { id: 1, length: '', width: '', thickness: '', quantity: '', bundle: '', cutType: '' },
  ]);

  // ============ Route Protection ============
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // ============ Fetch Order ============
  const fetchOrder = async () => {
    try {
      const id = params.id as string;

      const allOrdersRes = await axios.get('http://localhost:4000/orders');
      const allOrders: Order[] = allOrdersRes.data;
      const foundOrder = allOrders.find((o) => o.orderNumber === id);

      if (foundOrder) {
        setOrder(foundOrder);

        const invoiceRes = await axios.get(
          `http://localhost:4000/invoice?orderId=${foundOrder.id}`
        );
        const orderInvoices = invoiceRes.data;

        const totalCutWeight = orderInvoices.reduce(
          (sum: number, inv: any) => sum + (inv.totalWeightInvoices || 0),
          0
        );
        const remaining = Math.round((foundOrder.totalWeight || 0) - totalCutWeight);

        setRemainingWeight(remaining);

        setRows([
          {
            id: 1,
            length: foundOrder.length?.toString() || '',
            width: foundOrder.width?.toString() || '',
            thickness: foundOrder.thickness?.toString() || '',
            quantity: foundOrder.quantity?.toString() || '',
            bundle: '',
            cutType: '',
          },
        ]);
      } else {
        setOrder(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isAuthenticated]);

  // ============ Calculations ============
  const calculateRowWeight = (row: InvoiceRow): number => {
    const length = parseFloat(row.length) || 0;
    const width = parseFloat(row.width) || 0;
    const thickness = parseFloat(row.thickness) || 0;
    const quantity = parseFloat(row.quantity) || 0;

    const DENSITY = 7.85; // Steel density (kg/dm³)
    return Math.round(length * width * thickness * DENSITY * quantity);
  };

  const calculateTotalWeight = (): number => {
    return rows.reduce((sum, row) => sum + calculateRowWeight(row), 0);
  };

  const calculateTotalBundle = (): number => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.bundle) || 0), 0);
  };

  // ============ Row Management ============
  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([
      ...rows,
      {
        id: newId,
        length: order?.length?.toString() || '',
        width: order?.width?.toString() || '',
        thickness: order?.thickness?.toString() || '',
        quantity: '',
        bundle: '',
        cutType: '',
      },
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) {
      alert('At least one row is required');
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: number, field: keyof InvoiceRow, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  // ============ Handlers ============
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const totalWeightInvoices = calculateTotalWeight();
      const totalBundle = calculateTotalBundle();

      // Validations
      if (remainingWeight <= 0) {
        alert('Weight must be greater than zero');
        setSubmitting(false);
        return;
      }

      if (totalWeightInvoices <= 0) {
        alert('Weight must be greater than zero');
        setSubmitting(false);
        return;
      }

      if (totalBundle < 1) {
        alert('Total bundles must be at least 1');
        setSubmitting(false);
        return;
      }

      if (totalWeightInvoices > remainingWeight) {
        alert(
          `Entered weight (${totalWeightInvoices} kg) exceeds remaining weight (${remainingWeight} kg)!`
        );
        setSubmitting(false);
        return;
      }

      // Build invoice items
      const invoiceItems = rows.map((row, index) => {
        const rowWeight = calculateRowWeight(row);
        return {
          row: index + 1,
          productType: order!.productType,
          brand: order!.brand,
          thickness: row.thickness || order!.thickness,
          width: row.width || order!.width,
          length: row.length,
          quantity: row.quantity,
          bundle: row.bundle,
          weight: rowWeight,
          cutType: row.cutType || 'standard',
        };
      });

      // Create invoice payload
      const invoicePayload = {
        id: `INV-${Date.now()}`,
        orderId: order!.id,
        orderNumber: order!.orderNumber,
        customerId: order!.customerId,
        customerName: order!.customerName,
        date: new Date().toISOString(),
        status: 'Cut Issued',
        items: invoiceItems,
        totalItems: invoiceItems.length,
        totalWeightInvoices,
        notes: notes.trim() || null,
        createdAt: new Date().toISOString(),
      };

      await axios.post('http://localhost:4000/invoice', invoicePayload);

      // Update order
      const currentOrder = await axios.get(`http://localhost:4000/orders/${order!.id}`);
      const currentCutWeight = currentOrder.data.cutWeight || 0;

      const newCutWeight = Math.round(currentCutWeight + totalWeightInvoices);
      const newRemainingWeight = Math.round((order!.totalWeight || 0) - newCutWeight);

      // Determine new status
      let newStatus = order!.status;
      if (newRemainingWeight <= 0) {
        newStatus = 'Completed';
      } else if (newRemainingWeight < order!.totalWeight) {
        newStatus = 'Cut';
      }

      const updatedOrder = await axios.patch(`http://localhost:4000/orders/${order!.id}`, {
        status: newStatus,
        cutWeight: newCutWeight,
        remainingWeight: newRemainingWeight,
        invoiceIssued: true,
        invoiceNumber: invoicePayload.id,
        invoiceDate: new Date().toISOString(),
      });

      // Reset form
      setOrder(updatedOrder.data);
      setRemainingWeight(newRemainingWeight);

      setRows([
        {
          id: 1,
          length: order!.length?.toString() || '',
          width: order!.width?.toString() || '',
          thickness: order!.thickness?.toString() || '',
          quantity: '',
          bundle: '',
          cutType: '',
        },
      ]);

      setNotes('');
      setSubmitting(false);
      setShowModal(false);

      // Success message
      if (newRemainingWeight <= 0) {
        alert('Cutting invoice saved successfully and order completed!');
      } else {
        alert(`Cutting invoice saved successfully! Remaining weight: ${newRemainingWeight} kg`);
      }

      // Refresh the order data
      await fetchOrder();

    } catch (error: any) {
      console.error('Error submitting invoice:', error);

      if (error.response) {
        alert(`Error: ${error.response.data || 'Server error'}`);
      } else if (error.request) {
        alert('Server connection error');
      } else {
        alert(`Error: ${error.message}`);
      }

      setSubmitting(false);
    }
  };

  // ============ Guards ============
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
          <p className="text-red-500 text-lg">No order found with this number</p>
          <p className="text-slate-500 text-sm mt-2">ID: {params.id}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
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
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Cutting Invoice</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Order #: <span className="text-blue-600 font-semibold">{order.orderNumber}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(order.date).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
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

          {/* Weight Summary */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <p className="text-sm text-slate-500">Total Order Weight</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(order.totalWeight)} kg
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-sm text-red-600">Cut Weight</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(order.cutWeight || 0)} kg
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p className="text-sm text-green-600">Remaining Weight</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(remainingWeight)} kg
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="border-t border-slate-200 pt-6 mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowModal(true)}
              disabled={remainingWeight <= 0}
              className={`px-8 py-3 font-semibold rounded-xl transition cursor-pointer ${
                remainingWeight <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {remainingWeight <= 0 ? 'Completed' : 'Create Cutting Invoice'}
            </button>
          </div>
        </div>
      </main>

      {/* ============ Modal ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Create Cutting Invoice</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Available Weight */}
            <div className="mb-4 p-4 bg-green-50 rounded-xl text-center border border-green-200">
              <p className="text-sm text-slate-500">Available weight to cut</p>
              <p className="text-2xl font-bold text-green-600">{remainingWeight} kg</p>
              <p className="text-sm text-slate-500 mt-1">
                Selected total weight:{' '}
                <span className="text-blue-600 font-bold">{totalWeightInvoices} kg</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Total bundles: <span className="text-blue-600 font-bold">{totalBundle}</span>
              </p>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              {/* Table */}
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
                          <td className="px-3 py-2 text-center text-sm text-blue-600 font-bold">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.cutType}
                              onChange={(e) => updateRow(row.id, 'cutType', e.target.value)}
                              className="w-full px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-900"
                              required
                            >
                              <option value="">Select...</option>
                              {CUT_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.label}
                                </option>
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
                              readOnly
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg outline-none text-slate-500 text-center bg-slate-50 cursor-not-allowed"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={row.thickness}
                              readOnly
                              className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-slate-100 text-slate-500 cursor-not-allowed text-center"
                            />
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-blue-600">
                            {rowWeight}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
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

              {/* Add Row */}
              <button
                type="button"
                onClick={addRow}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition border border-dashed border-blue-300 cursor-pointer"
              >
                + Add New Row
              </button>

              {/* Notes */}
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

              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-sm text-slate-500">Selected Total Weight</p>
                <p className="text-2xl font-bold text-blue-600">{totalWeightInvoices} kg</p>
                <p className="text-sm text-slate-500 mt-1">
                  Total bundles: <span className="text-blue-600 font-bold">{totalBundle}</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    totalWeightInvoices <= 0 ||
                    totalWeightInvoices > remainingWeight ||
                    totalBundle < 1
                  }
                  className={`flex-1 py-3 font-semibold rounded-lg transition cursor-pointer ${
                    submitting ||
                    totalWeightInvoices <= 0 ||
                    totalWeightInvoices > remainingWeight ||
                    totalBundle < 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Save Cutting Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Validation Messages */}
              {totalWeightInvoices > remainingWeight && (
                <p className="text-red-500 text-sm text-center">
                  Total weight ({totalWeightInvoices} kg) exceeds remaining weight ({remainingWeight} kg)!
                </p>
              )}
              {totalWeightInvoices <= 0 && (
                <p className="text-amber-500 text-sm text-center">
                  Please enter at least one row with weight greater than zero
                </p>
              )}
              {totalBundle < 1 && totalWeightInvoices > 0 && (
                <p className="text-red-500 text-sm text-center">
                  Total bundles must be at least 1 (current: {totalBundle})
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}