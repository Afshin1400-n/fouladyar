// app/component/empty.tsx
"use client"

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  // Icon options (pick one)
  emoji?: string;
  icon?: LucideIcon;

  // Content
  title: string;
  description?: string;

  // Action button/link
  action?: ReactNode;

  // Variant (light for customer, dark for admin)
  variant?: 'light' | 'dark';
}

export default function EmptyState({
  emoji,
  icon: Icon,
  title,
  description,
  action,
  variant = 'light',
}: EmptyStateProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`text-center py-16 px-4 ${isDark ? 'text-slate-500' : ''}`}>
      {/* Icon or Emoji */}
      {Icon ? (
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isDark ? 'bg-slate-800/50' : 'bg-slate-100'
          }`}
        >
          <Icon
            className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
          />
        </div>
      ) : (
        <div className="text-6xl mb-4 opacity-40">{emoji || '📭'}</div>
      )}

      {/* Title */}
      <h3
        className={`text-lg font-medium mb-1 ${
          isDark ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`text-sm mb-4 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}