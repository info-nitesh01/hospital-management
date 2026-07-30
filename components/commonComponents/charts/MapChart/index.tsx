"use client";

import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import { Card } from "@/components/commonComponents/Card";
import stateMap from "@/utils/commonFunctions";

export interface MapChartDataItem {
  state: string;
  properties: number;
  accounts: number;
  [key: string]: string | number;
}

interface MapChartProps<T = MapChartDataItem> {
  data: T[];
  title: string;
  subtitle: string;
  valueFieldName: keyof T & string;
  valueLabel: string;
  className?: string;
  width?: string;
  height?: string;
}

export const MapChart = <T extends MapChartDataItem>({
  data = [],
  title,
  subtitle,
  valueFieldName,
  valueLabel,
  className = "shadow h-full",
  width = "100%",
  height = "280px",
}: MapChartProps<T>): React.ReactElement => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "none", // Disable horizontal panning/dragging
        panY: "none", // Disable vertical panning/dragging
        projection: am5map.geoAlbersUsa(),
        wheelY: "none", // Disable mouse wheel zoom
        pinchZoom: false, // Disable pinch zoom on touch devices
        maxZoomLevel: 1, // Prevent any zoom (keep at 100% scale)
        zoomLevel: 1, // Set initial zoom to 1 (no zoom)
      })
    );

    // Disable chart interactions to prevent dragging
    chart.chartContainer.set("interactive", false);

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_usaLow,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x60a5fa),
      tooltipText: `{name}\n${valueLabel}: {${valueFieldName}}\nProperties: {properties}\nAccounts: {accounts}`,
      templateField: "polygonSettings",
      interactive: true,
    });

    // Default hover state for states without data (blue)
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x3b82f6),
    });

    const dataStateCodes = data.map((state) => state.state);

    // Set default settings for all polygons
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x60a5fa), // Blue color for all states
      interactive: true,
    });

    // Customize tooltip text based on whether state has data or not
    polygonSeries.mapPolygons.template.adapters.add(
      "tooltipText",
      (text, target) => {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const dataContext = dataItem.dataContext as { id?: string };
          const stateCode = dataContext.id?.replace("US-", "") || "";

          // If state has data, show detailed information
          if (dataStateCodes.includes(stateCode)) {
            const stateData = data.find((s) => s.state === stateCode);
            if (stateData) {
              const fullStateName = stateMap[stateCode] || stateCode;
              const value = stateData[valueFieldName];
              const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
              return `${fullStateName}\n${valueLabel}: $${formattedValue}\nProperties: ${
                stateData.properties
              }\nAccounts: ${stateData.accounts}`;
            }
          } else {
            // If no data, show only capital city name
            const capital = stateMap[stateCode] || "Capital";
            return `${capital}`;
          }
        }
        return text;
      }
    );

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x3b82f6), // Darker blue on hover
    });

    // Prepare data - use state abbreviations directly as IDs
    interface MapDataPoint {
      id: string;
      name: string;
      [key: string]: string | number | { fill: am5.Color; stroke: am5.Color; strokeWidth: number };
      polygonSettings: {
        fill: am5.Color;
        stroke: am5.Color;
        strokeWidth: number;
      };
    }

    const mapData: MapDataPoint[] = [];

    data.forEach((state) => {
      // Use state abbreviation directly as ID (e.g., "TX", "CA", etc.)
      const stateId = `US-${state.state}`;

      // Get full state name
      const fullStateName = stateMap[state.state] || state.state;

      const value = state[valueFieldName];
      const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);

      mapData.push({
        id: stateId,
        name: fullStateName, // Use full state name instead of abbreviation
        [valueFieldName]: formattedValue,
        properties: state.properties,
        accounts: state.accounts,
        polygonSettings: {
          fill: am5.color("#ffcb4f"), // Yellow for states with data
          stroke: am5.color(0xffffff),
          strokeWidth: 1,
        },
      });
    });

    polygonSeries.data.setAll(mapData);

    // Apply custom hover state for states with data (darker yellow)
    polygonSeries.mapPolygons.each((polygon) => {
      const dataItem = polygon.dataItem;
      if (dataItem && dataItem.dataContext) {
        const dataContext = dataItem.dataContext as { id?: string };
        const stateCode = dataContext.id?.replace("US-", "") || "";

        // If state has data, apply darker yellow hover
        if (dataStateCodes.includes(stateCode)) {
          polygon.states.create("hover", {
            fill: am5.color("#d4a017"), // Darker yellow on hover
          });
        }
      }
    });

    // Configure tooltip with black background
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false, // Disable automatic text color
    });

    // Style the tooltip background (black)
    tooltip.get("background")?.setAll({
      fill: am5.color("#000000"),
      stroke: am5.color("#000000"),
      strokeWidth: 1,
    });

    // Style the tooltip text (white for readability on black background)
    tooltip.label.setAll({
      fill: am5.color("#ffffff"),
      fontSize: 12,
      textAlign: "left",
    });

    polygonSeries.mapPolygons.template.set("tooltip", tooltip);

    return () => {
      root.dispose();
    };
  }, [data, valueFieldName, valueLabel]);

  return (
    <Card
      title={title}
      extra={
        <div className="text-xs text-muted-foreground font-normal">
          {subtitle}
        </div>
      }
      className={className}
    >
      <div ref={chartRef} style={{ width, height }} />
    </Card>
  );
};
