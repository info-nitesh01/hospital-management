"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getColorScheme } from "@/config/theme-colors";
import { authApi } from "@/lib/api/global-http";
import type { ThemeConfig } from "@/config/theme-config";
import { hydrateTheme, setMounted } from "@/store/slices/themeSlice";

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { config, mounted } = useAppSelector((state) => state.theme);
  const { isLoading: isAuthLoading, isAuthenticated, userId } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const loadedForUser = useRef<string | null>(null);
  const savedConfig = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    let cancelled = false;
    loadedForUser.current = null;
    savedConfig.current = null;
    dispatch(setMounted(false));

    if (!isAuthenticated || !userId) {
      dispatch(setMounted(true));
      return () => {
        cancelled = true;
      };
    }

    authApi.getInstance()
      .get<{ content: ThemeConfig }>("/theme")
      .then(({ data }) => {
        if (cancelled) return;
        loadedForUser.current = userId;
        savedConfig.current = `${userId}:${JSON.stringify(data.content)}`;
        dispatch(hydrateTheme(data.content));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load user theme:", error);
        dispatch(setMounted(true));
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthLoading, isAuthenticated, userId]);

  // Apply theme changes to DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply mode (dark/light)
    if (config.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply primary color (use custom color if set, otherwise use theme color)
    if (config.customColor) {
      root.style.setProperty("--primary", config.customColor);
      // Determine appropriate foreground color based on brightness
      root.style.setProperty("--primary-foreground", "#fafafa");
    } else {
      const colorScheme = getColorScheme(config.primaryColor);
      const colors = config.mode === "dark" ? colorScheme.dark : colorScheme.light;
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--primary-foreground", colors.primaryForeground);
    }

    // Apply button primary color (use custom button color if set, otherwise use button theme color, or fallback to primary)
    if (config.customButtonColor) {
      root.style.setProperty("--button-primary", config.customButtonColor);
      root.style.setProperty("--button-primary-foreground", "#fafafa");
    } else if (config.buttonPrimaryColor) {
      const buttonColorScheme = getColorScheme(config.buttonPrimaryColor);
      const buttonColors = config.mode === "dark" ? buttonColorScheme.dark : buttonColorScheme.light;
      root.style.setProperty("--button-primary", buttonColors.primary);
      root.style.setProperty("--button-primary-foreground", buttonColors.primaryForeground);
    } else {
      // Fallback to primary color if no button color is set
      root.style.setProperty("--button-primary", "var(--primary)");
      root.style.setProperty("--button-primary-foreground", "var(--primary-foreground)");
    }

    // Apply font size scale
    const scale = config.fontSize || 1;
    root.style.setProperty('--font-scale', scale.toString());

    // Apply scaled font sizes using clamp()
    root.style.setProperty('--text-xs', `clamp(${0.55 * scale}rem, ${0.5 * scale}vw, ${0.6 * scale}rem)`);
    root.style.setProperty('--text-sm', `clamp(${0.6 * scale}rem, ${0.6 * scale}vw, ${0.775 * scale}rem)`);
    root.style.setProperty('--text-base', `clamp(${0.7 * scale}rem, ${1 * scale}vw, ${0.8 * scale}rem)`);
    root.style.setProperty('--text-lg', `clamp(${0.9 * scale}rem, ${0.9 * scale}vw, ${1 * scale}rem)`);
    root.style.setProperty('--text-xl', `clamp(${1 * scale}rem, ${1 * scale}vw, ${1.2 * scale}rem)`);
    root.style.setProperty('--text-2xl', `clamp(${1.2 * scale}rem, ${1.1 * scale}vw, ${1.4 * scale}rem)`);
    root.style.setProperty('--text-3xl', `clamp(${1.4 * scale}rem, ${1.2 * scale}vw, ${1.7 * scale}rem)`);
  }, [config, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
