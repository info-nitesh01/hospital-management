"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineBell } from "react-icons/hi2";
import { PageTabs, PageTabContent } from "@/components/commonComponents/PageTabs";
import type { TabConfig } from "@/components/commonComponents/PageTabs";
import { NoticesAppealsTab } from "./dashboard/tabs/notices-appeals";
import { MetricsGrid } from "./dashboard/MetricsGrid";
import { FloatingFilterButton } from "./dashboard/components/FloatingFilterButton";
import { DashboardFilterSidebar } from "./dashboard/components/DashboardFilterSidebar";
import { useAuth } from "@/hooks/useAuth";
import dashboardData from "@/data/dashboard-data.json";
import {
  type DashboardFilters,
  loadFiltersFromStorage,
  saveFiltersToStorage,
  extractUniqueClients,
  extractUniqueOwners,
  extractUniqueProperties,
  extractUniqueStates,
  extractUniqueCounties,
  extractUniqueYears,
  filterDashboardData,
  getActiveFilterCount,
  getDefaultFilters,
} from "./dashboard/utils/filterHelpers";
import type {
  Metric,
  NoticeAndAppealsMetrics,
  AppealsOverview,
  AppealSavingChart,
  SavingsByState,
  BppRenderedValue,
} from "./dashboard/types";

// Constants
const TAB_CONFIGS: TabConfig[] = [
  {
    value: "notices-appeals",
    icon: HiOutlineBell,
    label: "Notices & Appeals",
    component: NoticesAppealsTab,
  },
];

// Custom hook
const useTabNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || TAB_CONFIGS[0].value;

  const handleTabChange = React.useCallback(
    (value: string) => {
      router.push(`/?tab=${value}`);
    },
    [router]
  );

  return { currentTab, handleTabChange };
};

interface TabNavigationProps {
  dashboardData: typeof dashboardData;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ dashboardData }) => {
  const { currentTab, handleTabChange } = useTabNavigation();

  return (
    <PageTabs tabs={TAB_CONFIGS} currentTab={currentTab} onTabChange={handleTabChange}>
      {TAB_CONFIGS.map((tab) => {
        const TabComponent = tab.component;
        if (!TabComponent) return null;

        return (
          <PageTabContent key={tab.value} value={tab.value}>
            <TabComponent
              noticeAndAppealsMetrics={dashboardData.noticeAndAppealsMetrics[0] as NoticeAndAppealsMetrics}
              totalAccountsData={dashboardData.totalAccountsData}
              appealsOverview={dashboardData.appealsOverview as AppealsOverview}
              appealSavingChart={dashboardData.appealSavingChart as AppealSavingChart}
              savingsByState={dashboardData.savingsByState as SavingsByState[]}
              bppRenderedValues={dashboardData.bppRenderedValues as BppRenderedValue[]}
            />
          </PageTabContent>
        );
      })}
    </PageTabs>
  );
};

// Main component
export default function DashboardPage() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "notices-appeals";
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<DashboardFilters>(() => {
    // Load user-specific filters from localStorage on initial mount
    if (typeof window !== "undefined") {
      return loadFiltersFromStorage(userId || undefined);
    }
    return getDefaultFilters();
  });

  // Reload filters when userId changes
  React.useEffect(() => {
    if (typeof window !== "undefined" && userId) {
      const userFilters = loadFiltersFromStorage(userId);
      setFilters(userFilters);
    }
  }, [userId]);

  // Extract filter options from data (memoized)
  const filterOptions = React.useMemo(() => ({
    clients: extractUniqueClients(dashboardData as never),
    owners: extractUniqueOwners(dashboardData as never),
    properties: extractUniqueProperties(dashboardData as never),
    states: extractUniqueStates(dashboardData as never),
    counties: extractUniqueCounties(dashboardData as never),
    years: extractUniqueYears(dashboardData as never),
  }), []);

  // Apply filters to data (memoized)
  const filteredData = React.useMemo(() => {
    return filterDashboardData(dashboardData as never, filters);
  }, [filters]);

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    return getActiveFilterCount(filters);
  }, [filters]);

  // Handle filter changes and save to user-specific localStorage
  const handleFiltersChange = React.useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
    saveFiltersToStorage(newFilters, userId || undefined);
  }, [userId]);

  return (
    <>
      <div className="space-y-3 2xl:space-y-4">
        <MetricsGrid metrics={dashboardData.totalMetrics as Metric[]} />
        <TabNavigation
          dashboardData={filteredData.dashboardData}
        />
      </div>

      <FloatingFilterButton
        onClick={() => setIsFilterOpen(true)}
        filterCount={activeFilterCount}
      />

      <DashboardFilterSidebar
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
        currentTab={currentTab}
      />
    </>
  );
}
