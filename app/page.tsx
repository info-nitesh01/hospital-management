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
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/global-http";
import { getErrorMessage } from "@/lib/api/error-utils";
import { Loader } from "@/components/commonComponents/Loader";
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
  DashboardData,
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

const EMPTY_DASHBOARD_DATA: DashboardData = {
  totalMetrics: [],
  noticeAndAppealsMetrics: [],
  totalAccountsData: [],
  appealsOverview: { detailedOverview: [], simpleOverview: [] },
  savingsByState: [],
  bppRenderedValues: [],
  appealSavingChart: { company: [], state: [], property: [], county: [], assessor: [] },
};

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
  dashboardData: DashboardData;
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
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard", "main"],
    queryFn: async () => {
      const response = await authApi.getInstance().get<{ content: DashboardData }>("/dashboard");
      return response.data.content;
    },
  });
  const resolvedDashboardData = dashboardData ?? EMPTY_DASHBOARD_DATA;
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
    clients: extractUniqueClients(resolvedDashboardData as never),
    owners: extractUniqueOwners(resolvedDashboardData as never),
    properties: extractUniqueProperties(resolvedDashboardData as never),
    states: extractUniqueStates(resolvedDashboardData as never),
    counties: extractUniqueCounties(resolvedDashboardData as never),
    years: extractUniqueYears(resolvedDashboardData as never),
  }), [resolvedDashboardData]);

  // Apply filters to data (memoized)
  const filteredData = React.useMemo(() => {
    return filterDashboardData(resolvedDashboardData as never, filters);
  }, [filters, resolvedDashboardData]);

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    return getActiveFilterCount(filters);
  }, [filters]);

  // Handle filter changes and save to user-specific localStorage
  const handleFiltersChange = React.useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
    saveFiltersToStorage(newFilters, userId || undefined);
  }, [userId]);

  if (isDashboardLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" withText />
      </div>
    );
  }

  if (dashboardError || !dashboardData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="alert">
        <p className="text-sm text-destructive">
          Unable to load dashboard data: {dashboardError ? getErrorMessage(dashboardError) : "No dashboard data was returned."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 2xl:space-y-4">
        <MetricsGrid metrics={resolvedDashboardData.totalMetrics as Metric[]} />
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
