"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, Map as MapLibreMap, NavigationControl, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import { LoaderCircle, MapPinned } from "lucide-react";
import type { Area } from "@/lib/domain";
import type { ForecastResult } from "@/lib/forecast";
import { areasToFeatureCollection } from "@/lib/map-geometry";
import { italyOutline } from "@/lib/italy-outline";
import { ForecastMapFallback } from "@/components/forecast-map-fallback";
const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/liberty";
setWorkerUrl("/maplibre-gl-worker.mjs");
export function ForecastMap({ areas, forecasts, selectedId, onSelect }: { areas: Area[]; forecasts: ForecastResult[]; selectedId: string; onSelect: (id: string) => void; }) {
  const features = useMemo(() => areasToFeatureCollection(areas, forecasts), [areas, forecasts]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const initialFeaturesRef = useRef(features);
  const initialSelectedIdRef = useRef(selectedId);
  const [attempt, setAttempt] = useState(0);
  const [accessibleView, setAccessibleView] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    onSelectRef.current = onSelect;
    initialFeaturesRef.current = features;
    initialSelectedIdRef.current = selectedId;
  }, [onSelect, features, selectedId]);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let loaded = false;
    let active = true;
    let observer: ResizeObserver | undefined;
    try {
      const map = new MapLibreMap({ container: containerRef.current, style: MAP_STYLE_URL, center: [12.55, 42.4], zoom: 4.55, minZoom: 4, maxZoom: 14, attributionControl: false });
      mapRef.current = map;
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new AttributionControl({ compact: true }), "bottom-right");
      map.on("load", () => {
        if (!active) return;
        try {
          map.addSource("italy-outline", { type: "geojson", data: JSON.parse(JSON.stringify(italyOutline)) });
          map.addLayer({ id: "italy-outline-fill", type: "fill", source: "italy-outline", paint: { "fill-color": "#f4f7f2", "fill-opacity": 0.62 } });
          map.addLayer({ id: "italy-outline-line", type: "line", source: "italy-outline", paint: { "line-color": "#315d3c", "line-width": 2.2, "line-opacity": 0.88 } });
          map.addSource("forecast-areas", { type: "geojson", data: initialFeaturesRef.current });
          map.addLayer({ id: "forecast-area-fill", type: "fill", source: "forecast-areas", paint: { "fill-color": ["match", ["get", "recommendation"], "Vai ora", "#1f8a45", "Possibile", "#e5a323", "#89948a"], "fill-opacity": ["match", ["get", "confidence"], "high", 0.72, "medium", 0.58, 0.42] } });
          map.addLayer({ id: "forecast-area-outline", type: "line", source: "forecast-areas", paint: { "line-color": "#123d23", "line-width": 1.5, "line-opacity": 0.78 } });
          map.addLayer({ id: "forecast-area-selected", type: "line", source: "forecast-areas", filter: ["==", ["get", "id"], initialSelectedIdRef.current], paint: { "line-color": "#ffffff", "line-width": 4 } });
          map.on("click", "forecast-area-fill", (event) => { const id = event.features?.[0]?.properties?.id; if (typeof id === "string") onSelectRef.current(id); });
          map.on("mouseenter", "forecast-area-fill", () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", "forecast-area-fill", () => { map.getCanvas().style.cursor = ""; });
          map.fitBounds([[6.25, 35.2], [19.25, 47.4]], { padding: 26, duration: 0 });
          loaded = true;
          setStatus("ready");
        } catch (error) { console.error("maplibre_layers_failed", error); setStatus("error"); }
      });
      map.on("error", (event) => { console.error("maplibre_runtime_error", event.error); });
      const timeout = window.setTimeout(() => { if (active && !loaded) setStatus("error"); }, 8000);
      observer = new ResizeObserver(() => { if (active) map.resize(); });
      observer.observe(containerRef.current);
      map.getCanvas().addEventListener("webglcontextlost", () => { if (active) setStatus("error"); });
      return () => { active = false; observer?.disconnect(); window.clearTimeout(timeout); map.remove(); mapRef.current = null; };
    } catch (error) {
      console.error("maplibre_initialization_failed", error);
      queueMicrotask(() => { if (active) setStatus("error"); });
      mapRef.current?.remove();
      mapRef.current = null;
      return () => { active = false; observer?.disconnect(); };
    }
  }, [attempt]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("forecast-areas") as GeoJSONSource | undefined;
    source?.setData(features);
  }, [features, status]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer("forecast-area-selected")) return;
    map.setFilter("forecast-area-selected", ["==", ["get", "id"], selectedId]);
    const area = areas.find((entry) => entry.id === selectedId);
    if (area) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.easeTo({ center: [area.center[1], area.center[0]], zoom: Math.max(map.getZoom(), 7), duration: reduceMotion ? 0 : 500 });
    }
  }, [areas, selectedId, status]);
  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden bg-[#dce8d9]" role="region" aria-label="Mappa delle condizioni favorevoli per i funghi">
      {(accessibleView || status === "loading" || status === "error") && <ForecastMapFallback areas={areas} forecasts={forecasts} selectedId={selectedId} onSelect={onSelect} />}
      <div ref={containerRef} inert={status !== "ready" || accessibleView} aria-hidden={status !== "ready" || accessibleView} className={status === "ready" && !accessibleView ? "absolute inset-0" : "pointer-events-none absolute inset-0 opacity-0"} />
      <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap justify-center gap-2">
        <button type="button" aria-pressed={accessibleView} onClick={() => setAccessibleView((value) => !value)} className="min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow focus-visible:ring-2 focus-visible:ring-[#174f2b]">{accessibleView ? "Mostra cartografia" : "Elenco accessibile"}</button>
        {status === "error" && <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }} className="min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow">Riprova cartografia</button>}
      </div>
      {status === "error" && <p role="status" className="sr-only">Cartografia non disponibile. Le aree restano consultabili nell’elenco.</p>}
      {status === "loading" && <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center" role="status" aria-live="polite"><div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-4 py-3 font-bold text-[#315d3c] shadow"><LoaderCircle className="size-5 animate-spin" />Caricamento cartografia interattiva</div></div>}
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-white/80 bg-white/92 px-3 py-2 shadow-md backdrop-blur"><div className="flex items-center gap-2 text-sm font-black"><MapPinned className="size-4 text-[#27683a]" />Aree vaste · celle H3 aggregate</div><div className="mt-0.5 text-xs text-[#617266]">Nessun punto personale visibile</div></div>
    </div>
  );
}
