import { cellToBoundary, latLngToCell } from "h3-js";

import { getVisitPressure, type Area, type VisitPressure } from "./domain.ts";
import type { ForecastConfidence, ForecastRecommendation, ForecastResult } from "./forecast.ts";

export type PublicAreaProperties = {
  id: string;
  h3Index: string;
  name: string;
  region: string;
  score: number;
  recommendation: ForecastRecommendation;
  confidence: ForecastConfidence;
  pressureBand: VisitPressure | "non-monitorata";
  habitat: string[];
};

export type PublicAreaFeature = {
  type: "Feature";
  id: string;
  properties: PublicAreaProperties;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
};

export type PublicAreaFeatureCollection = {
  type: "FeatureCollection";
  features: PublicAreaFeature[];
};

export function areaToPublicFeature(
  area: Area,
  forecast: ForecastResult,
): PublicAreaFeature {
  const h3Index = latLngToCell(area.center[0], area.center[1], 5);
  const boundary = cellToBoundary(h3Index).map(([latitude, longitude]) => [
    longitude,
    latitude,
  ]);
  boundary.push([...boundary[0]]);

  return {
    type: "Feature",
    id: area.id,
    properties: {
      id: area.id,
      h3Index,
      name: area.name,
      region: area.region,
      score: forecast.score,
      recommendation: forecast.recommendation,
      confidence: forecast.confidence,
      pressureBand: area.signalProvenance === "measured" ? getVisitPressure(area.delayedVisitors) : "non-monitorata",
      habitat: [...area.habitat],
    },
    geometry: {
      type: "Polygon",
      coordinates: [boundary],
    },
  };
}

export function areasToFeatureCollection(
  areas: Area[],
  forecasts: ForecastResult[],
): PublicAreaFeatureCollection {
  const byArea = new Map(forecasts.map((forecast) => [forecast.areaId, forecast]));
  return {
    type: "FeatureCollection",
    features: areas.flatMap((area) => {
      const forecast = byArea.get(area.id);
      return forecast ? [areaToPublicFeature(area, forecast)] : [];
    }),
  };
}
