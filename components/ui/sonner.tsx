"use client"

import {
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineArrowPath,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <HiOutlineCheckCircle className="size-4 text-green-600 dark:text-green-400" />,
        info: <HiOutlineInformationCircle className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: <HiOutlineExclamationTriangle className="size-4 text-amber-600 dark:text-amber-400" />,
        error: <HiOutlineXCircle className="size-4 text-red-600 dark:text-red-400" />,
        loading: <HiOutlineArrowPath className="size-4 animate-spin text-blue-600 dark:text-blue-400" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!bg-background !border !text-foreground",
          success: "!bg-green-50 !text-green-900 !border-green-200 dark:!bg-green-950 dark:!text-green-50 dark:!border-green-800",
          error: "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-50 dark:!border-red-800",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-200 dark:!bg-amber-950 dark:!text-amber-50 dark:!border-amber-800",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-50 dark:!border-blue-800",
          loading: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-50 dark:!border-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
