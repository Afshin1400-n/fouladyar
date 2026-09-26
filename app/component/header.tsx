// app/component/header.tsx
"use client"

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Home, ChevronDown, User } from 'lucide-react';
import Logo from './logo';

interface HeaderProps {
  currentUser: { username?: string; name?: string } | null;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const getInitial = (name?: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const displayName = currentUser?.username || currentUser?.name || 'User';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-xl">🏭</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Fouladyar</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Steel Company Portal</p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Home Button */}
            <Link
              href="/dashboard"
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              title="Dashboard"
            >
              <Home className="w-5 h-5 text-slate-500" />
            </Link>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {getInitial(displayName)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-slate-700">{displayName}</p>
                  <p className="text-[10px] text-slate-400">Customer</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
                  {/* User Info (mobile) */}
                  <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                    <p className="text-sm font-medium text-slate-700">{displayName}</p>
                    <p className="text-xs text-slate-400">Customer</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}