"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getChartColor } from "@/utils/chartColors";

export interface PieChartDataItem {
  id: number;
  type: string;
  value: number;
}

interface PieChartProps {
  data: PieChartDataItem[];
  title: string;
  className?: string;
}

const CustomLegend: React.FC<{ payload?: Array<{ value: string; payload: { value: number; percent: number } }> }> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="grid grid-cols-1 gap-2 text-sm">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getChartColor(index) }}
            />
            <span className="text-foreground text-[10px]">{entry.value}</span>
          </div>
          <span className="text-muted-foreground text-[10px]">
            ({entry.payload.percent.toFixed(2)}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export const PieChart: React.FC<PieChartProps> = ({ data, title, className = "shadow" }) => {
  const total = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      name: item.type,
      value: item.value,
      percent: (item.value / total) * 100,
    }));
  }, [data, total]);

  const renderCustomLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;

    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      value === undefined
    ) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={600}
      >
        {value.toLocaleString()}
      </text>
    );
  };

  return (
    <Card title={title} className={className}>
      <div className="grid md:grid-cols-[60%_1fr] gap-6 items-center">
        <div className="w-full h-[250px] 2xl:h-[280px] min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
                itemStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-semibold fill-foreground"
              >
                {total.toLocaleString()}
              </text>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-1">
          <CustomLegend payload={chartData.map((item, index) => ({
            value: item.name,
            payload: item,
            color: getChartColor(index),
          }))} />
        </div>
      </div>
    </Card>
  );
};
