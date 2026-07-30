"use client";

import * as React from "react";
import { IconType } from "react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_STYLES, getTabsListGridClass } from "@/lib/constants/tabStyles";

export interface TabConfig<T extends string = string> {
  value: T;
  icon?: IconType;
  label: string;
  badge?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;
}

interface PageTabsProps<T extends string = string> {
  tabs: TabConfig<T>[];
  currentTab: T;
  onTabChange: (value: T) => void;
  children?: React.ReactNode;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
  rightActions?: React.ReactNode;
}

/**
 * Common PageTabs component for consistent tab styling across the application
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { value: "tab1", icon: Bell, label: "Tab 1" },
 *   { value: "tab2", icon: User, label: "Tab 2", badge: "5" }
 * ];
 *
 * <PageTabs
 *   tabs={tabs}
 *   currentTab={currentTab}
 *   onTabChange={handleTabChange}
 * >
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </PageTabs>
 * ```
 */
export function PageTabs<T extends string = string>({
  tabs,
  currentTab,
  onTabChange,
  children,
  className = "w-full",
  tabsListClassName,
  tabsTriggerClassName,
  rightActions,
}: Omit<PageTabsProps<T>, 'tabsContentClassName'>) {
  const handleTabChange = (value: string) => {
    onTabChange(value as T);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className={className}>
      <div className="flex items-center justify-between gap-4">
        <TabsList className={tabsListClassName || getTabsListGridClass(tabs.length)}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={tabsTriggerClassName || TAB_STYLES.tabsTrigger}
              >
                {IconComponent && <IconComponent className={TAB_STYLES.icon} />}
                <span className="flex items-center gap-1">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={TAB_STYLES.badge}>
                      {typeof tab.badge === "number" ? tab.badge.toLocaleString() : tab.badge}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {rightActions}
      </div>
      {children}
    </Tabs>
  );
}

/**
 * Helper component for rendering TabsContent with common styling
 */
export function PageTabContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContent value={value} className={className || TAB_STYLES.tabsContent}>
      {children}
    </TabsContent>
  );
}
