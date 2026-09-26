// store/store.ts
"use client"

import { create } from "zustand";
import axios from 'axios';

const API_URL = 'http://localhost:4000';

// ==================== Types ====================

interface Customer {
  id: string;
  name: string;
  nationalId: string;
  phone?: string;
  address?: string;
  password?: string;
  economicCode?: string;
  createdAt?: string;
}

interface AdminUser {
  id: string;
  name: string;
  nationalId: string;
  password?: string;
  role: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  date: string;
  status: string;
  productType: string;
  brand: string;
  thickness: number;
  width: number;
  unit?: string;
  totalWeight: number;
  cutWeight?: number;
  remainingWeight?: number;
  unitPrice?: number;
  paid?: boolean;
  paymentDate?: string | null;
  shipped?: boolean;
  shippedDate?: string | null;
  invoiceIssued?: boolean;
  invoiceNumber?: string;
  invoiceDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

interface LoginResult {
  success: boolean;
  message: string;
}

interface StoreState {
  // Regular user
  users: Customer[];
  currentUser: Customer | null;
  isAuthenticated: boolean;

  // Admin
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;

  // Admin data
  allCustomers: Customer[];
  allOrders: Order[];
  allInvoices: Invoice[];
  adminLoading: boolean;

  // General
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  login: (nationalId: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  setCurrentUser: (user: Customer) => void;
  adminLogin: (nationalId: string, password: string) => Promise<LoginResult>;
  adminLogout: () => void;
  fetchAdminData: () => Promise<void>;
  restoreSession: () => void;
}

// ==================== Store ====================

const useStore = create<StoreState>((set, get) => ({
  // ==================== Initial State ====================

  users: [],
  currentUser: null,
  isAuthenticated: false,

  adminUser: null,
  isAdminAuthenticated: false,

  allCustomers: [],
  allOrders: [],
  allInvoices: [],
  adminLoading: false,

  loading: false,
  error: null,

  // ==================== Regular User ====================

  // Fetch all customers
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/customers`);
      set({ users: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Regular user login
  login: async (nationalId: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/customers`);
      const users: Customer[] = res.data;

      const user = users.find((u) => u.nationalId === nationalId);

      if (!user) {
        set({ loading: false });
        return { success: false, message: 'No user found with this National ID' };
      }

      if (user.password !== password) {
        set({ loading: false });
        return { success: false, message: 'Incorrect password' };
      }

      set({
        currentUser: user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { success: true, message: 'Login successful' };
    } catch (error) {
      set({
        loading: false,
        error: 'Server connection error',
      });
      return { success: false, message: 'Server connection error' };
    }
  },

  // Regular user logout
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  // Set current user manually
  setCurrentUser: (user: Customer) => {
    set({ currentUser: user, isAuthenticated: true });
  },

  // ==================== Admin ====================

  // Admin login
  adminLogin: async (nationalId: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${API_URL}/users`);
      const admins: AdminUser[] = res.data;

      // Only users with role === 'admin' are allowed
      const admin = admins.find(
        (u) => u.nationalId === nationalId && u.role === 'admin'
      );

      if (!admin) {
        set({ loading: false });
        return { success: false, message: 'No admin found with this National ID' };
      }

      if (admin.password !== password) {
        set({ loading: false });
        return { success: false, message: 'Incorrect password' };
      }

      set({
        adminUser: admin,
        isAdminAuthenticated: true,
        loading: false,
        error: null,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin', JSON.stringify(admin));
      }

      return { success: true, message: 'Admin login successful' };
    } catch (error) {
      set({
        loading: false,
        error: 'Server connection error',
      });
      return { success: false, message: 'Server connection error' };
    }
  },

  // Admin logout
  adminLogout: () => {
    set({
      adminUser: null,
      isAdminAuthenticated: false,
      allCustomers: [],
      allOrders: [],
      allInvoices: [],
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin');
    }
  },

  // ==================== Admin Data ====================

  // Fetch all system data (customers + orders + invoices)
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

  // ==================== Session Restore ====================

  // Restore session from localStorage (call this on app mount)
  restoreSession: () => {
    if (typeof window === 'undefined') return;

    try {
      const storedUser = localStorage.getItem('user');
      const storedAdmin = localStorage.getItem('admin');

      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ currentUser: user, isAuthenticated: true });
      }

      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        set({ adminUser: admin, isAdminAuthenticated: true });
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  },
}));

export default useStore;