"use client";

import { useEffect, useState } from "react";

import type { CommonsMediaCandidate } from "@/lib/commons-media";

export function SummaryCardMedia({
  taxon,
  localImageUrl,
}: {
  taxon: string;
  localImageUrl: string | null;
}) {
  const [images, setImages] = useState<CommonsMediaCandidate[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    localImageUrl ? "ready" : "idle",
  );

  useEffect(() => {
    if (localImageUrl) return;
    const controller = new AbortController();
    fetch(`/api/media?taxon=${encodeURIComponent(taxon)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("media unavailable");
        return response.json() as Promise<{ images?: CommonsMediaCandidate[] }>;
      })
      .then((payload) => {
        setImages(payload.images ?? []);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [localImageUrl, taxon]);

  if (localImageUrl) {
    return (
      <img
        src={localImageUrl}
        alt={taxon}
        className="h-full min-h-72 w-full object-contain p-2"
      />
    );
  }

  const image = images[0];
  if (image) {
    return (
      <figure className="relative m-0 h-full min-h-72">
        <img
          src={image.imageUrl}
          alt={image.caption || taxon}
          className="h-full min-h-72 w-full object-cover"
        />
        <figcaption className="absolute inset-x-2 bottom-2 rounded-xl bg-white/92 p-2 text-[11px] leading-snug text-[#52675a] shadow">
          {image.author} · {image.license} · Wikimedia Commons
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="grid min-h-72 place-items-center p-8 text-center text-[#6d7d70]">
      <div>
        <p className="font-black">
          {status === "idle" || status === "loading"
            ? "Cerco un’immagine verificata…"
            : "Immagine in preparazione"}
        </p>
        <p className="mt-1 text-sm">
          {status === "error"
            ? "Il servizio immagini non è disponibile in questo momento."
            : "Nessuna immagine con corrispondenza e licenza sufficientemente verificate."}
        </p>
      </div>
    </div>
  );
}
