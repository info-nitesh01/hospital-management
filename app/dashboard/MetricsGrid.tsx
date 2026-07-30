"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";
import { formatCurrency, formatNumber } from "@/utils/commonFunctions";
import type { Metric } from "./types";

// Types
interface MetricsGridProps {
  metrics: Metric[];
}

// Helper to extract metrics
const getMetric = (metrics: Metric[], id: number): Metric | undefined => {
  return metrics.find((m) => m.id === id);
};

const getMetricValue = (metrics: Metric[], id: number): number => {
  return metrics.find((m) => m.id === id)?.value || 0;
};

// Sub-components
const ClientsCard: React.FC<{
  clientMetric: Metric;
}> = ({ clientMetric }) => {
  const { value, breakdown } = clientMetric;
  const appeals = breakdown?.appeals || 0;
  const payments = breakdown?.payments || 0;
  const both = breakdown?.both || 0;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-base text-muted-foreground">Clients</p>
      <p className="text-xl font-bold text-foreground">{formatNumber(value)}</p>
      <p className="text-sm text-muted-foreground space-x-3">
        <span className="font-medium">{formatNumber(appeals)} Appeals</span>
        <span className="font-medium">{formatNumber(payments)} Payments</span>
        <span className="font-medium">{formatNumber(both)} Both</span>
      </p>
    </div>
  );
};

const AccountsCard: React.FC<{
  accountMetric: Metric;
}> = ({ accountMetric }) => {
  const { value, breakdown } = accountMetric;
  const appeals = breakdown?.appeals || 0;
  const payments = breakdown?.payments || 0;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-base text-muted-foreground">Accounts</p>
      <p className="text-xl font-bold text-foreground">{formatNumber(value)}</p>
      <p className="text-sm text-muted-foreground space-x-3">
        <span className="font-medium">{formatNumber(appeals)} Appeals</span> 
        <span className="font-medium">{formatNumber(payments)} Payments</span>
      </p>
    </div>
  );
};

const FinancialMetricsCard: React.FC<{
  taxSavings: number;
  billAmount: number;
  estimatedTax: number;
  actualTax: number;
}> = ({ taxSavings, billAmount, estimatedTax, actualTax }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      <div className="flex flex-col gap-3 justify-between h-full">
        <p className="text-base text-muted-foreground">Tax Savings</p>
        <p className="text-xl font-semibold text-green-700 dark:text-green-500">{formatCurrency(taxSavings)}</p>
      </div>
      <div className="flex flex-col gap-3 justify-between h-full">
        <p className="text-base text-muted-foreground">Bill Amount</p>
        <p className="text-xl font-semibold text-foreground">{formatCurrency(billAmount)}</p>
      </div>
      <div className="flex flex-col gap-3 justify-between h-full">
        <p className="text-base text-muted-foreground">Estimated Tax</p>
        <p className="text-xl font-semibold text-foreground">{formatCurrency(estimatedTax)}</p>
      </div>
      <div className="flex flex-col gap-3 justify-between h-full">
        <p className="text-base text-muted-foreground">Actual Tax</p>
        <p className="text-xl font-semibold text-foreground">{formatCurrency(actualTax)}</p>
      </div>
    </div>
  );
};

// Main component
export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const clientMetric = getMetric(metrics, 1);
  const accountMetric = getMetric(metrics, 3);
  const taxSavings = getMetricValue(metrics, 4);
  const billAmount = getMetricValue(metrics, 5);
  const estimatedTax = getMetricValue(metrics, 6);
  const actualTax = getMetricValue(metrics, 7);

  // Fallback if metrics are not found
  if (!clientMetric || !accountMetric) {
    return null;
  }

  return (
    <div className="grid gap-3 2xl:gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-3">
      {/* Clients Card */}
      <Card className="shadow" showTitle={false}>
        <ClientsCard clientMetric={clientMetric} />
      </Card>

      {/* Accounts Card */}
      <Card className="shadow" showTitle={false}>
        <AccountsCard accountMetric={accountMetric} />
      </Card>

      {/* Financial Metrics Card */}
      <Card className="shadow lg:col-span-2 2xl:col-span-1" showTitle={false}>
        <FinancialMetricsCard
          taxSavings={taxSavings}
          billAmount={billAmount}
          estimatedTax={estimatedTax}
          actualTax={actualTax}
        />
      </Card>
    </div>
  );
};
