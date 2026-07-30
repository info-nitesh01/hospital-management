"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import { formatNumber, STATE_NAMES } from "@/utils/commonFunctions";
import type { BppRenderedValue } from "../../../types";

// Types
interface BppRenderedValuesProps {
  data: BppRenderedValue[];
}

// Sub-component for state row
const StateRow: React.FC<{ state: BppRenderedValue }> = React.memo(
  ({ state }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <span className="text-sm font-medium text-foreground">
        {STATE_NAMES[state.state] || state.state}
      </span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-sm font-semibold text-green-700 dark:text-green-500">
            {formatNumber(state.rendered)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-sm font-semibold text-red-700 dark:text-red-500">
            {formatNumber(state.notRendered)}
          </span>
        </div>
      </div>
    </div>
  )
);

StateRow.displayName = "StateRow";

// Main component
export const BppRenderedValues: React.FC<BppRenderedValuesProps> = ({ data }) => {
  // Calculate totals
  const totals = React.useMemo(() => {
    return data.reduce(
      (acc, state) => ({
        rendered: acc.rendered + state.rendered,
        notRendered: acc.notRendered + state.notRendered,
      }),
      { rendered: 0, notRendered: 0 }
    );
  }, [data]);

  return (
    <Card
      title="BPP Rendered Values"
      extra={
        <span className="text-xs text-muted-foreground">By State</span>
      }
      className="shadow"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Rendered</p>
          <p className="text-xl font-semibold text-green-700 dark:text-green-500">
            {formatNumber(totals.rendered)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Not Rendered</p>
          <p className="text-xl font-semibold text-red-700 dark:text-red-500">
            {formatNumber(totals.notRendered)}
          </p>
        </div>
      </div>

      {/* State List */}
      <div>
        {data.map((state) => (
          <StateRow key={state.state} state={state} />
        ))}
      </div>
    </Card>
  );
};
