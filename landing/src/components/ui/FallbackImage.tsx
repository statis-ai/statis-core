"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReactNode } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback: ReactNode;
  priority?: boolean;
}

/**
 * Tries to render a Next/Image. If the file is missing or fails to load,
 * renders the `fallback` slot instead. This lets the build succeed even if
 * illustration assets haven't been dropped in yet.
 */
export function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
  priority,
}: FallbackImageProps) {
  const [error, setError] = useState(false);

  if (error) return <>{fallback}</>;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
