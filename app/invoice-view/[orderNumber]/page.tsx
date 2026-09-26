// app/invoice-view/[orderNumber]/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store/store';
import axios from 'axios';
import Header from '../../component/header';

// ============ Types ============
interface InvoiceItem {
  row: number;
  productType: string;
  brand: string;
  thickness: number;
  width: number;
  length: string;
  quantity: string;
  bundle: string;
  weight: number;
  cutType: string;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  status: string;
  items: InvoiceItem[];
  totalItems: number;
  totalWeightInvoices: number;
  notes?: string | null;
  createdAt?: string;
  finalizedAt?: string;
}

// ============ Cut Type Labels ============
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

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch invoice
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderNumber = params.orderNumber as string;

        const res = await axios.get('http://localhost:4000/invoice');
        const allInvoices: Invoice[] = res.data;

        const foundInvoice = allInvoices.find((inv) => inv.orderNumber === orderNumber);
        setInvoice(foundInvoice || null);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice:', error);
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

  const getCutTypeLabel = (cutTypeId: string) => {
    if (!cutTypeId) return '---';
    const found = CUT_TYPES.find((c) => c.id === cutTypeId);
    return found ? found.label : cutTypeId;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cut':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Finalized':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cut Issued':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Guards
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

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 text-lg">No invoice found for this order number</p>
          <p className="text-slate-500 text-sm mt-2">Order #: {params.orderNumber}</p>
          <Link
            href="/invoices"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none">

          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-blue-600">Cutting Invoice</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Invoice #:{' '}
                  <span className="text-blue-600 font-medium">
                    {invoice.invoiceNumber || invoice.id}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Date</p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(invoice.date).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-sm text-slate-500">Customer Name</p>
                <p className="font-bold text-blue-600">{invoice.customerName || '---'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-sm text-slate-500">Order #</p>
                <p className="font-bold text-blue-600">{invoice.orderNumber || '---'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-sm text-slate-500">Type</p>
                <p className="font-bold text-blue-600">
                  {invoice.items?.[0]?.productType || '---'}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-sm text-slate-500">Brand</p>
                <p className="font-bold text-blue-600">
                  {invoice.items?.[0]?.brand || '---'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                Invoice Items
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">#</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Cut Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Length</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Width</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Thickness</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Bundle</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-500">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 text-center text-sm text-blue-600">{item.row}</td>
                        <td className="px-4 py-2 text-sm text-slate-900">
                          {getCutTypeLabel(item.cutType)}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-slate-900">{item.length} m</td>
                        <td className="px-4 py-2 text-sm text-slate-900">{item.width} m</td>
                        <td className="px-4 py-2 text-sm text-slate-900">{item.thickness} mm</td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">
                          {item.bundle || 0}
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">
                          {item.weight} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-bold text-slate-900">
                        Total
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-blue-600">
                        {invoice.totalWeightInvoices} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800 mb-1">Notes</p>
              <p className="text-sm text-amber-700">{invoice.notes}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
            <span className="text-sm text-slate-500">Status:</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
            <span className="text-sm text-slate-400">
              Created: {new Date(invoice.createdAt || invoice.date).toLocaleString('en-US')}
            </span>
          </div>

          {/* Print Button */}
          <div className="flex justify-end mt-6 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}