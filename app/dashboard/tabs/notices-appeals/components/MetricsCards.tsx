"use client";

import * as React from "react";
import {
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineArrowDown,
  HiOutlineScale,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import { Card } from "@/components/commonComponents/Card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/utils/commonFunctions";
import type { NoticeAndAppealsMetrics } from "../../../types";

// Types
interface MetricsCardsProps {
  metrics: NoticeAndAppealsMetrics;
}

// Sub-components
const MetricCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  iconColor?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, value, iconColor = "text-primary", action }) => (
  <Card className="shadow" showTitle={false}>
    <div className="flex items-center justify-between h-full">
      <div className="flex flex-col justify-between h-full w-full">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 ">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <p className="text-base text-muted-foreground">{title}</p>
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  </Card>
);

// Main component
export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid gap-3 2xl:gap-4 md:grid-cols-2">
      <MetricCard
        icon={HiOutlineExclamationCircle}
        title="Awaiting Notice"
        value={formatNumber(metrics.awaitingNotice)}
        iconColor="text-orange-500"
      />

      <MetricCard
        icon={HiOutlineDocumentText}
        title="Notice Received"
        value={formatNumber(metrics.noticeReceived)}
        iconColor="text-blue-500"
      />

      <MetricCard
        icon={HiOutlineExclamationTriangle}
        title="To be Resolved"
        value={formatNumber(metrics.toBeResolved)}
        iconColor="text-amber-500"
        action={
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 h-7">
            Resolve
          </Button>
        }
      />

      <MetricCard
        icon={HiOutlineArrowDown}
        title="Appeal Savings"
        value={formatCurrency(metrics.appealSavings)}
        iconColor="text-green-500"
      />

      <MetricCard
        icon={HiOutlineScale}
        title="Taxable Reduction"
        value={formatCurrency(metrics.taxableReduction)}
        iconColor="text-purple-500"
      />

      <MetricCard
        icon={HiOutlineCurrencyDollar}
        title="FMV Reduction"
        value={formatCurrency(metrics.fmvReduction)}
        iconColor="text-blue-600"
      />
    </div>
  );
};
