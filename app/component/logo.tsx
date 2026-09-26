// app/component/logo.tsx
"use client"

import Image from 'next/image';

interface LogoProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function Logo({
  src = '/logo.jpg',
  alt = 'Fouladyar Kourosh Logo',
  className = '',
  width = 160,
  height = 80,
  priority = true,
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}