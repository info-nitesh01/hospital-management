import type {
  SavingsByState,
  AccountData,
  AppealSavingChartData,
  AppealSavingChart,
} from "../types";

export interface DashboardFilters {
  clients: string[];
  owners: string[];
  properties: string[];
  states: string[];
  counties: string[];
  years: string[];
}

// Type for dashboard data structure
export interface DashboardData {
  totalAccountsData?: AccountData[];
  savingsByState?: SavingsByState[];
  appealSavingChart?: AppealSavingChart;
  [key: string]: unknown;
}

const STORAGE_KEY = "dashboard-filters";

// Generate user-specific storage key
function getUserStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}-user-${userId}` : STORAGE_KEY;
}

// Get default filters with current year (2025)
export function getDefaultFilters(): DashboardFilters {
  return {
    clients: [],
    owners: [],
    properties: [],
    states: [],
    counties: [],
    years: ["2025"],
  };
}

// Load filters from localStorage (user-specific)
export function loadFiltersFromStorage(userId?: string): DashboardFilters {
  if (typeof window === "undefined") {
    return getDefaultFilters();
  }

  try {
    const storageKey = getUserStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<DashboardFilters>;
      // Merge with defaults to ensure all fields exist (for migration)
      return {
        ...getDefaultFilters(),
        ...parsed,
        counties: parsed.counties || [],
      };
    }
  } catch (error) {
    console.error("Failed to load filters from storage:", error);
  }

  return getDefaultFilters();
}

// Save filters to localStorage (user-specific)
export function saveFiltersToStorage(filters: DashboardFilters, userId?: string): void {
  if (typeof window === "undefined") return;

  try {
    const storageKey = getUserStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(filters));
  } catch (error) {
    console.error("Failed to save filters to storage:", error);
  }
}

// Extract unique clients from data
export function extractUniqueClients(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _dashboardData: DashboardData
): string[] {
  return [];
}

// Extract unique owners (same as clients for now)
export function extractUniqueOwners(
  dashboardData: DashboardData
): string[] {
  return extractUniqueClients(dashboardData);
}

// Extract unique properties from data
export function extractUniqueProperties(dashboardData: DashboardData): string[] {
  const properties = new Set<string>();

  if (dashboardData?.totalAccountsData) {
    dashboardData.totalAccountsData.forEach((item: AccountData) => {
      if (item.type) properties.add(item.type);
    });
  }

  return Array.from(properties).sort();
}

// Extract unique states from data
export function extractUniqueStates(
  dashboardData: DashboardData
): string[] {
  const states = new Set<string>();

  if (dashboardData?.savingsByState) {
    dashboardData.savingsByState.forEach((item: SavingsByState) => {
      if (item.state) states.add(item.state);
    });
  }

  return Array.from(states).sort();
}

// Extract unique counties from data
export function extractUniqueCounties(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _dashboardData: DashboardData
): string[] {
  // For now, return static county data
  const counties = new Set<string>([
    "Harris County",
    "Los Angeles County",
    "Cook County",
    "Maricopa County",
    "San Diego County",
    "Orange County",
    "Miami-Dade County",
    "Dallas County",
    "Kings County",
    "Queens County",
  ]);

  return Array.from(counties).sort();
}

// Extract unique years from data
export function extractUniqueYears(
  dashboardData: DashboardData
): string[] {
  const years = new Set<string>();

  // From appeal saving chart data
  if (dashboardData?.appealSavingChart) {
    const chart = dashboardData.appealSavingChart;
    const keys: (keyof AppealSavingChart)[] = ["company", "state", "property", "county", "assessor"];
    keys.forEach((key) => {
      if (chart[key]) {
        chart[key].forEach((item: AppealSavingChartData) => {
          if (item.year) years.add(item.year);
        });
      }
    });
  }

  return Array.from(years).sort();
}

// Filter helper - checks if item matches filter criteria
function matchesFilter(
  value: string | number | undefined,
  filterValues: string[]
): boolean {
  if (!filterValues || filterValues.length === 0) return true;
  if (!value) return false;

  const valueStr = String(value).toLowerCase().trim();
  return filterValues.some(
    (filter) => filter.toLowerCase().trim() === valueStr
  );
}

// Filter dashboard data based on selected filters
export function filterDashboardData(
  rawDashboardData: DashboardData,
  filters: DashboardFilters
) {
  const dashboardData = JSON.parse(JSON.stringify(rawDashboardData));

  // Filter savings by state
  if (dashboardData.savingsByState && filters.states.length > 0) {
    dashboardData.savingsByState = dashboardData.savingsByState.filter(
      (item: SavingsByState) => matchesFilter(item.state, filters.states)
    );
  }

  // Filter account data by properties
  if (dashboardData.totalAccountsData && filters.properties.length > 0) {
    dashboardData.totalAccountsData = dashboardData.totalAccountsData.filter(
      (item: AccountData) => matchesFilter(item.type, filters.properties)
    );
  }

  // Filter appeal saving chart data by year
  if (dashboardData.appealSavingChart && filters.years.length > 0) {
    const chart = dashboardData.appealSavingChart;
    const keys: (keyof AppealSavingChart)[] = ["company", "state", "property", "county", "assessor"];
    keys.forEach((key) => {
      if (chart[key]) {
        chart[key] = chart[key].filter((item: AppealSavingChartData) =>
          matchesFilter(item.year, filters.years)
        );
      }
    });
  }

  return {
    dashboardData,
  };
}

// Count active filters (excluding default year)
export function getActiveFilterCount(filters: DashboardFilters): number {
  let count = 0;

  if (filters.clients.length > 0) count += filters.clients.length;
  if (filters.owners.length > 0) count += filters.owners.length;
  if (filters.properties.length > 0) count += filters.properties.length;
  if (filters.states.length > 0) count += filters.states.length;
  if (filters.counties.length > 0) count += filters.counties.length;

  // Only count years if it's not the default (2025)
  if (filters.years.length > 0 && !(filters.years.length === 1 && filters.years[0] === "2025")) {
    count += 1;
  }

  return count;
}
