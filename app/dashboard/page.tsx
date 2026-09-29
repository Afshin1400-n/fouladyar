"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useStore from "../store/store";
import axios from "axios";
import RefreshButton from "../component/refreshBtn";

export default function DashboardPage() {
  const router = useRouter();

  const {
    currentUser,
    isAuthenticated,
    logout,
  } = useStore();

  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredOrders, setFilteredOrders] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const [stats, setStats] = useState({
    totalOrdersLength: 0,
    totalWeight: 0,
    cutWeight: 0,
    remainingWeight: 0,
    totalInvoiceWeight: 0,
    totalOrdersWeight: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  });

  // =========================================================
  // دریافت اطلاعات
  // =========================================================

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // =====================================================
      // دریافت حواله‌ها
      // =====================================================

      const res = await axios.get(
        "http://localhost:4000/orders"
      );

      const allOrders = res.data;

      const userOrders = allOrders.filter(
        (order) =>
          order.customerId === currentUser.id
      );

      // =====================================================
      // دریافت Invoiceها
      // =====================================================

      const resInvoice = await axios.get(
        "http://localhost:4000/invoice"
      );

      const allInvoice = resInvoice.data;

      const userInvoice =
        allInvoice.filter(
          (invoice) =>
            invoice.customerId ===
            currentUser.id
        );

      setInvoices(userInvoice);

      // =====================================================
      // محاسبه وزن هر حواله
      // =====================================================

      const ordersWithCutWeight =
        userOrders.map((order) => {

          // Invoiceهای همین حواله
          const orderInvoices =
            userInvoice.filter(
              (invoice) =>
                invoice.orderId === order.id
            );

          // مجموع واقعی تمام صورت‌برش‌ها
          const totalCutWeight = Math.round(
            orderInvoices.reduce(
              (sum, invoice) =>
                sum +
                (Number(
                  invoice.totalWeightInvoices
                ) || 0),
              0
            )
          );

          // وزن کل حواله
          const totalOrderWeight =
            Number(order.totalWeight) || 0;

          // وزن باقی مانده
          const remainingWeight = Math.max(
            0,
            Math.round(
              totalOrderWeight -
                totalCutWeight
            )
          );

          // =================================================
          // وضعیت
          // =================================================

          let finalStatus = order.status;

          if (
            remainingWeight === 0 &&
            totalOrderWeight > 0
          ) {
            finalStatus = "تکمیل شده";
          } else if (
            totalCutWeight > 0
          ) {
            finalStatus =
              "صورت‌برش شده";
          } else {
            finalStatus = "باز";
          }

          return {
            ...order,

            cutWeight:
              totalCutWeight,

            remainingWeight:
              remainingWeight,

            status:
              finalStatus,
          };
        });

      // =====================================================
      // ذخیره حواله‌ها
      // =====================================================

      setOrders(ordersWithCutWeight);

      setFilteredOrders(
        ordersWithCutWeight
      );

      // =====================================================
      // آمار کلی
      // =====================================================

      const totalOrdersLength =
        ordersWithCutWeight.length;

      const totalOrdersWeight =
        ordersWithCutWeight.reduce(
          (sum, order) =>
            sum +
            (Number(order.totalWeight) ||
              0),
          0
        );

      const totalInvoiceWeight =
        userInvoice.reduce(
          (sum, invoice) =>
            sum +
            (Number(
              invoice.totalWeightInvoices
            ) || 0),
          0
        );

      // وزن باقی‌مانده کل
      const remainingWeight = Math.max(
        0,
        Math.round(
          totalOrdersWeight -
            totalInvoiceWeight
        )
      );

      // حواله‌های باز
      const pendingOrders =
        ordersWithCutWeight.filter(
          (order) =>
            order.status === "باز"
        ).length;

      // حواله‌هایی که صورت‌برش دارند
      const shippedOrders =
        ordersWithCutWeight.filter(
          (order) =>
            order.status ===
              "خارج شده" ||
            order.status ===
              "صورت‌برش شده"
        ).length;

      // =====================================================
      // ذخیره Stats
      // =====================================================

      setStats({
        totalOrdersLength,

        totalWeight:
          remainingWeight,

        cutWeight:
          Math.round(
            totalInvoiceWeight
          ),

        remainingWeight:
          remainingWeight,

        pendingOrders,

        shippedOrders,

        totalInvoiceWeight:
          Math.round(
            totalInvoiceWeight
          ),

        totalOrdersWeight:
          Math.round(
            totalOrdersWeight
          ),
      });

      setLoading(false);
    } catch (error) {
      console.error(
        "❌ Error fetching orders:",
        error
      );

      setLoading(false);
    }
  };

  // =========================================================
  // Authentication
  // =========================================================

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // =========================================================
  // دریافت اطلاعات بعد از ورود
  // =========================================================

  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser
    ) {
      fetchOrders();
    }
  }, [
    isAuthenticated,
    currentUser,
  ]);

  // =========================================================
  // جستجو
  // =========================================================

  useEffect(() => {
    if (
      searchTerm.trim() === ""
    ) {
      setFilteredOrders(orders);
      return;
    }

    const search =
      searchTerm.trim();

    const filtered =
      orders.filter(
        (order) =>
          order.orderNumber
            ?.toString()
            .includes(search) ||

          order.status
            ?.includes(search) ||

          order.productType
            ?.includes(search) ||

          order.brand
            ?.includes(search)
      );

    setFilteredOrders(
      filtered
    );
  }, [
    searchTerm,
    orders,
  ]);

  // =========================================================
  // Logout
  // =========================================================

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // =========================================================
  // عدم احراز هویت
  // =========================================================

  if (!isAuthenticated) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      dir="rtl"
    >

      {/* HEADER */}

      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">

        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold text-gray-900">
              گروه فولادیار کوروش
            </h1>

          </div>

          <div className="flex items-center gap-4">

            <div className="relative">

              <button
                onClick={() =>
                  setShowUserMenu(
                    !showUserMenu
                  )
                }
                className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition"
              >

                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUser?.name?.charAt(
                    0
                  ) || "م"}
                </div>

                <div className="hidden sm:block text-right">

                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser?.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {currentUser?.phone ||
                      "شماره ثبت نشده"}
                  </p>

                </div>

                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserMenu
                      ? "rotate-180"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />

                </svg>

              </button>

              {showUserMenu && (

                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">

                  <div className="px-4 py-3 border-b border-gray-100">

                    <p className="text-sm font-bold text-gray-900">
                      {currentUser?.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      کد ملی:{" "}
                      {currentUser?.nationalId}
                    </p>

                    <p className="text-xs text-gray-500">
                      تلفن:{" "}
                      {currentUser?.phone ||
                        "---"}
                    </p>

                    <p className="text-xs text-gray-500">
                      آدرس:{" "}
                      {currentUser?.address ||
                        "---"}
                    </p>

                  </div>

                  <button
                    onClick={
                      handleLogout
                    }
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

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* STATS */}

        {loading ? (

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

            {[1, 2, 3, 4, 5].map(
              (i) => (

                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse"
                >

                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>

                  <div className="h-8 bg-gray-200 rounded w-16"></div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

            {/* TOTAL ORDERS */}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">

              <p className="text-sm text-gray-500">
                کل حواله‌ها
              </p>

              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalOrdersLength}
              </p>

            </div>

            {/* TOTAL WEIGHT */}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">

              <p className="text-sm text-gray-500">
                وزن کل حواله‌ها
              </p>

              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalOrdersWeight} kg
              </p>

            </div>

            {/* CUT WEIGHT */}

            <div className="bg-white rounded-xl shadow-md p-6 border border-red-200 hover:shadow-lg transition">

              <p className="text-sm text-red-600">
                وزن برش شده
              </p>

              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.totalInvoiceWeight} kg
              </p>

            </div>

            {/* REMAINING */}

            <div className="bg-white rounded-xl shadow-md p-6 border border-green-200 hover:shadow-lg transition">

              <p className="text-sm text-green-600">
                وزن باقی‌مانده
              </p>

              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.remainingWeight} kg
              </p>

            </div>

            {/* PENDING */}

            <div className="bg-white rounded-xl shadow-md p-6 border border-yellow-200 hover:shadow-lg transition">

              <p className="text-sm text-yellow-600">
                در انتظار
              </p>

              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pendingOrders}
              </p>

            </div>

          </div>

        )}

        {/* SEARCH */}

        <div className="mb-8">

          <div className="relative">

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="🔍 جستجو در شماره حواله، نوع محصول، برند، وضعیت..."
              className="w-full px-6 py-4 pr-12 border-2 border-gray-200 text-blue-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm hover:shadow-md bg-white"
            />

            <svg
              className="absolute left-4 top-4 w-6 h-6 text-gray-400"
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

        {/* ORDERS */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50">

            <h3 className="text-xl font-bold text-gray-900">
              📋 حواله‌ها
            </h3>

            <div className="flex items-center gap-4">

              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                {filteredOrders.length} مورد
              </span>

              <Link
                href="/invoices"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                صورت برش‌ها مشاهده
              </Link>

              <RefreshButton
                onRefresh={fetchOrders}
                className="bg-slate-800 hover:bg-slate-600 text-slate-300 border border-slate-700"
              />

            </div>

          </div>

          {loading ? (

            <div className="p-8 text-center text-gray-500">
              در حال بارگذاری...
            </div>

          ) : filteredOrders.length ===
            0 ? (

            <div className="p-12 text-center text-gray-500">

              <p className="text-lg">

                {searchTerm
                  ? "🔍 هیچ حواله‌ای با این جستجو یافت نشد"
                  : "📭 هیچ حواله‌ای ثبت نشده است"}

              </p>

              {!searchTerm && (

                <Link
                  href="/orders/new"
                  className="text-blue-600 hover:text-blue-700 text-sm mt-3 inline-block font-medium"
                >
                  + ثبت اولین حواله
                </Link>

              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50/80">

                  <tr>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      تاریخ
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      شماره حواله
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      نوع
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      برند
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      ضخامت
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      عرض
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      وزن کل
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      وزن برش
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      وزن باقی‌مونده
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      وضعیت
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      عملیات
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map(
                    (order) => (

                      <tr
                        key={order.id}
                        className="hover:bg-blue-50/50 transition"
                      >

                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(
                            order.date
                          ).toLocaleDateString(
                            "fa-IR"
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm text-blue-600 font-bold">
                          {order.orderNumber}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.productType}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.brand}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.thickness}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.width}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900 font-bold">
                          {Math.round(
                            Number(
                              order.totalWeight
                            ) || 0
                          )}{" "}
                          kg
                        </td>

                        <td className="px-4 py-3 text-sm text-red-500 font-bold">
                          {Math.round(
                            Number(
                              order.cutWeight
                            ) || 0
                          )}{" "}
                          kg
                        </td>

                        <td className="px-4 py-3 text-sm text-green-600 font-bold">
                          {Math.max(
                            0,
                            Math.round(
                              Number(
                                order.remainingWeight
                              ) || 0
                            )
                          )}{" "}
                          kg
                        </td>

                        <td className="px-4 py-3 text-sm">

                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status ===
                              "باز"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status ===
                                  "خارج شده"
                                ? "bg-green-100 text-green-700"
                                : order.status ===
                                  "صورت‌برش شده"
                                ? "bg-purple-100 text-purple-700"
                                : order.status ===
                                  "تکمیل شده"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>

                        </td>

                        <td className="px-4 py-3 text-sm">

                          <Link
                            href={`/invoice/${order.orderNumber}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            صورت‌برش
                          </Link>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}