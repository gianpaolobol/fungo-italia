"use client";

import type { Area } from "@/lib/domain";
import type { ForecastResult } from "@/lib/forecast";
import { italyOutline } from "@/lib/italy-outline";
import { cn } from "@/lib/utils";

const WIDTH = 330;
const HEIGHT = 420;
const MIN_LON = 6.3;
const MAX_LON = 19.2;
const MIN_LAT = 35.3;
const MAX_LAT = 47.3;

function project(longitude: number, latitude: number) {
  return {
    x: ((longitude - MIN_LON) / (MAX_LON - MIN_LON)) * WIDTH,
    y: ((MAX_LAT - latitude) / (MAX_LAT - MIN_LAT)) * HEIGHT,
  };
}

function polygonPath(ring: readonly (readonly [number, number])[]) {
  return ring.map(([lon, lat], index) => {
    const { x, y } = project(lon, lat);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

const outlinePaths = italyOutline.geometry.coordinates.flatMap((polygon) =>
  polygon.map((ring) => polygonPath(ring)),
);

export function ForecastMapFallback({ areas, forecasts, selectedId, onSelect }: {
  areas: Area[];
  forecasts: ForecastResult[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const byArea = new Map(forecasts.map((item) => [item.areaId, item]));

  return (
    <div className="absolute inset-0 overflow-auto bg-[radial-gradient(circle_at_40%_20%,#eaf3e4,#c9dcc7)] p-3 pt-20 sm:p-4 sm:pt-20">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[minmax(300px,430px)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-3 shadow-sm">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="mx-auto block h-auto w-full max-w-[410px]"
            role="img"
            aria-label="Sagoma dell'Italia con aree aggregate selezionabili"
          >
            <g fill="#edf4ea" stroke="#315d3c" strokeWidth="1.5" strokeLinejoin="round">
              {outlinePaths.map((d, index) => <path key={index} d={d} />)}
            </g>
            {areas.map((area) => {
              const forecast = byArea.get(area.id);
              const { x, y } = project(area.center[1], area.center[0]);
              const fill = forecast?.recommendation === "Vai ora"
                ? "#1f8a45"
                : forecast?.recommendation === "Possibile"
                  ? "#e5a323"
                  : "#89948a";
              const selected = selectedId === area.id;
              return (
                <g key={area.id} onClick={() => onSelect(area.id)} className="cursor-pointer">
                  <circle cx={x} cy={y} r={selected ? 7.2 : 5.4} fill="white" opacity={selected ? 1 : 0.75} />
                  <circle cx={x} cy={y} r={selected ? 4.8 : 3.6} fill={fill} stroke="#123d23" strokeWidth={selected ? 1.5 : 0.8}>
                    <title>{area.name}: {forecast?.recommendation ?? "Attendi"}, indice {forecast?.score ?? "—"}/100</title>
                  </circle>
                </g>
              );
            })}
          </svg>
          <p className="mt-2 text-center text-xs leading-relaxed text-[#52675a]">
            Sagoma Italia da Natural Earth · marker su centri rappresentativi di macroaree, non su fungaie.
          </p>
        </div>

        <div className="grid content-start grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2" aria-label="Mappa accessibile delle aree">
          {areas.map((area) => {
            const forecast = byArea.get(area.id);
            return (
              <button
                key={area.id}
                type="button"
                aria-pressed={selectedId === area.id}
                onClick={() => onSelect(area.id)}
                className={cn(
                  "min-h-11 min-w-0 rounded-2xl border-2 bg-white/90 p-3 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f2b]",
                  selectedId === area.id ? "border-[#174f2b] ring-4 ring-white/70" : "border-white",
                )}
              >
                <span className="block break-words text-sm font-black">{area.name}</span>
                <span className="mt-1 block text-xs text-[#52675a]">{area.region}</span>
                <span className={cn(
                  "mt-2 inline-block rounded-full px-2 py-1 text-xs font-black",
                  forecast?.recommendation === "Vai ora"
                    ? "bg-[#d8f4d9] text-[#0f5c2a]"
                    : forecast?.recommendation === "Possibile"
                      ? "bg-[#fff0c7] text-[#805300]"
                      : "bg-[#eef0ec] text-[#536057]",
                )}>
                  {forecast?.recommendation ?? "Attendi"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mx-auto mt-3 max-w-3xl rounded-xl bg-white/90 p-3 text-center text-xs text-[#52675a]">
        Vista accessibile attiva: tutte le macroaree restano selezionabili anche quando la cartografia interattiva non può essere caricata.
      </p>
    </div>
  );
}
