"use client";

import { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  county?: string | null;
  state?: string | null;
  zip?: string | null;
}

// Geocoding function using Nominatim (OpenStreetMap)
async function geocodeLocation(
  city?: string | null,
  county?: string | null,
  state?: string | null,
  zip?: string | null
): Promise<{ lat: number; lon: number } | null> {
  try {
    // Build query in priority order: city > county > state
    let query = "";
    if (city && state) {
      query = `${city}, ${state}`;
    } else if (county && state) {
      query = `${county}, ${state}`;
    } else if (state) {
      query = state;
    }

    if (!query) return null;

    // Add zip if available for better accuracy
    if (zip) {
      query += `, ${zip}`;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "ClientPortalApp/1.0",
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function LocationMap({
  latitude,
  longitude,
  address,
  city,
  county,
  state,
  zip,
}: LocationMapProps) {
  const chartRef = useRef<am5.Root | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapState, setMapState] = useState<{
    finalLat: number;
    finalLon: number;
    zoomLevel: number;
  } | null>(null);

  // Geocode if lat/long not available
  useEffect(() => {
    if (!latitude || !longitude) {
      setIsGeocoding(true);
      geocodeLocation(city, county, state, zip).then((coords) => {
        setGeocodedCoords(coords);
        setIsGeocoding(false);
      });
    }
  }, [latitude, longitude, city, county, state, zip]);

  useEffect(() => {
    if (isGeocoding) return;

    // Determine which coordinates to use
    const finalLat = latitude || geocodedCoords?.lat;
    const finalLon = longitude || geocodedCoords?.lon;

    // Don't render map without coordinates
    if (!finalLat || !finalLon) {
      return;
    }

    // Create root
    const root = am5.Root.new("locationMap");

    // Set themes
    root.setThemes([]);

    // Create map chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
      })
    );

    // Create polygon series for world map
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0xe5e7eb),
      fillOpacity: 0.7,
      stroke: am5.color(0xffffff),
      strokeWidth: 1,
    });

    // Add point series for marker
    const pointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );

    pointSeries.bullets.push(function () {
      const circle = am5.Circle.new(root, {
        radius: 8,
        fill: am5.color(0xef4444),
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
        tooltipText: [address, city, county, state, zip]
          .filter(Boolean)
          .join(", "),
      });

      return am5.Bullet.new(root, {
        sprite: circle,
      });
    });

    // Add location point
    pointSeries.data.setAll([
      {
        geometry: { type: "Point", coordinates: [finalLon, finalLat] },
      },
    ]);

    // Determine zoom level based on available location data
    let zoomLevel = 8;
    if (!latitude && geocodedCoords) {
      // Less zoom for geocoded locations
      if (city) {
        zoomLevel = 6;
      } else if (county) {
        zoomLevel = 5;
      } else if (state) {
        zoomLevel = 4;
      }
    }

    // Store map state for recenter functionality
    setMapState({
      finalLat,
      finalLon,
      zoomLevel,
    });

    // Zoom to location with animation
    chart.goHome(0);
    setTimeout(() => {
      chart.zoomToGeoPoint(
        { latitude: finalLat, longitude: finalLon },
        zoomLevel,
        true,
        1000
      );
    }, 100);

    chartRef.current = root;

    return () => {
      root.dispose();
    };
  }, [
    latitude,
    longitude,
    address,
    city,
    county,
    state,
    zip,
    geocodedCoords,
    isGeocoding,
  ]);

  const finalLat = latitude || geocodedCoords?.lat;
  const finalLon = longitude || geocodedCoords?.lon;

  const handleRecenter = () => {
    if (!chartRef.current || !mapState) return;

    const chart = chartRef.current.container.children.getIndex(0) as am5map.MapChart;
    if (chart) {
      chart.zoomToGeoPoint(
        { latitude: mapState.finalLat, longitude: mapState.finalLon },
        mapState.zoomLevel,
        true,  // animated
        1000   // duration in ms
      );
    }
  };

  return (
    <div className="relative w-full h-[300px] rounded-md border">
      {isGeocoding && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
      {!isGeocoding && !finalLat && !finalLon && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-sm text-muted-foreground">Location not available</div>
        </div>
      )}
      {mapState && !isGeocoding && finalLat && finalLon && (
        <button
          onClick={handleRecenter}
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Recenter map"
          title="Recenter map to location"
        >
          <HiOutlineArrowPath className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <div id="locationMap" className="w-full h-full" />
    </div>
  );
}
