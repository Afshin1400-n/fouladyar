// src/store/store.js

"use client"
import { create } from "zustand";
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const useStore = create((set, get) => ({
  // ==================== Initial State ====================
  
  // Regular user
  users: [],
  currentUser: null,
  isAuthenticated: false,

  // Admin
  adminUser: null,
  isAdminAuthenticated: false,

  // Admin data
  allCustomers: [],
  allOrders: [],
  allInvoices: [],
  adminLoading: false,

  // General
  loading: false,
  error: null,

  // ==================== Regular User ====================

  // Fetch all users
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/customers`);
      set({ users: res.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Regular user login
  login: async (nationalId, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/customers`);
      const users = res.data;

      const user = users.find((u) => u.nationalId === nationalId);

      if (!user) {
        set({ loading: false });
        return { success: false, message: '❌ No user found with this National ID' };
      }

      if (user.password !== password) {
        set({ loading: false });
        return { success: false, message: '❌ Incorrect password' };
      }

      set({
        currentUser: user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, message: '✅ Login successful' };

    } catch (error) {
      set({
        loading: false,
        error: 'Server connection error'
      });
      return { success: false, message: '❌ Server connection error' };
    }
  },

  // Regular user logout
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('user');
  },

  // Set current user
  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: true });
  },

  // ==================== Admin ====================

  // 🔐 Admin login
  adminLogin: async (nationalId, password) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/users`);
      const admins = res.data;

      // Only users with role === 'admin' are allowed
      const admin = admins.find(
        (u) => u.nationalId === nationalId && u.role === 'admin'
      );

      if (!admin) {
        set({ loading: false });
        return { success: false, message: '❌ No admin found with this National ID' };
      }

      if (admin.password !== password) {
        set({ loading: false });
        return { success: false, message: '❌ Incorrect password' };
      }

      set({
        adminUser: admin,
        isAdminAuthenticated: true,
        loading: false,
        error: null
      });

      localStorage.setItem('admin', JSON.stringify(admin));

      return { success: true, message: '✅ Admin login successful' };

    } catch (error) {
      set({
        loading: false,
        error: 'Server connection error'
      });
      return { success: false, message: '❌ Server connection error' };
    }
  },

  // 🔐 Admin logout
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

  // ==================== Admin Data ====================

  // 📊 Fetch all system data (customers + orders + invoices)
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