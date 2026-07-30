"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withText?: boolean;
}

const sizeMap = {
  sm: 16,   // 16px = h-4 w-4
  md: 24,   // 24px = h-6 w-6
  lg: 32,   // 32px = h-8 w-8 (default CSS size)
  xl: 48,   // 48px = h-12 w-12
};

export function Loader({ size = "md", className, withText = false }: LoaderProps) {
  const sizeInPx = sizeMap[size];

  // If withText is true, wrap in a container with text
  if (withText) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <div
          className={cn("custom-loader", className)}
          style={{ width: `${sizeInPx}px`, height: `${sizeInPx}px` }}
        />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Otherwise, just return the loader div
  return (
    <div
      className={cn("custom-loader", className)}
      style={{ width: `${sizeInPx}px`, height: `${sizeInPx}px` }}
    />
  );
}
