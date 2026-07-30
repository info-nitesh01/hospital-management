"use client";

import * as React from "react";
import { PieChart } from "@/components/commonComponents/charts";
import type { AccountData } from "../../../types";

interface TotalAccountsChartProps {
  data: AccountData[];
}

export const TotalAccountsChart: React.FC<TotalAccountsChartProps> = ({ data }) => {
  return <PieChart data={data} title="Total Accounts" />;
};
