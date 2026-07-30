"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/commonComponents/Button";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showDefaultFooter?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  submitDisabled?: boolean;
  skeleton?: React.ReactNode;
  showSkeleton?: boolean;
}

const sizeClasses = {
  sm: "w-[95vw] sm:w-[500px] max-w-[500px]",
  md: "w-[95vw] sm:w-[700px] max-w-[700px]",
  lg: "w-[95vw] sm:w-[90vw] lg:w-[900px] max-w-[900px]",
  xl: "w-[95vw] sm:w-[90vw] lg:w-[1200px] max-w-[1200px]",
  full: "w-[95vw] max-w-[95vw]",
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "md",
  showDefaultFooter = false,
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Submit",
  submitDisabled = false,
  skeleton,
  showSkeleton,
}: ModalProps) {
  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  }, [onCancel, onOpenChange]);

  const handleSubmit = React.useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  // Delay content rendering until after modal animation starts
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Delay rendering content slightly to allow modal to start animating first
      const timer = setTimeout(() => setShouldRender(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Immediately hide content when closing
      setShouldRender(false);
    }
  }, [open]);

  // Determine if skeleton should be shown
  const showSkeletonState = showSkeleton !== undefined
    ? showSkeleton
    : (skeleton && open && !shouldRender);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`!max-w-none ${sizeClasses[size]} max-h-[90vh] flex flex-col p-0 overflow-hidden`}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg font-medium">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {showSkeletonState && skeleton}
          {shouldRender && children}
        </div>

        {(footer || showDefaultFooter) && (
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            {shouldRender && (footer || (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                >
                  {submitText}
                </Button>
              </>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
