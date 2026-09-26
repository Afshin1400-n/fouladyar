// app/component/statCard.tsx
"use client"

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'emerald' | 'slate';
  icon?: LucideIcon;
  variant?: 'light' | 'dark';
}

export default function StatCard({
  label,
  value,
  suffix,
  color = 'blue',
  icon: Icon,
  variant = 'light',
}: StatCardProps) {
  const isDark = variant === 'dark';

  // Color classes for light variant
  const lightColors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  // Color classes for dark variant
  const darkColors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  };

  // ============ Dark Variant ============
  if (isDark) {
    const colors = darkColors[color] || darkColors.blue;

    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
        {Icon && (
          <div className="mb-3">
            <div
              className={`w-11 h-11 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
          </div>
        )}
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>
          )}
        </p>
      </div>
    );
  }

  // ============ Light Variant ============
  return (
    <div className={`rounded-xl shadow-sm p-5 border ${lightColors[color] || lightColors.blue} bg-white`}>
      {Icon && (
        <div className="mb-3">
          <Icon className="w-5 h-5 opacity-60" />
        </div>
      )}
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {value}
        {suffix && (
          <span className="text-sm font-normal text-slate-500 ml-1">{suffix}</span>
        )}
      </p>
    </div>
  );
}