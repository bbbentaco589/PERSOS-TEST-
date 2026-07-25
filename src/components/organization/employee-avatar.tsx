"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const fallbackAvatar = "/brand/ptudio-mark-transparent.png";

export function EmployeeAvatar({
  alt,
  className,
  size,
  src,
}: {
  alt: string;
  className?: string;
  size: number;
  src: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === src ? fallbackAvatar : src;

  return (
    <Image
      alt={alt}
      className={cn("shrink-0 bg-black object-cover", className)}
      height={size}
      onError={() => setFailedSrc(src)}
      src={currentSrc}
      width={size}
    />
  );
}
