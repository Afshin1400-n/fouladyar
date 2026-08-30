// src/app/register/page.js

"use client"

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // اعتبارسنجی
    if (!name || !nationalId || !phone || !address || !password) {
      setError('❌ لطفاً تمام فیلدها را پر کنید');
      return;
    }

    if (password.length < 4) {
      setError('❌ رمز عبور باید حداقل ۴ کاراکتر باشد');
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (nationalId.length !== 4) {
      setError('❌ کد ملی باید ۴ رقم باشد');
      return;
    }

    setLoading(true);

    try {
      // ۱. چک کردن تکراری نبودن کد ملی
      const res = await axios.get('http://localhost:4000/customers');
      const existingUser = res.data.find((u) => u.nationalId === nationalId);

      if (existingUser) {
        setError('❌ این کد ملی قبلاً ثبت شده است');
        setLoading(false);
        return;
      }

      // ۲. ایجاد کاربر جدید
      const newUser = {
        id: Date.now().toString(),
        name,
        nationalId,
        phone,
        address,
        password,
        createdAt: new Date().toISOString()
      };

      // ۳. ارسال به JSON Server
      await axios.post('http://localhost:4000/customers', newUser);

      setSuccess('✅ ثبت‌نام با موفقیت انجام شد');
      setLoading(false);

      // ۴. بعد از ۲ ثانیه رفتن به صفحه ورود
      setTimeout(() => {
        router.push('./login');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setError('❌ خطا در ارتباط با سرور');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">ثبت‌نام</h1>
          <p className="text-gray-500 mt-2">ایجاد حساب کاربری جدید</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              نام کامل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="علی محمدی"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              کد ملی
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="۱۲۳۴"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              تلفن
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              آدرس
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="تهران، خیابان آزادی"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              تکرار رمز عبور
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          قبلاً ثبت‌نام کردید؟{' '}
          <Link href="./login" className="text-blue-600 hover:text-blue-700 font-medium">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}