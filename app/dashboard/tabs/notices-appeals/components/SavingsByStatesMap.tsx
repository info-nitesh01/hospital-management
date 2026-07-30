"use client";

import * as React from "react";
import { MapChart } from "@/components/commonComponents/charts";

interface StateSavings {
  state: string;
  savings: number;
  properties: number;
  accounts: number;
  [key: string]: string | number;
}

interface SavingsByStatesMapProps {
  data: StateSavings[];
}

export const SavingsByStatesMap: React.FC<SavingsByStatesMapProps> = ({ data }) => {
  return (
    <MapChart
      data={data}
      title="Savings By States"
      subtitle="Interactive US map showing appeal savings distribution"
      valueFieldName="savings"
      valueLabel="Savings"
    />
  );
};
