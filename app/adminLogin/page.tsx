// src/app/admin/login/page.js

"use client"

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '../store/store';
import { Shield, Lock, User, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, isAdminAuthenticated, loading } = useStore();

  const inputRef = useRef(null);

  // اگه ادمین قبلاً لاگین کرده، بره به پنل ادمین
  useEffect(() => {
    if (isAdminAuthenticated) {
      router.push('/adminDashboard');
    }
  }, [isAdminAuthenticated, router]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await adminLogin(nationalId, password);

    if (result.success) {
      router.push('/adminDashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 right-6 p-2.5 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg shadow-indigo-500/40 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">فولادیار کوروش</h1>
            <p className="text-sm text-slate-400 mt-1">ورود مدیران سیستم</p>
          </div>

          {/* Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full mb-6">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-medium text-indigo-300">دسترسی محدود</span>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* National ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  کد ملی ادمین
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full pr-11 pl-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-11 pl-4 py-3.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.01] text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال بررسی...
                  </div>
                ) : (
                  'ورود به پنل مدیریت'
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 text-center">
              🔑 برای تست: کد ملی <span className="text-indigo-400 font-mono">1234</span> و رمز <span className="text-indigo-400 font-mono">1234</span>
            </p>
          </div>

          <p className="text-center text-[11px] text-slate-600 mt-6">
            گروه فولادیار کوروش © ۱۴۰۵ — پنل مدیریت
          </p>
        </div>
      </div>
    </div>
  );
}