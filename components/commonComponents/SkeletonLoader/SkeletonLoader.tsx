/**
 * Dynamic Skeleton Loader
 * Generates skeleton loaders based on configuration
 */

import {
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
  HeaderSkeleton,
  StatsSkeleton,
  ChartSkeleton,
  TextSkeleton,
  AvatarSkeleton,
} from "./variants";
import {
  AnySkeletonConfig,
  CardSkeletonConfig,
  TableSkeletonConfig,
  ListSkeletonConfig,
  FormSkeletonConfig,
  StatsSkeletonConfig,
  ChartSkeletonConfig,
} from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  config: AnySkeletonConfig | AnySkeletonConfig[];
  className?: string;
}

/**
 * Main Skeleton Loader Component
 * Dynamically renders skeletons based on configuration
 */
export function SkeletonLoader({ config, className }: SkeletonLoaderProps) {
  // Handle array of configs
  if (Array.isArray(config)) {
    return (
      <div className={className}>
        {config.map((cfg, index) => (
          <SkeletonLoader key={index} config={cfg} />
        ))}
      </div>
    );
  }

  // Render based on variant
  switch (config.variant) {
    case "card":
      const cardConfig = config as CardSkeletonConfig;
      return (
        <CardSkeleton
          showImage={cardConfig.showImage}
          showAvatar={cardConfig.showAvatar}
          lines={cardConfig.lines}
          className={config.className}
        />
      );

    case "table":
      const tableConfig = config as TableSkeletonConfig;
      return (
        <TableSkeleton
          rows={tableConfig.rows}
          columns={tableConfig.columns}
          showHeader={tableConfig.showHeader}
          className={config.className}
        />
      );

    case "list":
      const listConfig = config as ListSkeletonConfig;
      return (
        <ListSkeleton
          items={listConfig.items}
          showAvatar={listConfig.showAvatar}
          lines={listConfig.lines}
          className={config.className}
        />
      );

    case "form":
      const formConfig = config as FormSkeletonConfig;
      return <FormSkeleton fields={formConfig.fields} className={config.className} />;

    case "header":
      return <HeaderSkeleton className={config.className} />;

    case "stats":
      const statsConfig = config as StatsSkeletonConfig;
      return <StatsSkeleton cards={statsConfig.cards} className={config.className} />;

    case "chart":
      const chartConfig = config as ChartSkeletonConfig;
      return <ChartSkeleton height={chartConfig.height} className={config.className} />;

    case "text":
      return <TextSkeleton className={config.className} />;

    case "avatar":
      return <AvatarSkeleton className={config.className} />;

    case "custom":
    default:
      return <Skeleton className={config.className} />;
  }
}

/**
 * Hook for conditional skeleton rendering
 */
export function useSkeletonLoader(isLoading: boolean, config: AnySkeletonConfig) {
  if (!isLoading) return null;
  return <SkeletonLoader config={config} />;
}
