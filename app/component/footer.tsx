// app/component/footer.tsx
"use client"

interface FooterProps {
  variant?: 'light' | 'dark';
  className?: string;
}

function Footer({ variant = 'light', className = '' }: FooterProps) {
  const isDark = variant === 'dark';

  return (
    <div className={className}>
      <p
        className={`text-center text-[11px] mt-6 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        Fouladyar Kourosh Group © 2026
      </p>
    </div>
  );
}

export default Footer;