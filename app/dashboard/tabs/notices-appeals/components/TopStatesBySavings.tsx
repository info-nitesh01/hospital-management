"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import { formatCurrency, formatNumber, STATE_NAMES } from "@/utils/commonFunctions";
import type { SavingsByState } from "../../../types";

// Types
interface TopStatesBySavingsProps {
  data: SavingsByState[];
}

// Sub-component for each state row
const StateRow: React.FC<{ state: SavingsByState }> = React.memo(
  ({ state }) => (
    <div className="border-b border-border py-2 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-foreground">
          {STATE_NAMES[state.state] || state.state}
        </h3>
        <p className="text-xl font-semibold text-foreground">
          {formatCurrency(state.savings)}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {formatNumber(state.properties)} properties
        </span>
        <span className="text-blue-600">
          {formatNumber(state.accounts)} accounts
        </span>
      </div>
    </div>
  )
);

StateRow.displayName = "StateRow";

// Main component
export const TopStatesBySavings: React.FC<TopStatesBySavingsProps> = ({ data }) => {
  const sortedStates = React.useMemo(() => {
    return [...data]
      .filter((state) => state.savings > 0) // Only show states with savings > $0
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 5);
  }, [data]);

  return (
    <Card title="Top States by Savings" className="shadow">
      {sortedStates.length > 0 ? (
        <div>
          {sortedStates.map((state) => (
            <StateRow key={state.state} state={state} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No states with savings data available</p>
        </div>
      )}
    </Card>
  );
};
