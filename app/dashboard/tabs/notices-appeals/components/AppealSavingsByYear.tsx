"use client";

import * as React from "react";
import { BarChart } from "@/components/commonComponents/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHART_COLORS } from "@/utils/chartColors";
import type { AppealSavingChart, AppealSavingChartData } from "../../../types";

interface AppealSavingsByYearProps {
  data: AppealSavingChart;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AppealSavingChartData;
    value: number;
  }>;
}

export const AppealSavingsByYear: React.FC<AppealSavingsByYearProps> = ({ data }) => {
  const availableViews = React.useMemo(() => {
    return Object.keys(data).filter(
      (key) => Array.isArray(data[key as keyof AppealSavingChart]) && data[key as keyof AppealSavingChart].length > 0
    ) as (keyof AppealSavingChart)[];
  }, [data]);

  const [selectedView, setSelectedView] = React.useState<keyof AppealSavingChart>(
    availableViews[0] || "company"
  );

  const chartData = React.useMemo(() => data[selectedView] || [], [data, selectedView]);

  const getViewColor = (view: keyof AppealSavingChart): string => {
    const colorMap: Record<keyof AppealSavingChart, string> = {
      company: CHART_COLORS.palette[0],
      state: CHART_COLORS.palette[1],
      property: CHART_COLORS.palette[2],
      county: CHART_COLORS.palette[3],
      assessor: CHART_COLORS.palette[4],
    };
    return colorMap[view] || CHART_COLORS.primary;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-popover-foreground mb-2">{dataPoint.year}</p>
          <div className="space-y-1 text-sm">
            <p className="text-popover-foreground">
              Total Amount: <span className="font-medium">${payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-popover-foreground">
              Number of Clients: <span className="font-medium">{dataPoint.numberOfClients}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const extraContent = availableViews.length > 1 ? (
    <Select value={selectedView} onValueChange={(value) => setSelectedView(value as keyof AppealSavingChart)}>
      <SelectTrigger size="sm" className="w-[140px]" aria-label="Select chart view">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableViews.map((view) => (
          <SelectItem key={view} value={view}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : undefined;

  return (
    <BarChart
      data={chartData}
      title="Appeal Savings by Year"
      dataKey="totalInvoiceAmount"
      formatYAxis={formatYAxis}
      tooltipContent={CustomTooltip as React.ComponentType<{ active?: boolean; payload?: Array<{ payload: { year: string }; value: number }> }>}
      extra={extraContent}
      barColor={getViewColor(selectedView)}
    />
  );
};
