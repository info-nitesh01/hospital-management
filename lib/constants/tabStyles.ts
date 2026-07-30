/**
 * Common tab styles used across the application
 * Modify these constants to apply styling changes globally
 */

export const TAB_STYLES = {
  /**
   * TabsList styles - Applied to the container of tab triggers
   * Use with dynamic grid-cols based on number of tabs
   * Note: Overrides h-9 and inline-flex from base component for proper grid layout
   */
  tabsList: "flex flex-wrap gap-2 !h-auto",

  /**
   * TabsTrigger styles - Applied to individual tab buttons
   */
  tabsTrigger: "flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2 w-fit h-7",

  /**
   * TabsContent styles - Applied to tab content containers
   */
  tabsContent: "2xl:mt-2",

  /**
   * Icon styles within tabs
   */
  icon: "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0",

  /**
   * Badge/counter styles for tab labels
   */
  badge: "ml-1 px-1.5 py-0.5 text-xs bg-sidebar-accent rounded-full font-medium",
} as const;

/**
 * Helper function to generate grid-cols class based on number of tabs
 * Responsive: On mobile (< 640px), tabs stack or use fewer columns
 */
export const getTabsListGridClass = (tabCount: number): string => {
  // For mobile: use auto-fit with minmax to allow wrapping
  // For desktop: use fixed grid-cols based on tab count
  if (tabCount <= 2) {
    return `${TAB_STYLES.tabsList} grid-cols-2`;
  } else if (tabCount === 3) {
    return `${TAB_STYLES.tabsList} grid-cols-2 sm:grid-cols-3`;
  } else if (tabCount === 4) {
    return `${TAB_STYLES.tabsList} grid-cols-2 sm:grid-cols-4`;
  } else {
    // For 5+ tabs, use 2 columns on mobile and all columns on desktop
    return `${TAB_STYLES.tabsList} grid-cols-2 sm:grid-cols-${tabCount}`;
  }
};
