"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Binoculars, BookOpenText, ChevronRight, CircleAlert, CloudRain, Compass,
  ExternalLink, Leaf, LocateFixed, LogOut, MapPin, Search, ShieldCheck,
  Sparkles, Trees, Upload, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getVisitPressure, scoreArea, type Area, type Taxon } from "@/lib/domain";
import { WebMcpBridge } from "./webmcp";

type ExploreClientProps = {
  areas: Area[];
  taxa: Taxon[];
  user: { displayName: string; signOutPath: string };
};

const scoreStyles = {
  "Vai ora": "bg-[#d8f4d9] text-[#0f5c2a] border-[#8dd69b]",
  Buona: "bg-[#fff0c7] text-[#805300] border-[#e6c35b]",
  Attendi: "bg-[#eef0ec] text-[#536057] border-[#cbd0ca]",
};

const edibilityLabels: Record<Taxon["edibility"], string> = {
  commestibile: "Commestibile",
  "commestibile-dopo-trattamento": "Dopo trattamento",
  sconsigliato: "Sconsigliato",
  "non-commestibile": "Non commestibile",
  tossico: "Tossico",
  "senza-valore": "Privo di valore alimentare",
};

function osmEmbedUrl(area: Area) {
  const [lat, lng] = area.center;
  const bbox = [lng - 0.34, lat - 0.22, lng + 0.34, lat + 0.22].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function ExploreClient({ areas, taxa, user }: ExploreClientProps) {
  const rankedAreas = useMemo(() => [...areas].sort((a, b) => scoreArea(b).score - scoreArea(a).score), [areas]);
  const [selectedId, setSelectedId] = useState(rankedAreas[0]?.id ?? "");
  const selectArea = useCallback((id: string) => setSelectedId(id), []);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Tutta Italia");
  const [atlasQuery, setAtlasQuery] = useState("");
  const selected = rankedAreas.find((area) => area.id === selectedId) ?? rankedAreas[0];
  const regions = ["Tutta Italia", ...new Set(areas.map((area) => area.region))];
  const visibleAreas = rankedAreas.filter((area) => {
    const matchesRegion = region === "Tutta Italia" || area.region === region;
    return matchesRegion && `${area.name} ${area.region} ${area.habitat.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });
  const visibleTaxa = taxa.filter((taxon) => [taxon.commonName, taxon.scientificName, ...taxon.aliases, ...taxon.regionalNames.map((entry) => entry.name)].join(" ").toLowerCase().includes(atlasQuery.toLowerCase()));
  const selectedRecommendation = selected ? scoreArea(selected) : null;
  const selectedTaxa = selected ? selected.expectedTaxa.map((id) => taxa.find((taxon) => taxon.id === id)).filter((taxon): taxon is Taxon => Boolean(taxon)) : [];

  return (
    <main className="min-h-screen bg-[#f4f7f2] text-[#14261a]">
      <WebMcpBridge areas={areas} onSelect={selectArea} />
      <header className="sticky top-0 z-30 border-b border-[#dce5da] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#174f2b] text-white shadow-sm"><Trees className="size-6" /></div>
            <div className="min-w-0"><div className="truncate text-[18px] font-extrabold tracking-[-0.03em]">Fungo Italia</div><div className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-[#65806b] sm:block">Beta nazionale</div></div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block"><div className="max-w-48 truncate text-sm font-semibold">{user.displayName}</div><div className="text-xs text-[#66816d]">Profilo raccoglitore</div></div>
            <Button asChild variant="outline" size="icon" className="rounded-xl border-[#d5dfd3]" title="Esci"><a href={user.signOutPath} target="_top" aria-label="Esci"><LogOut /></a></Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="cerca" className="mx-auto max-w-[1500px] gap-0 px-4 pb-28 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-4">
          <TabsList className="h-11 rounded-2xl bg-[#e8eee6] p-1">
            <TabsTrigger value="cerca" className="rounded-xl px-3 sm:px-5"><Compass /><span className="hidden sm:inline">Dove cercare</span><span className="sm:hidden">Cerca</span></TabsTrigger>
            <TabsTrigger value="atlante" className="rounded-xl px-3 sm:px-5"><BookOpenText /> Atlante</TabsTrigger>
            <TabsTrigger value="metodo" className="rounded-xl px-3 sm:px-5"><ShieldCheck /><span className="hidden sm:inline">Metodo e sicurezza</span><span className="sm:hidden">Metodo</span></TabsTrigger>
          </TabsList>
          <Button asChild className="hidden rounded-xl bg-[#174f2b] hover:bg-[#0f3f20] sm:inline-flex"><a href="/observations/new"><Upload /> Segnala una specie</a></Button>
        </div>

        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#ead58c] bg-[#fff8dc] px-4 py-3 text-sm text-[#654f14]">
          <CircleAlert className="mt-0.5 size-5 shrink-0" /><p><strong>Dati dimostrativi della beta.</strong> Le aree e i punteggi mostrano il funzionamento; non rappresentano ancora una previsione reale. Le identificazioni non autorizzano mai il consumo.</p>
        </div>

        <TabsContent value="cerca" className="mt-0">
          <section className="grid min-h-[calc(100vh-190px)] gap-4 lg:grid-cols-[410px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col rounded-[24px] border border-[#dce5da] bg-white shadow-[0_18px_60px_rgba(23,79,43,0.08)]">
              <div className="border-b border-[#e1e8df] p-4 sm:p-5">
                <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-[#58705e]">Aree consigliate</p><h1 className="text-2xl font-black tracking-[-0.04em]">Dove vale la pena andare</h1></div><span className="rounded-full bg-[#eff5ed] px-3 py-1 text-xs font-bold text-[#386047]">Italia</span></div>
                <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f8173]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zona, regione o tipo di bosco" className="h-11 rounded-xl border-[#d4dfd2] bg-[#f8faf7] pl-10 text-base" /></div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filtro regione">
                  {regions.map((entry) => <button key={entry} onClick={() => setRegion(entry)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition", region === entry ? "border-[#174f2b] bg-[#174f2b] text-white" : "border-[#d7e1d5] bg-white text-[#4e6655] hover:border-[#9bb29f]")}>{entry}</button>)}
                </div>
              </div>
              <div className="max-h-[57vh] flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin lg:max-h-none">
                {visibleAreas.map((area, index) => {
                  const recommendation = scoreArea(area);
                  const active = selected?.id === area.id;
                  return <button key={area.id} onClick={() => setSelectedId(area.id)} className={cn("w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6fa67b]/30", active ? "border-[#3f7d50] bg-[#f1f8ef] shadow-[0_8px_25px_rgba(23,79,43,0.10)]" : "border-[#e0e7de] bg-white hover:border-[#a9bea9] hover:bg-[#fafcf9]")}> 
                    <div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf3eb] text-sm font-black text-[#4b6852]">{index + 1}</span><div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3"><div><div className="font-extrabold tracking-[-0.02em]">{area.name}</div><div className="mt-0.5 flex items-center gap-1 text-sm text-[#617266]"><MapPin className="size-3.5" /> {area.region}</div></div><span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs font-black", scoreStyles[recommendation.label])}>{recommendation.label}</span></div>
                      <div className="mt-3 flex flex-wrap gap-1.5">{area.habitat.slice(0, 3).map((habitat) => <span key={habitat} className="rounded-full bg-[#eaf1e8] px-2 py-1 text-xs font-semibold text-[#3e6548]">{habitat}</span>)}</div>
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#627268]"><span className="flex items-center gap-1"><Users className="size-3.5" /> {getVisitPressure(area.delayedVisitors)} passaggi</span><span className="flex items-center gap-1 text-[#1f6333]">Perché <ChevronRight className="size-3.5" /></span></div>
                    </div></div>
                  </button>;
                })}
                {visibleAreas.length === 0 && <div className="rounded-2xl border border-dashed border-[#cbd8c9] p-8 text-center text-[#617266]">Nessuna area corrisponde ai filtri.</div>}
              </div>
            </div>

            {selected && selectedRecommendation && <div className="relative min-h-[680px] overflow-hidden rounded-[24px] border border-[#cfd9cd] bg-[#dce8d9] shadow-[0_18px_60px_rgba(23,79,43,0.10)]">
              <iframe key={selected.id} title={`Mappa OpenStreetMap di ${selected.name}`} src={osmEmbedUrl(selected)} className="absolute inset-0 h-full w-full border-0 grayscale-[18%] contrast-[0.92]" loading="lazy" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#102719]/25 via-transparent to-white/10" />
              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3"><div className="rounded-2xl border border-white/70 bg-white/92 p-3 shadow-lg backdrop-blur"><div className="flex items-center gap-2 text-sm font-black"><LocateFixed className="size-4 text-[#27683a]" /> Mappa OpenStreetMap</div><div className="mt-1 text-xs text-[#617266]">Nessun percorso o punto personale visibile</div></div><a href={`https://www.openstreetmap.org/?mlat=${selected.center[0]}&mlon=${selected.center[1]}#map=10/${selected.center[0]}/${selected.center[1]}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-xl border border-white/70 bg-white/92 text-[#174f2b] shadow-lg backdrop-blur" aria-label="Apri su OpenStreetMap"><ExternalLink className="size-5" /></a></div>
              <article className="absolute bottom-4 left-4 right-4 max-h-[62%] overflow-y-auto rounded-[24px] border border-white/80 bg-white/96 p-5 shadow-[0_22px_60px_rgba(16,39,25,0.24)] backdrop-blur sm:left-auto sm:w-[min(470px,calc(100%-32px))]">
                <div className="flex items-start justify-between gap-4"><div><div className="mb-1 flex items-center gap-2 text-sm font-bold text-[#5d7362]"><MapPin className="size-4" /> {selected.region}</div><h2 className="text-2xl font-black tracking-[-0.04em]">{selected.name}</h2></div><div className="text-right"><div className={cn("inline-flex rounded-full border px-3 py-1 text-sm font-black", scoreStyles[selectedRecommendation.label])}>{selectedRecommendation.label}</div><div className="mt-1 text-xs font-bold text-[#637369]">indice {selectedRecommendation.score}/100</div></div></div>
                <div className="mt-4 grid grid-cols-3 gap-2"><Metric icon={CloudRain} label="Umidità" value={`${selected.moisture}/100`} /><Metric icon={Users} label="Passaggi" value={getVisitPressure(selected.delayedVisitors)} /><Metric icon={Trees} label="Habitat" value={`${selected.habitat.length} tipi`} /></div>
                <div className="mt-5"><h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#597160]">Perché è consigliata</h3><ul className="mt-2 space-y-2">{selected.reasons.map((reason) => <li key={reason} className="flex gap-2 text-sm"><Sparkles className="mt-0.5 size-4 shrink-0 text-[#ce8a18]" /> {reason}</li>)}</ul></div>
                <div className="mt-5"><h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#597160]">Specie e gruppi attesi</h3><div className="mt-2 space-y-2">{selectedTaxa.map((taxon) => <div key={taxon.id} className="rounded-xl bg-[#f2f6f0] p-3"><div className="font-bold">{taxon.commonName} <em className="font-medium text-[#52675a]">{taxon.scientificName}</em></div><div className="mt-1 text-xs text-[#647568]">Associato a: {taxon.hosts?.join(", ")}</div></div>)}</div></div>
              </article>
            </div>}
          </section>
        </TabsContent>

        <TabsContent value="atlante" className="mt-0">
          <section className="rounded-[24px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-[#e0e8de] pb-5 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold text-[#5d7362]">Atlante della beta</p><h1 className="text-3xl font-black tracking-[-0.04em]">Nomi comprensibili, rigore scientifico</h1><p className="mt-2 max-w-2xl text-[#5f7064]">I nomi locali sono legati al territorio. Sinonimi e nomi storici restano distinti dal nome scientifico accettato.</p></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f8173]" /><Input value={atlasQuery} onChange={(event) => setAtlasQuery(event.target.value)} placeholder="Cerca nome o sinonimo" className="h-11 rounded-xl pl-10 text-base" /></div></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visibleTaxa.map((taxon) => <article key={taxon.id} className="rounded-2xl border border-[#dde6db] bg-[#fbfcfa] p-4 transition hover:border-[#9fb6a2] hover:shadow-md">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black tracking-[-0.02em]">{taxon.commonName}</h2><p className="mt-0.5 font-serif text-[17px] italic text-[#31553b]">{taxon.scientificName}</p></div><span className="rounded-full bg-[#eaf2e8] px-2 py-1 text-xs font-bold text-[#416549]">{taxon.rank}</span></div>
              {taxon.regionalNames.length > 0 && <div className="mt-3 rounded-xl bg-white p-3 text-sm"><div className="font-bold text-[#516657]">Nomi regionali</div>{taxon.regionalNames.map((entry) => <div key={`${entry.name}-${entry.regions.join()}`} className="mt-1"><strong>{entry.name}</strong> · {entry.regions.join(", ")}</div>)}</div>}
              {taxon.aliases.length > 0 && <p className="mt-3 text-sm text-[#5f7064]">Sinonimi: <em>{taxon.aliases.join(", ")}</em></p>}
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e3e9e1] pt-3 text-sm"><span className="font-bold text-[#315d3c]">{edibilityLabels[taxon.edibility]}</span><span className="text-xs font-semibold text-[#708076]">Livello {taxon.recognitionLevel}</span></div>
              <p className="mt-3 flex gap-2 text-xs leading-relaxed text-[#6b5c30]"><CircleAlert className="mt-0.5 size-3.5 shrink-0 text-[#b27c16]" />{taxon.safetyNote}</p>
            </article>)}</div>
          </section>
        </TabsContent>

        <TabsContent value="metodo" className="mt-0">
          <section className="grid gap-4 lg:grid-cols-3">
            <MethodCard icon={Binoculars} number="01" title="Guarda l'area, non il punto" text="Le indicazioni riguardano aree ampie. Percorsi, coordinate precise e fungaie personali non vengono pubblicati." />
            <MethodCard icon={Users} number="02" title="Pressione anonima e ritardata" text="Mostriamo soltanto fasce di passaggio dopo un ritardo. Nessuna identità, traccia o orario esatto è ricostruibile." />
            <MethodCard icon={ShieldCheck} number="03" title="Verifica micologica" text="Le segnalazioni entrano in revisione e sono assegnabili a micologi per regione e gruppo tassonomico." />
            <div className="rounded-[24px] border border-[#ead58c] bg-[#fff8dc] p-6 lg:col-span-3"><div className="flex items-start gap-4"><CircleAlert className="mt-1 size-7 shrink-0 text-[#a86e08]" /><div><h2 className="text-xl font-black">Regola fondamentale</h2><p className="mt-2 max-w-4xl leading-relaxed text-[#67541f]">Una fotografia, un algoritmo o una scheda online non possono stabilire da soli la commestibilità di un fungo. Per il consumo è necessaria una determinazione certa e, quando previsto, il controllo dell&apos;Ispettorato micologico competente.</p></div></div></div>
          </section>
        </TabsContent>
      </Tabs>
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden"><Button asChild className="h-13 w-full rounded-2xl bg-[#174f2b] text-base shadow-[0_12px_30px_rgba(16,58,30,0.28)] hover:bg-[#0f3f20]"><a href="/observations/new"><Upload /> Segnala una specie</a></Button></div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: string }) {
  return <div className="rounded-xl bg-[#edf4eb] p-2.5"><Icon className="size-4 text-[#3f7049]" /><div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#718077]">{label}</div><div className="mt-0.5 truncate text-sm font-black capitalize">{value}</div></div>;
}

function MethodCard({ icon: Icon, number, title, text }: { icon: typeof Leaf; number: string; title: string; text: string }) {
  return <article className="rounded-[24px] border border-[#dce5da] bg-white p-6 shadow-[0_16px_45px_rgba(23,79,43,0.07)]"><div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-2xl bg-[#e7f0e4] text-[#205d34]"><Icon className="size-6" /></div><span className="font-serif text-3xl italic text-[#b7c5b7]">{number}</span></div><h2 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h2><p className="mt-2 leading-relaxed text-[#5d7062]">{text}</p></article>;
}
