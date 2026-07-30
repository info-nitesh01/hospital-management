// Centralized chart color configuration
// Use these colors consistently across all charts in the application

export const CHART_COLORS = {
  // Primary color palette for pie charts, bar charts, etc.
  palette: [
    "#06B6D4", // cyan-500
    "#14B8A6", // teal-500
    "#10B981", // green-500
    "#A855F7", // purple-500
    "#F97316", // orange-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#3B82F6", // blue-500
    "#22C55E", // green-600
  ],

  // Single bar chart color
  primary: "#3B82F6", // blue-500

  // Badge colors for Top 5 lists (light backgrounds with dark text)
  badges: [
    { bg: "#FEF3C7", text: "#92400E" }, // yellow-100 / yellow-800
    { bg: "#F3F4F6", text: "#1F2937" }, // gray-100 / gray-800
    { bg: "#FED7AA", text: "#9A3412" }, // orange-100 / orange-800
    { bg: "#DBEAFE", text: "#1E40AF" }, // blue-100 / blue-800
    { bg: "#E9D5FF", text: "#6B21A8" }, // purple-100 / purple-800
  ],

  // Tailwind classes for badges (for use with className)
  badgeClasses: [
    "bg-yellow-100 text-yellow-800",
    "bg-gray-100 text-gray-800",
    "bg-orange-100 text-orange-800",
    "bg-blue-100 text-blue-800",
    "bg-purple-100 text-purple-800",
  ],
};

// Helper function to get a color from the palette by index
export const getChartColor = (index: number): string => {
  return CHART_COLORS.palette[index % CHART_COLORS.palette.length];
};

// Helper function to get badge color by index
export const getBadgeColor = (index: number) => {
  return CHART_COLORS.badges[index % CHART_COLORS.badges.length];
};

// Helper function to get badge class by index
export const getBadgeClass = (index: number): string => {
  return CHART_COLORS.badgeClasses[index % CHART_COLORS.badgeClasses.length];
};
