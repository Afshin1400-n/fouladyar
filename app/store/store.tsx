// src/store/store.js

"use client"
import { create } from "zustand";
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const useStore = create((set, get) => ({
  // ==================== حالت اولیه ====================
  
  // کاربر عادی
  users: [],
  currentUser: null,
  isAuthenticated: false,

  // ادمین
  adminUser: null,
  isAdminAuthenticated: false,

  // دیتای ادمین
  allCustomers: [],
  allOrders: [],
  allInvoices: [],
  adminLoading: false,

  // عمومی
  loading: false,
  error: null,

  // ==================== کاربر عادی ====================

  // گرفتن همه کاربران
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/customers`);
      set({ users: res.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // لاگین کاربر عادی
  login: async (nationalId, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/customers`);
      const users = res.data;

      const user = users.find((u) => u.nationalId === nationalId);

      if (!user) {
        set({ loading: false });
        return { success: false, message: '❌ کاربری با این کد ملی یافت نشد' };
      }

      if (user.password !== password) {
        set({ loading: false });
        return { success: false, message: '❌ رمز عبور اشتباه است' };
      }

      set({
        currentUser: user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, message: '✅ ورود موفق' };

    } catch (error) {
      set({
        loading: false,
        error: 'خطا در ارتباط با سرور'
      });
      return { success: false, message: '❌ خطا در ارتباط با سرور' };
    }
  },

  // خروج کاربر عادی
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('user');
  },

  // تنظیم کاربر
  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: true });
  },

  // ==================== ادمین ====================

  // 🔐 لاگین ادمین
  adminLogin: async (nationalId, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/users`);
      const admins = res.data;

      // فقط کاربر با role === 'admin' مجاز هست
      const admin = admins.find(
        (u) => u.nationalId === nationalId && u.role === 'admin'
      );

      if (!admin) {
        set({ loading: false });
        return { success: false, message: '❌ ادمینی با این کد ملی یافت نشد' };
      }

      if (admin.password !== password) {
        set({ loading: false });
        return { success: false, message: '❌ رمز عبور اشتباه است' };
      }

      set({
        adminUser: admin,
        isAdminAuthenticated: true,
        loading: false,
        error: null
      });

      localStorage.setItem('admin', JSON.stringify(admin));

      return { success: true, message: '✅ ورود ادمین موفق' };

    } catch (error) {
      set({
        loading: false,
        error: 'خطا در ارتباط با سرور'
      });
      return { success: false, message: '❌ خطا در ارتباط با سرور' };
    }
  },

  // 🔐 خروج ادمین
  adminLogout: () => {
    set({
      adminUser: null,
      isAdminAuthenticated: false,
      allCustomers: [],
      allOrders: [],
      allInvoices: [],
    });
    localStorage.removeItem('admin');
  },

  // ==================== دیتای ادمین ====================

  // 📊 گرفتن همه دیتای سیستم (مشتری‌ها + حواله‌ها + صورت‌برش‌ها)
  fetchAdminData: async () => {
    set({ adminLoading: true });
    try {
      const [customersRes, ordersRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/orders`),
        axios.get(`${API_URL}/invoice`),
      ]);

      set({
        allCustomers: customersRes.data,
        allOrders: ordersRes.data,
        allInvoices: invoicesRes.data,
        adminLoading: false,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      set({ adminLoading: false });
    }
  },

}));

export default useStore;