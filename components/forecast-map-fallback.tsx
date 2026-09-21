"use client";

import type { Area } from "@/lib/domain";
import type { ForecastResult } from "@/lib/forecast";
import { cn } from "@/lib/utils";

export function ForecastMapFallback({ areas, forecasts, selectedId, onSelect }: {
  areas: Area[]; forecasts: ForecastResult[]; selectedId: string; onSelect: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-auto bg-[radial-gradient(circle_at_40%_20%,#eaf3e4,#c9dcc7)] p-4 pt-24">
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Mappa accessibile delle aree">
        {areas.map((area) => {
          const forecast = forecasts.find((item) => item.areaId === area.id);
          return <button key={area.id} type="button" onClick={() => onSelect(area.id)} className={cn(
            "min-h-11 min-w-0 rounded-2xl border-2 bg-white/90 p-3 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f2b]",
            selectedId === area.id ? "border-[#174f2b] ring-4 ring-white/70" : "border-white",
          )}>
            <span className="block break-words text-sm font-black">{area.name}</span>
            <span className="mt-1 block text-xs text-[#52675a]">{area.region}</span>
            <span className={cn("mt-2 inline-block rounded-full px-2 py-1 text-xs font-black",
              forecast?.recommendation === "Vai ora" ? "bg-[#d8f4d9] text-[#0f5c2a]" : forecast?.recommendation === "Possibile" ? "bg-[#fff0c7] text-[#805300]" : "bg-[#eef0ec] text-[#536057]")}>{forecast?.recommendation ?? "Attendi"}</span>
          </button>;
        })}
      </div>
      <p className="mx-auto mt-3 max-w-xl rounded-xl bg-white/90 p-3 text-center text-xs text-[#52675a]">Vista accessibile attiva: tutte le aree restano selezionabili anche quando la cartografia non può essere caricata.</p>
    </div>
  );
}
