"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import { LoaderCircle, MapPinned } from "lucide-react";

import type { Area } from "@/lib/domain";
import type { ForecastResult } from "@/lib/forecast";
import { areasToFeatureCollection } from "@/lib/map-geometry";
import { italyOutline } from "@/lib/italy-outline";
import { ForecastMapFallback } from "@/components/forecast-map-fallback";

const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/liberty";

setWorkerUrl("/maplibre-gl-worker.mjs");

export function ForecastMap({
  areas,
  forecasts,
  selectedId,
  onSelect,
}: {
  areas: Area[];
  forecasts: ForecastResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const features = useMemo(
    () => areasToFeatureCollection(areas, forecasts),
    [areas, forecasts],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const initialFeaturesRef = useRef(features);
  const initialSelectedIdRef = useRef(selectedId);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = new MapLibreMap({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [12.55, 42.4],
        zoom: 4.55,
        minZoom: 4,
        maxZoom: 14,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(
        new NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.addControl(
        new AttributionControl({ compact: true }),
        "bottom-right",
      );

      map.on("load", () => {
        map.addSource("italy-outline", {
          type: "geojson",
          data: JSON.parse(JSON.stringify(italyOutline)),
        });
        map.addLayer({
          id: "italy-outline-fill",
          type: "fill",
          source: "italy-outline",
          paint: {
            "fill-color": "#f4f7f2",
            "fill-opacity": 0.62,
          },
        });
        map.addLayer({
          id: "italy-outline-line",
          type: "line",
          source: "italy-outline",
          paint: {
            "line-color": "#315d3c",
            "line-width": 2.2,
            "line-opacity": 0.88,
          },
        });
        map.addSource("forecast-areas", {
          type: "geojson",
          data: initialFeaturesRef.current,
        });
        map.addLayer({
          id: "forecast-area-fill",
          type: "fill",
          source: "forecast-areas",
          paint: {
            "fill-color": [
              "match",
              ["get", "recommendation"],
              "Vai ora",
              "#1f8a45",
              "Possibile",
              "#e5a323",
              "#89948a",
            ],
            "fill-opacity": [
              "match",
              ["get", "confidence"],
              "high",
              0.72,
              "medium",
              0.58,
              0.42,
            ],
          },
        });
        map.addLayer({
          id: "forecast-area-outline",
          type: "line",
          source: "forecast-areas",
          paint: {
            "line-color": "#123d23",
            "line-width": 1.5,
            "line-opacity": 0.78,
          },
        });
        map.addLayer({
          id: "forecast-area-selected",
          type: "line",
          source: "forecast-areas",
          filter: ["==", ["get", "id"], initialSelectedIdRef.current],
          paint: {
            "line-color": "#ffffff",
            "line-width": 4,
          },
        });
        map.on("click", "forecast-area-fill", (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") onSelectRef.current(id);
        });
        map.on("mouseenter", "forecast-area-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "forecast-area-fill", () => {
          map.getCanvas().style.cursor = "";
        });
        map.fitBounds([[6.25, 35.2], [19.25, 47.4]], {
          padding: 26,
          duration: 0,
        });
        setStatus("ready");
      });
      map.on("error", (event) => {
        console.error("maplibre_runtime_error", event.error);
      });
      const timeout = window.setTimeout(() => {
        if (!map.isStyleLoaded()) setStatus("error");
      }, 8000);

      return () => {
        window.clearTimeout(timeout);
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error("maplibre_initialization_failed", error);
      queueMicrotask(() => setStatus("error"));
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("forecast-areas") as GeoJSONSource | undefined;
    source?.setData(features);
  }, [features]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setFilter("forecast-area-selected", ["==", ["get", "id"], selectedId]);
    const area = areas.find((entry) => entry.id === selectedId);
    if (area) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.easeTo({
        center: [area.center[1], area.center[0]],
        zoom: Math.max(map.getZoom(), 7),
        duration: reduceMotion ? 0 : 500,
      });
    }
  }, [areas, selectedId]);

  return (
    <div
      className="relative h-full min-h-[360px] w-full overflow-hidden bg-[#dce8d9]"
      role="region"
      aria-label="Mappa delle condizioni favorevoli per i funghi"
    >
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && (
        <div
          className="absolute inset-0 grid place-items-center bg-[#edf3eb]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-[#315d3c] shadow">
            <LoaderCircle className="size-5 animate-spin" />
            Caricamento mappa
          </div>
        </div>
      )}
      {status === "error" && (
        <ForecastMapFallback areas={areas} forecasts={forecasts} selectedId={selectedId} onSelect={onSelect} />
      )}
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-white/80 bg-white/92 px-3 py-2 shadow-md backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-black">
          <MapPinned className="size-4 text-[#27683a]" />
          Aree vaste · celle H3 aggregate
        </div>
        <div className="mt-0.5 text-xs text-[#617266]">
          Nessun punto personale visibile
        </div>
      </div>
    </div>
  );
}
