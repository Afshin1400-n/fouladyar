// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../store/store';
import axios from 'axios';
import RefreshButton from '../component/refreshBtn';
import Header from '../component/header';
import StatCard from '../component/statCard';
import EmptyState from '../component/empty';

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
  totalWeight: number;
  cutWeight?: number;
  remainingWeight?: number;
}

interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  totalWeightInvoices: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalOrdersLength: 0,
    cutWeight: 0,
    remainingWeight: 0,
    totalOrdersWeight: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  });

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      const res = await axios.get('http://localhost:4000/orders');
      const allOrders: Order[] = res.data;
      const userOrders = allOrders.filter((o) => o.customerId === currentUser.id);

      const resInvoice = await axios.get('http://localhost:4000/invoice');
      const allInvoice: Invoice[] = resInvoice.data;
      const userInvoice = allInvoice.filter((o) => o.customerId === currentUser.id);

      setInvoices(userInvoice);

      // Calculate cut weight and remaining weight per order
      const ordersWithCutWeight = userOrders.map((order) => {
        const orderInvoices = userInvoice.filter((inv) => inv.orderId === order.id);
        const totalCutWeight = orderInvoices.reduce(
          (sum, inv) => sum + (inv.totalWeightInvoices || 0),
          0
        );

        const remainingWeight = Math.round((order.totalWeight || 0) - totalCutWeight);

        return {
          ...order,
          cutWeight: Math.round(totalCutWeight),
          remainingWeight,
        };
      });

      // Auto-complete orders with no remaining weight
      const finalOrders = ordersWithCutWeight.map((order) => {
        if (order.remainingWeight <= 0) {
          return { ...order, status: 'Completed' };
        }
        return order;
      });

      setOrders(finalOrders);
      setFilteredOrders(finalOrders);

      // Stats
      const totalOrdersLength = finalOrders.length;
      const totalOrdersWeight = finalOrders.reduce(
        (sum, order) => sum + (order.totalWeight || 0),
        0
      );
      const totalInvoiceWeight = userInvoice.reduce(
        (sum, inv) => sum + (inv.totalWeightInvoices || 0),
        0
      );
      const remainingWeight = totalOrdersWeight - totalInvoiceWeight;

      const pendingOrders = finalOrders.filter((o) => o.status === 'Open').length;
      const shippedOrders = finalOrders.filter(
        (o) => o.status === 'Shipped' || o.status === 'Cut'
      ).length;

      setStats({
        totalOrdersLength,
        cutWeight: Math.round(totalInvoiceWeight),
        remainingWeight: Math.round(remainingWeight),
        totalOrdersWeight: Math.round(totalOrdersWeight),
        pendingOrders,
        shippedOrders,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchOrders();
    }
  }, [isAuthenticated, currentUser]);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          order.orderNumber?.includes(searchTerm) ||
          order.status?.includes(searchTerm) ||
          order.productType?.includes(searchTerm) ||
          order.brand?.includes(searchTerm)
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Shipped':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Cut':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Orders" value={stats.totalOrdersLength} color="blue" />
            <StatCard
              label="Total Orders Weight"
              value={stats.totalOrdersWeight}
              suffix="kg"
              color="blue"
            />
            <StatCard label="Cut Weight" value={stats.cutWeight} suffix="kg" color="red" />
            <StatCard
              label="Remaining Weight"
              value={stats.remainingWeight}
              suffix="kg"
              color="green"
            />
            <StatCard label="Pending" value={stats.pendingOrders} color="amber" />
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order #, product type, brand, status..."
              className="w-full px-6 py-4 pr-12 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition shadow-sm hover:shadow-md bg-white placeholder:text-slate-400"
            />
            <svg
              className="absolute right-4 top-4 w-6 h-6 text-slate-400"
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

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-900">📋 Orders</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {filteredOrders.length} items
              </span>
              <Link
                href="/invoices"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                View Cutting Invoices
              </Link>
              <RefreshButton
                onRefresh={fetchOrders}
                className="bg-slate-800 hover:bg-slate-600 text-slate-300 border border-slate-700"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No orders registered"
              action={
                <Link
                  href="/orders/new"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Create first order
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Thickness</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Width</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Total Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Cut Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Remaining</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(order.date).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-bold">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.productType}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.brand}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.thickness}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.width}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-bold">
                        {Math.round(order.totalWeight)} kg
                      </td>
                      <td className="px-4 py-3 text-sm text-red-500 font-bold">
                        {order.cutWeight} kg
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-bold">
                        {order.remainingWeight} kg
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/invoice/${order.orderNumber}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          Cutting Invoice
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