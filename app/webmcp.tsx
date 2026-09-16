"use client";

import { useEffect } from "react";
import { scoreArea, type Area } from "@/lib/domain";

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute(input: unknown): unknown | Promise<unknown>;
      }, options?: { signal?: AbortSignal }): void | Promise<void>;
    };
  }
}

export function WebMcpBridge({ areas, onSelect }: { areas: Area[]; onSelect: (id: string) => void }) {
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Parameters<typeof context.registerTool>[0]) => {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    };

    register({
      name: "read_area_recommendations",
      title: "Leggi aree consigliate",
      description: "Restituisce le aree dimostrative della beta ordinate per indice, senza coordinate private.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return [...areas].sort((a, b) => scoreArea(b).score - scoreArea(a).score).map((area) => ({ id: area.id, name: area.name, region: area.region, ...scoreArea(area) }));
      },
    });

    register({
      name: "select_area_on_map",
      title: "Seleziona area sulla mappa",
      description: "Apre nell'interfaccia una delle aree restituite da read_area_recommendations.",
      inputSchema: { type: "object", properties: { areaId: { type: "string" } }, required: ["areaId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const areaId = typeof input === "object" && input !== null && "areaId" in input ? String((input as { areaId: unknown }).areaId) : "";
        const area = areas.find((candidate) => candidate.id === areaId);
        if (!area) throw new Error("Area non riconosciuta.");
        onSelect(area.id);
        return { selected: area.id, name: area.name };
      },
    });

    return () => lifecycle.abort();
  }, [areas, onSelect]);

  return null;
}

