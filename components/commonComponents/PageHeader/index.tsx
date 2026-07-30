import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

/**
 * Common Page Header component for consistent page titles
 *
 * @example
 * @example with custom action buttons
 */
export function PageHeader({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <h1 className={cn("text-2xl font-semibold tracking-tight text-gray-600", titleClassName)}>
          {title}
        </h1>
        {description && (
          <p className={cn("text-muted-foreground", descriptionClassName)}>
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}