'use client';

import { useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const SIDEBAR_STORAGE_KEY = 'sidebar-state';

/**
 * SidebarManager - Syncs sidebar state with localStorage
 *
 * This component:
 * 1. Loads sidebar state from localStorage on mount
 * 2. Saves sidebar state to localStorage when it changes
 * 3. Syncs between SidebarTrigger and ThemeCustomizer controls
 */
export function SidebarManager() {
  const { state, setOpen } = useSidebar();
  const isInitialized = useRef(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedState !== null) {
        const isOpen = savedState === 'true';
        setOpen(isOpen);
      }
      isInitialized.current = true;
    }
  }, [setOpen]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized.current) {
      const isOpen = state === 'expanded';
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen));
    }
  }, [state]);

  return null; // This component doesn't render anything
}
