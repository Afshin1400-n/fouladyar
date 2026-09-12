"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from './store/store';
import { Building2, Package, FileText, Users, Sparkles, UserCircle, ShieldCheck } from 'lucide-react';
import Footer from './component/footer';
import Logo from './component/logo';

export default function HomePage() {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="h-screen  bg-slate-50">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-400/10 -z-10" />
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-medium text-blue-700 tracking-wide">Version 2.0</span>
        </div>
<div className="relative w-full h-32 mb-10">
  <Logo />
</div>


        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
          <div className="group bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Order Management</p>
          </div>
          <div className="group bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Cutting Invoices</p>
          </div>
          <div className="group bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Customers</p>
          </div>
        </div>

        {/* 🎯 Two login buttons: Customers + Employees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">

          {/* Customer Login */}
          <Link
            href="/login"
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">
                  Customer Login
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  View orders, cutting invoices, and order history
                </p>
              </div>
            </div>
          </Link>

          {/* Employee Login */}
          <Link
            href="/adminLogin"
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">
                  Employee Login
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access to admin panel and system tools
                </p>
              </div>
            </div>
          </Link>

        </div>


        {/* Footer */}
       <Footer />
      </div>
    </div>
  );
}