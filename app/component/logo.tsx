// src/components/Logo.jsx

import Image from 'next/image';

export default function Logo({
  src = '/logo.jpg',
  alt = 'Fouladyar Kourosh Logo',
  className = '',
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="200px"
      className={`object-contain ${className}`}
      priority
      {...props}
    />
  );
}