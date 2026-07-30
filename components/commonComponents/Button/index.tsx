"use client";

import * as React from "react";
import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import { Loader } from "@/components/commonComponents/Loader";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

/**
 * Common Button component with loading state management
 * @param loading - Shows loading spinner and disables the button
 * @param loadingText - Text to show when loading (optional)
 * @param icon - Icon to display in button
 * @param iconPosition - Position of icon (left or right)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading ? (
          <>
            {iconPosition === "left" && (
              <Loader size="sm" />
            )}
            {loadingText || children}
            {iconPosition === "right" && (
              <Loader size="sm" />
            )}
          </>
        ) : (
          <>
            {iconPosition === "left" && icon}
            {children}
            {iconPosition === "right" && icon}
          </>
        )}
      </>
    );

    return (
      <ShadcnButton
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        asChild={asChild}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

/**
 * Hook for managing button loading state
 * Useful for async operations like API calls
 */
export function useButtonLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const executeAsync = React.useCallback(
    async <T,>(asyncFunction: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      try {
        const result = await asyncFunction();
        return result;
      } catch (error) {
        console.error("Button action failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, setIsLoading, executeAsync };
}

// Re-export button variants for consistency
export { buttonVariants } from "@/components/ui/button";