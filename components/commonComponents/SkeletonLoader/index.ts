/**
 * Skeleton Loader - Export Module
 * Provides dynamic skeleton loaders for loading states
 */

export { SkeletonLoader, useSkeletonLoader } from "./SkeletonLoader";

export {
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
  HeaderSkeleton,
  StatsSkeleton,
  ChartSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  DataTableSkeleton,
  PageSkeleton,
} from "./variants";

export type {
  SkeletonVariant,
  SkeletonConfig,
  CardSkeletonConfig,
  TableSkeletonConfig,
  ListSkeletonConfig,
  FormSkeletonConfig,
  StatsSkeletonConfig,
  ChartSkeletonConfig,
  AnySkeletonConfig,
} from "./types";
