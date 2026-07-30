"use client";

import * as React from "react";
import { Card } from "@/components/commonComponents/Card";

// Types
interface AppealItem {
  name: string;
  count: number;
}

interface AppealSection {
  title: string;
  items: AppealItem[];
}

interface AppealsOverviewProps {
  detailedOverview: AppealSection[];
  simpleOverview: { title: string; count: number }[];
}

// Constants
const SECTION_CLASSES = {
  progress: "bg-blue-50 dark:bg-blue-950 rounded-lg p-6",
  finalized: "bg-green-50 dark:bg-green-950 rounded-lg p-6",
  simple: "border border-border rounded-lg p-6",
} as const;

const TITLE_CLASSES = "text-sm font-medium text-foreground";
const COUNT_CLASSES = "text-xl font-bold";
const ITEM_CLASSES = "flex items-center justify-between";
const TEXT_CLASSES = {
  primary: "text-sm text-muted-foreground",
  secondary: "text-sm font-medium text-foreground",
} as const;

// Helper functions
const calculateTotal = (items: AppealItem[]): number => 
  items.reduce((sum, item) => sum + item.count, 0);

// Memoized sub-components
const AppealItemList: React.FC<{ items: AppealItem[] }> = React.memo(({ items }) => (
  <div className="space-y-2 2xl:space-y-3">
    {items.map((item, index) => (
      <div key={`${item.name}-${index}`} className={ITEM_CLASSES}>
        <span className={TEXT_CLASSES.primary}>{item.name}</span>
        <span className={TEXT_CLASSES.secondary}>{item.count.toLocaleString()}</span>
      </div>
    ))}
  </div>
));

AppealItemList.displayName = 'AppealItemList';

const BaseAppealSection: React.FC<{
  section: AppealSection;
  bgColor: string;
  textColor: string;
}> = React.memo(({ section, bgColor, textColor }) => {
  const total = React.useMemo(() => 
    calculateTotal(section.items), 
    [section.items]
  );

  return (
    <div className={bgColor}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={TITLE_CLASSES}>{section.title}</h3>
      </div>
      <p className={`${COUNT_CLASSES} ${textColor} mb-3 2xl:mb-4`}>{total.toLocaleString()}</p>
      <AppealItemList items={section.items} />
    </div>
  );
});

BaseAppealSection.displayName = 'BaseAppealSection';

const AppealProgressSection: React.FC<{ section: AppealSection }> = React.memo(({ section }) => (
  <BaseAppealSection
    section={section}
    bgColor={SECTION_CLASSES.progress}
    textColor="text-blue-600"
  />
));

AppealProgressSection.displayName = 'AppealProgressSection';

const AppealFinalizedSection: React.FC<{ section: AppealSection }> = React.memo(({ section }) => (
  <BaseAppealSection
    section={section}
    bgColor={SECTION_CLASSES.finalized}
    textColor="text-green-700 dark:text-green-500"
  />
));

AppealFinalizedSection.displayName = 'AppealFinalizedSection';

const SimpleOverviewCard: React.FC<{ title: string; count: number }> = React.memo(({ title, count }) => (
  <div className={SECTION_CLASSES.simple}>
    <h3 className={`${TITLE_CLASSES} mb-2`}>{title}</h3>
    <p className={`${COUNT_CLASSES} text-foreground`}>{count.toLocaleString()}</p>
  </div>
));

SimpleOverviewCard.displayName = 'SimpleOverviewCard';

// Section type guards
const isProgressSection = (section: AppealSection): boolean => 
  section.title === "Appeals In Progress";

// Main component
export const AppealsOverview: React.FC<AppealsOverviewProps> = React.memo(({
  detailedOverview,
  simpleOverview,
}) => {
  // Memoized section renderer
  const renderDetailedSection = React.useCallback((section: AppealSection, index: number) => {
    const Component = isProgressSection(section) 
      ? AppealProgressSection 
      : AppealFinalizedSection;
    
    return <Component key={`${section.title}-${index}`} section={section} />;
  }, []);

  return (
    <Card
      title="Appeals Overview"
      extra={
        <span className="text-sm text-muted-foreground">
          Current status of all appeals
        </span>
      }
      className="shadow"
    >
      <div className="grid lg:grid-cols-2 gap-3 2xl:gap-4md:grid-cols-2">
        {/* Detailed Overview Sections */}
        {detailedOverview.map(renderDetailedSection)}

        {/* Simple Overview Cards */}
        {simpleOverview.map((item, index) => (
          <SimpleOverviewCard 
            key={`${item.title}-${index}`} 
            title={item.title} 
            count={item.count} 
          />
        ))}
      </div>
    </Card>
  );
});

AppealsOverview.displayName = 'AppealsOverview';