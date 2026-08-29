// src/store/store.js

"use client"
import { create } from "zustand";
import axios from 'axios';

const useStore = create((set, get) => ({
  // حالت اولیه
  users: [],
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // گرفتن همه کاربران
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('http://localhost:4000/customers');
      set({ users: res.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // لاگین کردن
  login: async (nationalId, password) => {
    set({ loading: true, error: null });

    try {
      // ۱. گرفتن همه کاربران
      const res = await axios.get('http://localhost:4000/customers');
      const users = res.data;

      // ۲. پیدا کردن کاربر با کد ملی
      const user = users.find((u) => u.nationalId === nationalId);

      if (!user) {
        set({ loading: false });
        return { success: false, message: '❌ کاربری با این کد ملی یافت نشد' };
      }

      // ۳. چک کردن رمز عبور
      if (user.password !== password) {
        set({ loading: false });
        return { success: false, message: '❌ رمز عبور اشتباه است' };
      }

      // ۴. موفقیت - ذخیره کاربر
      set({
        currentUser: user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      // ۵. ذخیره در localStorage
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

  // خروج
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
}));

export default useStore;