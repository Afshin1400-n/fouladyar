"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from './store/store';
import { Building2, Package, FileText, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-blue-100" dir="rtl">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-white to-blue-400/10 -z-10" />
      
      {/* Floating Shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-medium text-blue-700 tracking-wide">نسخه ۲.۰</span>
        </div>

        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl shadow-blue-500/40 mb-5 relative group">
            <Building2 className="w-10 h-10 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl -z-10 group-hover:blur-2xl transition" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            فولادیار <span className="text-blue-600">کوروش</span>
          </h1>
          <p className="text-base text-gray-500 font-normal">
            سامانه جامع مدیریت مشتریان
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
          <div className="group bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">مدیریت حواله‌ها</p>
          </div>
          <div className="group bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">صورت‌برش‌ها</p>
          </div>
          <div className="group bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">مشتریان</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
          <Link
            href="/login"
            className="group flex items-center justify-center gap-2 flex-1 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 text-sm"
          >
            ورود به حساب
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="flex-1 px-8 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 hover:shadow-md transition-all duration-200 text-center border border-gray-200 text-sm"
          >
            ثبت‌نام
          </Link>
        </div>

        {/* Divider with decorative line */}
        <div className="flex items-center gap-4 mt-10 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
          <span className="text-xs text-gray-400 font-light">گروه فولادیار کوروش</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400/70 font-light">
          © ۱۴۰۵ تمامی حقوق محفوظ است
        </p>
      </div>
    </div>
  );
}