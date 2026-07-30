"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/utils/chartColors";

export interface BarChartDataItem {
  year: string;
  [key: string]: string | number;
}

interface BarChartProps<T = BarChartDataItem> {
  data: T[];
  title: string;
  dataKey: string;
  className?: string;
  formatYAxis?: (value: number) => string;
  tooltipContent?: React.ComponentType<{
    active?: boolean;
    payload?: Array<{ payload: T; value: number }>;
  }>;
  showTitle?: boolean;
  extra?: React.ReactNode;
  barColor?: string;
  maxBarSize?: number;
}

const defaultFormatYAxis = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString()}`;
};

export const BarChart = <T extends { year: string }>({
  data,
  title,
  dataKey,
  className = "shadow",
  formatYAxis = defaultFormatYAxis,
  tooltipContent: CustomTooltip,
  showTitle = true,
  extra,
  barColor,
  maxBarSize,
}: BarChartProps<T>): React.ReactElement => {
  const DefaultTooltip: React.FC<{
    active?: boolean;
    payload?: Array<{ payload: T; value: number }>;
  }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-popover-foreground mb-2">{dataPoint.year}</p>
          <div className="space-y-1 text-sm">
            <p className="text-popover-foreground">
              Amount: <span className="font-medium">${payload[0].value.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const TooltipComponent = CustomTooltip || DefaultTooltip;

  return (
    <Card title={title} className={className} showTitle={showTitle} extra={extra}>
      <div className="h-[300px] 2xl:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="year"
              className="fill-muted-foreground"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tickFormatter={formatYAxis}
              className="fill-muted-foreground"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <Tooltip content={<TooltipComponent />} />
            <Bar
              dataKey={dataKey}
              fill={barColor || CHART_COLORS.primary}
              radius={[8, 8, 0, 0]}
              maxBarSize={maxBarSize}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
