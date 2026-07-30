// Metric types
export interface Metric {
  id: number;
  title: string;
  value: number;
  breakdown?: {
    appeals?: number;
    payments?: number;
    both?: number;
  };
}

// Notice and Appeals types
export interface NoticeAndAppealsMetrics {
  awaitingNotice: number;
  noticeReceived: number;
  toBeResolved: number;
  taxableReduction: number;
  fmvReduction: number;
  appealSavings: number;
}

// Account types
export interface AccountData {
  id: number;
  type: string;
  value: number;
}

// Appeals Overview types
export interface AppealItem {
  name: string;
  count: number;
}

export interface AppealSection {
  title: string;
  items: AppealItem[];
}

export interface AppealsOverview {
  detailedOverview: AppealSection[];
  simpleOverview: { title: string; count: number }[];
}

// Savings by State types
export interface SavingsByState {
  state: string;
  savings: number;
  properties: number;
  accounts: number;
  [key: string]: string | number;
}

// BPP Rendered Values types
export interface BppRenderedValue {
  state: string;
  rendered: number;
  notRendered: number;
}

// Appeal Saving Chart types
export interface AppealSavingChartData {
  year: string;
  totalInvoiceAmount: number;
  numberOfClients: number;
}

export interface AppealSavingChart {
  company: AppealSavingChartData[];
  state: AppealSavingChartData[];
  property: AppealSavingChartData[];
  county: AppealSavingChartData[];
  assessor: AppealSavingChartData[];
}
