"use client";

import * as React from "react";
import { MetricsCards } from "./components/MetricsCards";
import { TotalAccountsChart } from "./components/TotalAccountsChart";
import { AppealsOverview } from "./components/AppealsOverview";
import { AppealSavingsByYear } from "./components/AppealSavingsByYear";
import { SavingsByStatesMap } from "./components/SavingsByStatesMap";
import { TopStatesBySavings } from "./components/TopStatesBySavings";
import { BppRenderedValues } from "./components/BppRenderedValues";
import type { NoticeAndAppealsMetrics, AccountData, AppealsOverview as AppealsOverviewType, AppealSavingChart, SavingsByState, BppRenderedValue } from "../../types";

// Types
interface NoticesAppealsTabProps {
  noticeAndAppealsMetrics: NoticeAndAppealsMetrics;
  totalAccountsData: AccountData[];
  appealsOverview: AppealsOverviewType;
  appealSavingChart: AppealSavingChart;
  savingsByState: SavingsByState[];
  bppRenderedValues: BppRenderedValue[];
}

export function NoticesAppealsTab({
  noticeAndAppealsMetrics,
  totalAccountsData,
  appealsOverview,
  appealSavingChart,
  savingsByState,
  bppRenderedValues,
}: NoticesAppealsTabProps) {
  return (
    <div className="space-y-4">
      {/* First Row - Metrics Cards and Donut Chart */}
      <div className="grid lg:grid-cols-2 gap-3 2xl:gap-4">
        <MetricsCards metrics={noticeAndAppealsMetrics} />
        <TotalAccountsChart data={totalAccountsData} />
      </div>

      {/* Second Row - Appeals Overview and Bar Chart */}
      <div className="grid lg:grid-cols-2 gap-3 2xl:gap-4">
        <AppealsOverview
          detailedOverview={appealsOverview.detailedOverview}
          simpleOverview={appealsOverview.simpleOverview}
        />
        <AppealSavingsByYear data={appealSavingChart} />
      </div>

      {/* Third Row - Savings by States */}
      <div className="grid lg:grid-cols-2 2xl:grid-cols-[40%_1fr_1fr] gap-3 2xl:gap-4">
        <SavingsByStatesMap data={savingsByState} />
        <TopStatesBySavings data={savingsByState} />
        <BppRenderedValues data={bppRenderedValues} />
      </div>
    </div>
  );
}
