"use client";

import React from "react";
import { Card } from "@/components/commonComponents/Card";
import { BarChart } from "@/components/commonComponents/charts";
import { CardSkeleton } from "@/components/commonComponents/SkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { getClientGraphData } from "@/lib/api/clients";
import type { ApiError } from "@/lib/api/global-types";
import type { GraphDataPoint } from "@/lib/api/clients/types";

interface FmvChartCardProps {
  clientId: string;
}

export const FmvChartCard: React.FC<FmvChartCardProps> = ({ clientId }) => {
  const {
    data: graphData,
    isLoading,
    error,
    refetch,
  } = useQuery<GraphDataPoint[], ApiError>({
    queryKey: ["client-graph-data", clientId],
    queryFn: () => getClientGraphData(clientId),
    enabled: !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  });

  if (isLoading) {
    return <CardSkeleton lines={8} />;
  }

  if (error || !graphData || graphData.length === 0) {
    return (
      <Card className="shadow">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {error ? "Failed to load FMV data" : "No FMV data available"}
          </p>
          {error && (
            <button
              onClick={() => refetch()}
              className="text-xs text-primary hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <BarChart
      data={graphData}
      title=""
      dataKey="fmv"
      className="shadow"
      showTitle={false}
    />
  );
};
