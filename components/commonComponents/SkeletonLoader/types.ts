/**
 * Skeleton Loader Types
 * Defines the structure and configuration for dynamic skeleton loaders
 */

export type SkeletonVariant =
  | "card"
  | "table"
  | "list"
  | "form"
  | "header"
  | "stats"
  | "chart"
  | "text"
  | "avatar"
  | "custom";

export interface SkeletonConfig {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
  animate?: boolean;
}

export interface CardSkeletonConfig extends SkeletonConfig {
  variant: "card";
  showImage?: boolean;
  showAvatar?: boolean;
  lines?: number;
}

export interface TableSkeletonConfig extends SkeletonConfig {
  variant: "table";
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export interface ListSkeletonConfig extends SkeletonConfig {
  variant: "list";
  items?: number;
  showAvatar?: boolean;
  lines?: number;
}

export interface FormSkeletonConfig extends SkeletonConfig {
  variant: "form";
  fields?: number;
}

export interface StatsSkeletonConfig extends SkeletonConfig {
  variant: "stats";
  cards?: number;
}

export interface ChartSkeletonConfig extends SkeletonConfig {
  variant: "chart";
  height?: number;
}

export type AnySkeletonConfig =
  | CardSkeletonConfig
  | TableSkeletonConfig
  | ListSkeletonConfig
  | FormSkeletonConfig
  | StatsSkeletonConfig
  | ChartSkeletonConfig
  | SkeletonConfig;
