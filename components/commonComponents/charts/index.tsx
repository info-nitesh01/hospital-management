"use client";

import dynamic from "next/dynamic";

// Dynamic BarChart with loading state
export const BarChart = dynamic(
  () => import("./BarChart").then((m) => m.BarChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border bg-card shadow p-4">
        <div className="h-[300px] 2xl:h-[350px] flex items-center justify-center">
          <div className="custom-loader text-muted-foreground" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    ),
  }
);

// Dynamic PieChart with loading state
export const PieChart = dynamic(
  () => import("./PieChart").then((m) => m.PieChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border bg-card shadow p-4">
        <div className="h-[250px] 2xl:h-[280px] flex items-center justify-center">
          <div className="custom-loader text-muted-foreground" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    ),
  }
);

// Dynamic MapChart with loading state
export const MapChart = dynamic(
  () => import("./MapChart").then((m) => m.MapChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border bg-card shadow h-full p-4">
        <div className="h-[280px] flex items-center justify-center">
          <div className="custom-loader text-muted-foreground" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    ),
  }
);
