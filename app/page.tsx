// src/app/page.js

"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from './store/store';

export default function HomePage() {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  // اگه لاگین بود بره داشبورد
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-blue-900 to-blue-700 p-4" dir="rtl">
      <div className="max-w-2xl w-full text-center">
        {/* لوگو یا آیکون */}
        <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <span className="text-4xl text-white">🏗️</span>
        </div>

        {/* عنوان */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          به سامانه مشتریان فولادیار کوروش خوش آمدید
        </h1>
        <p className="text-blue-100 mb-8 text-lg">
          مدیریت حواله‌ها و صورت‌برش‌های شما
        </p>

        {/* دکمه‌ها */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg text-lg"
          >
            ورود
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition shadow-lg text-lg border border-white/20"
          >
            ثبت‌نام
          </Link>
        </div>

        {/* فوتر */}
        <p className="text-blue-200/60 text-sm mt-8">
          گروه فولادیار کوروش © ۱۴۰۵
        </p>
      </div>
    </div>
  );
}