import React from "react"
import {
  Card as ShadcnCard,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardProps {
  title?: string | React.ReactNode
  extra?: React.ReactNode
  className?: string
  children: React.ReactNode
  headerClassName?: string
  contentClassName?: string
  showTitle?: boolean
}

export function Card({
  title,
  extra,
  className,
  children,
  headerClassName,
  contentClassName,
  showTitle = true,
}: CardProps) {
  const hasHeader = showTitle && (title || extra)

  return (
   <ShadcnCard className={cn("shadow-sm", !showTitle && "py-0", className)}>
  {hasHeader && (
    <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", headerClassName)}>
      {title && (
        <CardTitle className="text-lg font-medium">
          {title}
        </CardTitle>
      )}
      {extra && <div className="flex items-center">{extra}</div>}
    </CardHeader>
  )}
  <CardContent className={cn("flex-1", !hasHeader && showTitle && "pt-3", !showTitle && "py-3 px-3", contentClassName)}>
    {children}
  </CardContent>
</ShadcnCard>
  )
}

// Re-export other card components for flexibility
export {
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card"

// Export the ShadcnCard as BaseCard for advanced use cases
export { Card as BaseCard } from "@/components/ui/card"