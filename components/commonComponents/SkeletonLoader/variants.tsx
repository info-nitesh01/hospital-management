/**
 * Skeleton Loader Variants
 * Pre-built skeleton components for common use cases
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Card Skeleton - For card-based layouts
 */
export function CardSkeleton({
  showImage = false,
  showAvatar = false,
  lines = 3,
  className,
}: {
  showImage?: boolean;
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      {showImage && <Skeleton className="h-48 w-full rounded-md" />}
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Table Skeleton - For data tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {showHeader && (
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * List Skeleton - For list items
 */
export function ListSkeleton({
  items = 5,
  showAvatar = true,
  lines = 2,
  className,
}: {
  items?: number;
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start space-x-4">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            {Array.from({ length: lines }).map((_, lineIndex) => (
              <Skeleton key={lineIndex} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton - For form fields
 */
export function FormSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Header Skeleton - For page headers
 */
export function HeaderSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

/**
 * Stats Skeleton - For stat cards
 */
export function StatsSkeleton({
  cards = 4,
  className,
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 2xl:gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton - For charts and graphs
 */
export function ChartSkeleton({
  height = 350,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * Text Skeleton - For text lines
 */
export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * Avatar Skeleton - For user avatars
 */
export function AvatarSkeleton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

/**
 * Data Table Skeleton - Specifically for the DataTable component
 * Matches the height and structure of the actual DataTable
 */
export function DataTableSkeleton({
  rows = 14,
  showPagination = true,
  showSearch = true,
  className,
}: {
  rows?: number;
  showPagination?: boolean;
  showSearch?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filters */}
      {showSearch && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border max-h-[600px] overflow-auto">
        {/* Header - matches actual DataTable header height */}
        <div className="flex items-center gap-4 border-b bg-muted/50 px-4 h-12">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Rows - matches actual DataTable row height (h-16 or ~64px) */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b last:border-0 px-4 h-8"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Page Skeleton - Full page layout
 */
export function PageSkeleton({
  showHeader = true,
  showStats = false,
  showContent = true,
  className,
}: {
  showHeader?: boolean;
  showStats?: boolean;
  showContent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && <HeaderSkeleton />}
      {showStats && <StatsSkeleton cards={4} />}
      {showContent && <CardSkeleton lines={5} />}
    </div>
  );
}
