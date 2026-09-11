// src/components/RefreshButton.js

"use client"

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshButton({
  onRefresh,
  className = '',
  label = 'بروزرسانی',
  showLabel = true,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // یه تأخیر کوچیک برای اینکه انیمیشن دیده بشه
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      title={label}
    >
      <RefreshCw
        className={`w-4 h-4 transition-transform ${
          isRefreshing ? 'animate-spin' : ''
        }`}
      />
      {showLabel && <span>{isRefreshing ? 'در حال بروزرسانی...' : label}</span>}
    </button>
  );
}