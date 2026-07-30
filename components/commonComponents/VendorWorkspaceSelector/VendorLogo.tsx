"use client";

import * as React from "react";
import Image from "next/image";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

interface VendorLogoProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function VendorLogo({ src, alt, size = 16, className = "" }: VendorLogoProps) {
  const [hasError, setHasError] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  // If no src provided or image failed to load, show fallback icon
  if (!src || hasError) {
    return (
      <HiOutlineBuildingOffice2
        className={className || "h-4 w-4 text-muted-foreground"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className || "h-4 w-4 rounded object-cover"}
      onError={() => setHasError(true)}
      unoptimized // Skip Next.js optimization for external S3 URLs
    />
  );
}
