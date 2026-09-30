"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Binoculars,
  BookOpenText,
  ChevronRight,
  CircleAlert,
  CloudRain,
  Compass,
  Leaf,
  List,
  LoaderCircle,
  LogOut,
  Map as MapIcon,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";

import { AtlasCardDetail } from "@/components/atlas-card-detail";
import { SporePrint } from "@/components/spore-print";
import { SummaryCardShell } from "@/components/summary-card-shell";
import { ForecastMap } from "@/components/forecast-map";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { getVisitPressure, type Area, type AtlasTaxon, type Taxon } from "@/lib/domain";
import { rankAreas } from "@/lib/explore-view";
import type { PublicCatalogSearchDocument } from "@/lib/catalog-search";
import {
  defaultAtlasNavigationState,
  parseAtlasNavigationState,
  returnToAtlasParent,
  selectAtlasCard,
  serializeAtlasNavigationState,
  setAtlasDepth,
  type AtlasNavigationState,
} from "@/lib/atlas-navigation-state";
import { selectMinimumChildFromTeachingGroup } from "@/lib/atlas-child-navigation";
import { calculateForecast, type ForecastResult } from "@/lib/forecast";
import { buildSummaryCardIndex, isSummaryCardReady } from "@/lib/summary-cards";
import { cn } from "@/lib/utils";

import { WebMcpBridge } from "./webmcp";

type ExploreClientProps = {
  areas: Area[];
  taxa: AtlasTaxon[];
  objectives: Array<{ id: string; commonName: string; scientificName: string; objectives: { minimum: string | null; desirable: string | null; advanced: string | null }; sources: { minimumObjectives: { title: string; page: number }; edibilityGuide: { title: string; page: number } } }>;
  user: { displayName: string; signOutPath: string };
};

const scoreStyles: Record<string, string> = {
  "Vai ora": "border-[#76c98b] bg-[#d8f4d9] text-[#0f5c2a]",
  Possibile: "border-[#e6c35b] bg-[#fff0c7] text-[#805300]",
  Attendi: "border-[#cbd0ca] bg-[#eef0ec] text-[#536057]",
};

const edibilityLabels: Record<Taxon["edibility"], string> = {
  commestibile: "Commestibile",
  "commestibile-dopo-trattamento": "Dopo trattamento",
  sconsigliato: "Sconsigliato",
  "non-commestibile": "Non commestibile",
  tossico: "Tossico",
  "senza-valore": "Privo di valore alimentare",
  mixed: "Stati diversi nel gruppo",
  "non-valutato": "Non valutato nella guida",
};

export function ExploreClient({ areas, taxa, objectives, user }: ExploreClientProps) {
  const isMobile = useIsMobile();
  const initialForecasts = useMemo(
    () => areas.map((area) => calculateForecast(area, null)),
    [areas],
  );
  const [forecasts, setForecasts] = useState<ForecastResult[]>(initialForecasts);
  const [catalogTaxa, setCatalogTaxa] = useState<AtlasTaxon[]>(taxa);
  const summaryCardShells = useMemo(() => buildSummaryCardIndex(catalogTaxa), [catalogTaxa]);
  const [activeTab, setActiveTab] = useState("cerca");
  const [schedeQuery, setSchedeQuery] = useState("");
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [forecastStatus, setForecastStatus] = useState<"loading" | "live" | "partial" | "degraded">("loading");
  const [selectedId, setSelectedId] = useState(areas[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Tutta Italia");
  const [atlasQuery, setAtlasQuery] = useState("");
  const [atlasKind, setAtlasKind] = useState<"all" | "minimumTaxon" | "teachingGroup">("all");
  const [atlasRank, setAtlasRank] = useState("");
  const [atlasEdibility, setAtlasEdibility] = useState<AtlasNavigationState["edibility"]>("");
  const [atlasNavigation, setAtlasNavigation] = useState(defaultAtlasNavigationState);
  const [atlasUrlReady, setAtlasUrlReady] = useState(false);
  const [atlasServerItems, setAtlasServerItems] = useState<PublicPublicCatalogSearchDocument[] | null>(null);
  const [atlasServerTotal, setAtlasServerTotal] = useState(0);
  const [atlasServerStatus, setAtlasServerStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [mobileView, setMobileView] = useState<"list" | "map">("map");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const parsed = parseAtlasNavigationState(
      new URLSearchParams(window.location.search),
    );
    const timeout = window.setTimeout(() => {
      setAtlasQuery(parsed.query);
      setAtlasKind(parsed.kind);
      setAtlasRank(parsed.rank);
      setAtlasEdibility(parsed.edibility);
      setAtlasNavigation(parsed);
      setAtlasUrlReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!atlasUrlReady) return;

    const state: AtlasNavigationState = {
      ...atlasNavigation,
      query: atlasQuery,
      kind: atlasKind,
      rank: atlasRank,
      edibility: atlasEdibility,
    };
    const queryString = serializeAtlasNavigationState(state).toString();
    const href =
      window.location.pathname +
      (queryString ? `?${queryString}` : "") +
      window.location.hash;
    window.history.replaceState(window.history.state, "", href);
  }, [
    atlasEdibility,
    atlasKind,
    atlasNavigation,
    atlasQuery,
    atlasRank,
    atlasUrlReady,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/forecast", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("forecast unavailable");
        return response.json() as Promise<{
          providerStatus: "live" | "partial" | "degraded";
          forecasts: ForecastResult[];
        }>;
      })
      .then((payload) => {
        setForecasts(payload.forecasts);
        setForecastStatus(payload.providerStatus);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setForecastStatus("degraded");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return response.json() as Promise<{ taxa: AtlasTaxon[] }>;
      })
      .then((payload) => setCatalogTaxa(payload.taxa))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
    return () => controller.abort();
  }, []);

  // The structured atlas is the primary surface even with no active filters.
  // The legacy catalog remains only as a degraded fallback if the search API fails.
  const atlasServerSearchActive = true;

  useEffect(() => {
    if (!atlasServerSearchActive) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (atlasQuery.trim()) params.set("q", atlasQuery.trim());
      if (atlasKind !== "all") params.set("kind", atlasKind);
      if (atlasRank) params.set("rank", atlasRank);
      if (atlasEdibility) params.set("edibility", atlasEdibility);
      params.set("limit", "500");

      setAtlasServerStatus("loading");
      fetch(`/api/catalog?${params.toString()}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("catalog search unavailable");
          return response.json() as Promise<{
            mode: "search";
            total: number;
            items: PublicPublicCatalogSearchDocument[];
          }>;
        })
        .then((payload) => {
          setAtlasServerItems(payload.items);
          setAtlasServerTotal(payload.total);
          setAtlasServerStatus("ready");
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setAtlasServerStatus("error");
        });
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [atlasEdibility, atlasKind, atlasQuery, atlasRank, atlasServerSearchActive]);

  const ranked = useMemo(
    () => rankAreas(areas, forecasts, { query, region }),
    [areas, forecasts, query, region],
  );
  const selectedArea = areas.find((area) => area.id === selectedId) ?? areas[0];
  const selectedForecast =
    forecasts.find((forecast) => forecast.areaId === selectedArea?.id) ??
    (selectedArea ? calculateForecast(selectedArea, null) : null);
  const selectedTaxa = selectedForecast
    ? selectedForecast.expectedTaxa
        .map((id) => catalogTaxa.find((taxon) => taxon.id === id))
        .filter((taxon): taxon is AtlasTaxon => Boolean(taxon))
    : [];
  const regions = ["Tutta Italia", ...new Set(areas.map((area) => area.region))];
  const readySummaryCards = useMemo(() => {
    const normalized = schedeQuery.toLocaleLowerCase("it").trim();
    return summaryCardShells
      .filter(isSummaryCardReady)
      .filter((card) => {
        if (!normalized) return true;
        return [
          card.displayCommonName,
          card.commonName,
          card.scientificName,
          card.acceptedName,
        ]
          .join(" ")
          .toLocaleLowerCase("it")
          .includes(normalized);
      })
      .sort((a, b) => a.displayCommonName.localeCompare(b.displayCommonName, "it"));
  }, [schedeQuery, summaryCardShells]);

  const selectedSummaryCard =
    readySummaryCards.find((card) => card.atlasId === selectedSummaryId) ??
    summaryCardShells.find((card) => card.atlasId === selectedSummaryId) ??
    null;

  const openSummaryInAtlas = useCallback((atlasId: string) => {
    const card = summaryCardShells.find((entry) => entry.atlasId === atlasId);
    if (!card) return;
    setAtlasNavigation(defaultAtlasNavigationState);
    setAtlasQuery(card.scientificName);
    setAtlasKind("all");
    setAtlasRank("");
    setAtlasEdibility("");
    setActiveTab("atlante");
  }, [summaryCardShells]);
  const normalizedAtlasQuery = atlasQuery.toLocaleLowerCase("it").trim();
  const abbreviatedAtlasQuery = normalizedAtlasQuery.match(/^([a-zà-ÿ])[a-zà-ÿ-]+\s+([a-zà-ÿ-]+)$/)?.slice(1).join(". ");
  const visibleTaxa = catalogTaxa.filter((taxon) => {
    const haystack = [
      taxon.commonName,
      taxon.scientificName,
      ...taxon.aliases,
      ...taxon.regionalNames.map((entry) => entry.name),
      taxon.objectiveSummary?.minimum ?? "",
      taxon.objectiveSummary?.desirable ?? "",
      taxon.objectiveSummary?.advanced ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("it");
    return haystack.includes(normalizedAtlasQuery) || Boolean(abbreviatedAtlasQuery && haystack.includes(abbreviatedAtlasQuery));
  });

  const selectArea = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (isMobile) {
        setMobileView("map");
        setDrawerOpen(true);
      }
    },
    [isMobile],
  );

  const openAtlasSearchItem = useCallback((item: PublicCatalogSearchDocument) => {
    setAtlasNavigation((current) =>
      selectAtlasCard(current, {
        kind: item.kind,
        id: item.id,
      }),
    );
  }, []);

  const changeAtlasDepth = useCallback((depth: AtlasNavigationState["depth"]) => {
    setAtlasNavigation((current) => setAtlasDepth(current, depth));
  }, []);

  const openAtlasChild = useCallback((parentCardId: string, childCardId: string) => {
    setAtlasNavigation((current) => {
      const result = selectMinimumChildFromTeachingGroup(
        current,
        parentCardId,
        childCardId,
      );
      return result.ok ? result.state : current;
    });
  }, []);

  const backFromAtlasCard = useCallback(() => {
    setAtlasNavigation((current) => returnToAtlasParent(current));
  }, []);

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#f4f7f2] text-[#14261a]">
      <WebMcpBridge areas={areas} onSelect={selectArea} />
      <header className="sticky top-0 z-40 border-b border-[#dce5da] bg-white/96 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-3 sm:h-[72px] sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#174f2b] text-white shadow-sm sm:size-11 sm:rounded-2xl">
              <Trees className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[17px] font-extrabold tracking-[-0.03em] sm:text-[18px]">
                Fungo Italia
              </div>
              <div className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-[#65806b] sm:block">
                Beta nazionale
              </div>
            </div>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <div className="hidden min-w-0 text-right md:block">
              <div className="max-w-48 truncate text-sm font-semibold">{user.displayName}</div>
              <div className="text-xs text-[#66816d]">Profilo raccoglitore</div>
            </div>
            <Button asChild variant="outline" size="icon" className="size-11 shrink-0 rounded-xl border-[#d5dfd3]" title="Revisioni micologiche">
              <Link href="/admin/catalog" aria-label="Revisioni micologiche">
                <ShieldCheck />
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="size-11 shrink-0 rounded-xl border-[#d5dfd3]" title="Esci">
              <a href={user.signOutPath} target="_top" aria-label="Esci">
                <LogOut />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-auto max-w-[1600px] gap-0 px-3 pb-28 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-2 py-3 sm:py-4">
          <TabsList className="h-11 min-w-0 max-w-full overflow-x-auto rounded-2xl bg-[#e8eee6] p-1 scrollbar-none">
            <TabsTrigger value="cerca" className="min-w-0 rounded-xl px-2.5 sm:px-5">
              <Compass />
              <span>Cerca</span>
            </TabsTrigger>
            <TabsTrigger value="atlante" className="min-w-0 rounded-xl px-2.5 sm:px-5">
              <BookOpenText />
              <span>Atlante</span>
            </TabsTrigger>
            <TabsTrigger value="schede" className="min-w-0 rounded-xl px-2.5 sm:px-5">
              <Leaf />
              <span>Schede</span>
            </TabsTrigger>
            <TabsTrigger value="obiettivi" className="min-w-0 rounded-xl px-2.5 sm:px-5">
              <Binoculars />
              <span>Obiettivi</span>
            </TabsTrigger>
            <TabsTrigger value="metodo" className="min-w-0 rounded-xl px-2.5 sm:px-5">
              <ShieldCheck />
              <span>Metodo</span>
            </TabsTrigger>
          </TabsList>
          <Button asChild className="hidden h-11 rounded-xl bg-[#174f2b] hover:bg-[#0f3f20] sm:inline-flex">
            <a href="/observations/new">
              <Upload />
              Segnala
            </a>
          </Button>
        </div>

        <div className="mb-3 flex min-w-0 items-start gap-3 rounded-2xl border border-[#ead58c] bg-[#fff8dc] px-3 py-3 text-sm text-[#654f14] sm:mb-4 sm:px-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <p className="min-w-0 leading-relaxed">
            <strong>Beta previsionale.</strong> Il meteo viene aggiornato; habitat, fenologia e segnali territoriali sono ancora in validazione. Il punteggio non certifica un ritrovamento né la commestibilità.
          </p>
        </div>

        <TabsContent value="cerca" className="mt-0 min-w-0">
          <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden" aria-label="Visualizzazione">
            <Button
              type="button"
              variant={mobileView === "map" ? "default" : "outline"}
              className={cn("h-11 rounded-xl", mobileView === "map" && "bg-[#174f2b]")}
              onClick={() => setMobileView("map")}
              aria-pressed={mobileView === "map"}
            >
              <MapIcon />
              Mappa
            </Button>
            <Button
              type="button"
              variant={mobileView === "list" ? "default" : "outline"}
              className={cn("h-11 rounded-xl", mobileView === "list" && "bg-[#174f2b]")}
              onClick={() => setMobileView("list")}
              aria-pressed={mobileView === "list"}
            >
              <List />
              Elenco
            </Button>
          </div>

          <section className="grid min-w-0 gap-3 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_340px]">
            <aside className={cn(
              "min-w-0 overflow-hidden rounded-[22px] border border-[#dce5da] bg-white shadow-[0_18px_60px_rgba(23,79,43,0.08)]",
              mobileView === "list" ? "block" : "hidden",
              "lg:block",
            )}>
              <AreaFilters
                query={query}
                setQuery={setQuery}
                region={region}
                setRegion={setRegion}
                regions={regions}
              />
              <div className="max-h-[calc(100dvh-310px)] min-h-[340px] space-y-3 overflow-y-auto p-3 scrollbar-thin lg:h-[calc(100dvh-252px)] lg:max-h-none">
                {ranked.map(({ area, forecast }, index) => (
                  <AreaButton
                    key={area.id}
                    area={area}
                    forecast={forecast}
                    index={index}
                    active={selectedArea?.id === area.id}
                    onSelect={selectArea}
                  />
                ))}
                {ranked.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#cbd8c9] p-7 text-center text-[#617266]">
                    Nessuna area corrisponde ai filtri.
                  </div>
                )}
              </div>
            </aside>

            <div className={cn(
              "relative min-w-0 overflow-hidden rounded-[22px] border border-[#cfd9cd] bg-[#dce8d9] shadow-[0_18px_60px_rgba(23,79,43,0.10)]",
              mobileView === "map" ? "block" : "hidden",
              "h-[calc(100dvh-250px)] min-h-[430px] lg:block lg:h-[calc(100dvh-190px)] lg:min-h-[620px]",
            )}>
              <ForecastMap
                areas={areas}
                forecasts={forecasts}
                selectedId={selectedArea?.id ?? ""}
                onSelect={selectArea}
              />
              <div className="pointer-events-none absolute inset-x-3 bottom-3 lg:hidden">
                {selectedArea && selectedForecast && (
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="pointer-events-auto flex min-h-16 w-full min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/96 p-3 text-left shadow-[0_14px_35px_rgba(16,39,25,0.25)] backdrop-blur"
                  >
                    <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs font-black", scoreStyles[selectedForecast.recommendation])}>
                      {selectedForecast.recommendation}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-black leading-tight">{selectedArea.name}</span>
                      <span className="mt-1 block text-xs text-[#617266]">
                        Tocca per motivazioni e specie possibili
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-[#315d3c]" />
                  </button>
                )}
              </div>
              <div className="pointer-events-none absolute right-3 top-[76px] max-w-[calc(100%-24px)] rounded-full border border-white/70 bg-white/92 px-3 py-1.5 text-xs font-bold text-[#3d5d45] shadow">
                {forecastStatus === "loading" ? (
                  <span className="flex items-center gap-1.5"><LoaderCircle className="size-3.5 animate-spin" /> Aggiorno</span>
                ) : forecastStatus === "live" ? "Meteo aggiornato" : "Dati parziali"}
              </div>
            </div>

            <aside className="hidden min-w-0 overflow-y-auto rounded-[22px] border border-[#dce5da] bg-white p-5 shadow-[0_18px_60px_rgba(23,79,43,0.08)] xl:block xl:h-[calc(100dvh-190px)]">
              {selectedArea && selectedForecast && (
                <AreaDetails area={selectedArea} forecast={selectedForecast} taxa={selectedTaxa} />
              )}
            </aside>
          </section>

          <div className="mt-3 hidden min-w-0 rounded-[22px] border border-[#dce5da] bg-white p-5 lg:block xl:hidden">
            {selectedArea && selectedForecast && (
              <AreaDetails area={selectedArea} forecast={selectedForecast} taxa={selectedTaxa} compact />
            )}
          </div>
        </TabsContent>

        <TabsContent value="obiettivi" className="mt-0 min-w-0">
          <section className="min-w-0 rounded-[24px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-6">
            <p className="text-sm font-bold text-[#5d7362]">Formazione micologica nazionale</p>
            <h1 className="break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">Obiettivi tassonomici per genere e gruppo</h1>
            <p className="mt-2 max-w-3xl text-[#5f7064]">Qui sono raccolti gli obiettivi minimi, auspicabili e di approfondimento. I singoli taxa citati sono consultabili separatamente nell’Atlante.</p>
            <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-2">
              {objectives.map((objective) => <article key={objective.id} className="min-w-0 rounded-2xl border border-[#dde6db] bg-[#fbfcfa] p-4">
                <h2 className="break-words text-lg font-black">{objective.commonName}</h2>
                <p className="font-serif italic text-[#31553b]">{objective.scientificName}</p>
                <details className="mt-3 rounded-xl bg-white p-3" open><summary className="cursor-pointer font-bold text-[#315d3c]">Obiettivo minimo</summary><p className="mt-2 break-words text-sm leading-relaxed">{objective.objectives.minimum}</p></details>
                {objective.objectives.desirable && <details className="mt-2 rounded-xl bg-white p-3"><summary className="cursor-pointer font-bold text-[#315d3c]">Auspicabile</summary><p className="mt-2 break-words text-sm leading-relaxed">{objective.objectives.desirable}</p></details>}
                {objective.objectives.advanced && <details className="mt-2 rounded-xl bg-white p-3"><summary className="cursor-pointer font-bold text-[#315d3c]">Approfondimento</summary><p className="mt-2 break-words text-sm leading-relaxed">{objective.objectives.advanced}</p></details>}
                <p className="mt-3 text-xs text-[#708076]">Fonti: {objective.sources.minimumObjectives.title}, p. {objective.sources.minimumObjectives.page}; {objective.sources.edibilityGuide.title}, p. {objective.sources.edibilityGuide.page}.</p>
              </article>)}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="atlante" className="mt-0 min-w-0">
          <section className="min-w-0 rounded-[24px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-6">
            <div className="flex min-w-0 flex-col gap-4 border-b border-[#e0e8de] pb-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#5d7362]">Atlante della beta</p>
                <h1 className="break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  Nomi comprensibili, rigore scientifico
                </h1>
                <p className="mt-2 max-w-2xl text-[#5f7064]">
                  I nomi locali sono legati al territorio. Sinonimi e nomi storici restano distinti dal nome scientifico accettato.
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 md:w-80">
                <div className="text-sm font-bold text-[#5d7362]">
                  {atlasServerSearchActive
                    ? atlasServerStatus === "loading"
                      ? "Ricerca in corso…"
                      : atlasServerStatus === "error"
                        ? "Ricerca server non disponibile"
                        : `${atlasServerTotal} risultati verificati`
                    : `${visibleTaxa.length} di ${catalogTaxa.length} schede legacy`}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f8173]" />
                  <Input
                    value={atlasQuery}
                    onChange={(event) => setAtlasQuery(event.target.value)}
                    placeholder="Cerca nome o sinonimo"
                    className="h-11 rounded-xl pl-10 text-base"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1">
                  <NativeSelect
                    value={atlasKind}
                    onChange={(event) => setAtlasKind(event.target.value as "all" | "minimumTaxon" | "teachingGroup")}
                    className="h-11 w-full rounded-xl"
                    aria-label="Tipo di scheda"
                  >
                    <NativeSelectOption value="all">Tutte le schede</NativeSelectOption>
                    <NativeSelectOption value="minimumTaxon">Taxa Minimo</NativeSelectOption>
                    <NativeSelectOption value="teachingGroup">Generi e gruppi</NativeSelectOption>
                  </NativeSelect>
                  <NativeSelect
                    value={atlasRank}
                    onChange={(event) => setAtlasRank(event.target.value)}
                    className="h-11 w-full rounded-xl"
                    aria-label="Rango tassonomico"
                  >
                    <NativeSelectOption value="">Tutti i ranghi</NativeSelectOption>
                    <NativeSelectOption value="species">Specie</NativeSelectOption>
                    <NativeSelectOption value="speciesGroup">Gruppo di specie</NativeSelectOption>
                    <NativeSelectOption value="section">Sezione</NativeSelectOption>
                    <NativeSelectOption value="subsection">Sottosezione</NativeSelectOption>
                    <NativeSelectOption value="subgenus">Sottogenere</NativeSelectOption>
                    <NativeSelectOption value="genus">Genere</NativeSelectOption>
                    <NativeSelectOption value="operationalGroup">Gruppo didattico</NativeSelectOption>
                  </NativeSelect>
                  <NativeSelect
                    value={atlasEdibility}
                    onChange={(event) => setAtlasEdibility(event.target.value)}
                    className="h-11 w-full rounded-xl"
                    aria-label="Categoria alimentare"
                  >
                    <NativeSelectOption value="">Tutte le categorie</NativeSelectOption>
                    <NativeSelectOption value="EDIBLE">Commestibile</NativeSelectOption>
                    <NativeSelectOption value="EDIBLE_AFTER_TREATMENT">Dopo trattamento</NativeSelectOption>
                    <NativeSelectOption value="DISCOURAGED">Sconsigliato</NativeSelectOption>
                    <NativeSelectOption value="NOT_EDIBLE">Non commestibile</NativeSelectOption>
                    <NativeSelectOption value="POISONOUS">Tossico</NativeSelectOption>
                    <NativeSelectOption value="NOT_ASSESSED">Non valutato</NativeSelectOption>
                  </NativeSelect>
                </div>
                <Button asChild variant="outline" className="h-11 rounded-xl border-[#9fb6a2] text-[#315d3c]">
                  <Link href="/catalog/proposals/new">Proponi taxon o modifica</Link>
                </Button>
              </div>
            </div>
            {atlasNavigation.selectedKind && atlasNavigation.selectedId ? (
              <div className="mt-5 min-w-0">
                <AtlasCardDetail
                  selectedKind={atlasNavigation.selectedKind}
                  selectedId={atlasNavigation.selectedId}
                  depth={atlasNavigation.depth}
                  hasReturnContext={Boolean(atlasNavigation.returnKind && atlasNavigation.returnId)}
                  onDepthChange={changeAtlasDepth}
                  onChildOpen={openAtlasChild}
                  onBack={backFromAtlasCard}
                />
              </div>
            ) : atlasServerSearchActive ? (
              <div className="mt-5 min-w-0">
                {atlasServerStatus === "error" && (
                  <div className="mb-3 rounded-2xl border border-[#e3a6a0] bg-[#fff1ef] p-4 text-sm text-[#842d26]">
                    La ricerca server non è disponibile: mostro il catalogo locale come fallback.
                  </div>
                )}
                <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {atlasServerStatus !== "error" && atlasServerItems?.map((item) => (
                    <CatalogSearchResultCard key={item.id} item={item} onOpen={openAtlasSearchItem} />
                  ))}
                  {atlasServerStatus === "error" && visibleTaxa.map((taxon) => (
                    <TaxonCard key={taxon.id} taxon={taxon} />
                  ))}
                </div>
                {atlasServerStatus === "ready" && atlasServerItems?.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#cbd8c9] p-7 text-center text-[#617266]">
                    Nessun risultato per i filtri selezionati.
                  </div>
                )}
                {atlasServerStatus === "ready" && atlasServerTotal > (atlasServerItems?.length ?? 0) && (
                  <p className="mt-3 text-sm font-semibold text-[#617266]">
                    Mostrati i primi {atlasServerItems?.length ?? 0} risultati su {atlasServerTotal}.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleTaxa.map((taxon) => (
                  <TaxonCard key={taxon.id} taxon={taxon} />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="schede" className="mt-0 min-w-0">
          <section className="min-w-0 rounded-[24px] border border-[#dce5da] bg-white p-4 shadow-[0_18px_60px_rgba(23,79,43,0.08)] sm:p-6">
            {selectedSummaryCard ? (
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedSummaryId(null)}
                  className="mb-4 min-h-11 rounded-xl px-2 font-bold text-[#315d3c]"
                >
                  ← Torna alle Schede
                </button>
                <SummaryCardShell
                  card={selectedSummaryCard}
                  onOpenAtlas={openSummaryInAtlas}
                />
              </div>
            ) : (
              <>
                <div className="flex min-w-0 flex-col gap-4 border-b border-[#e0e8de] pb-5 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#5d7362]">Lotto S1 · primi contenuti revisionati</p>
                    <h1 className="break-words text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                      Schede rapide dei principali commestibili
                    </h1>
                    <p className="mt-2 max-w-3xl leading-relaxed text-[#5f7064]">
                      Sintesi visuale coordinata con l’Atlante: immagine approvata, habitat, stagione,
                      sporata grafica e 3 caratteri principali + 1 differenziante.
                    </p>
                  </div>
                  <div className="w-full shrink-0 md:w-80">
                    <label className="text-xs font-black uppercase tracking-wide text-[#6b7d70]" htmlFor="schede-search">
                      Cerca nelle Schede pronte
                    </label>
                    <div className="relative mt-1.5">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f8173]" />
                      <Input
                        id="schede-search"
                        value={schedeQuery}
                        onChange={(event) => setSchedeQuery(event.target.value)}
                        placeholder="Nome comune o scientifico"
                        className="h-11 rounded-xl pl-10 text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {readySummaryCards.map((card) => (
                    <button
                      type="button"
                      key={card.atlasId}
                      onClick={() => setSelectedSummaryId(card.atlasId)}
                      className="group overflow-hidden rounded-[22px] border border-[#d8e0d5] bg-[#fbfaf4] text-left transition hover:border-[#92ad96] hover:shadow-[0_14px_35px_rgba(23,79,43,0.10)]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#f1eee4]">
                        <img
                          src={card.presentation.primaryImageUrl ?? ""}
                          alt={`${card.displayCommonName} — ${card.scientificName}`}
                          className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-[#dfe5dc] p-4">
                        <div className="min-w-0">
                          <h2 className="break-words text-lg font-black">{card.displayCommonName}</h2>
                          <p className="mt-0.5 break-words font-serif italic text-[#31553b]">{card.scientificName}</p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#66786b]">
                            {card.rank}
                          </p>
                        </div>
                        <SporePrint token={card.presentation.sporePrint} size="sm" />
                      </div>
                    </button>
                  ))}
                </div>

                {readySummaryCards.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-[#cbd8c9] p-7 text-center text-[#617266]">
                    Nessuna Scheda pronta corrisponde alla ricerca.
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#dce5da] bg-[#f8faf7] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#6b7d70]">Pronte S1</p>
                    <p className="mt-1 text-3xl font-black">{summaryCardShells.filter(isSummaryCardReady).length}</p>
                    <p className="mt-1 text-sm text-[#5f7064]">prime Schede revisionate</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5da] bg-[#f8faf7] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#6b7d70]">Copertura strutturale</p>
                    <p className="mt-1 text-3xl font-black">{summaryCardShells.length}</p>
                    <p className="mt-1 text-sm text-[#5f7064]">voci Atlante predisposte</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce5da] bg-[#f8faf7] p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#6b7d70]">Regola</p>
                    <p className="mt-1 text-lg font-black">Atlante → Schede</p>
                    <p className="mt-1 text-sm text-[#5f7064]">nessuna identità scientifica duplicata</p>
                  </div>
                </div>
              </>
            )}
          </section>
        </TabsContent>

        <TabsContent value="metodo" className="mt-0 min-w-0">
          <section className="grid min-w-0 gap-4 lg:grid-cols-3">
            <MethodCard icon={Binoculars} number="01" title="Guarda l’area, non il punto" text="Le indicazioni riguardano celle ampie. Percorsi, coordinate precise e fungaie personali non vengono pubblicati." />
            <MethodCard icon={Users} number="02" title="Pressione anonima e ritardata" text="Mostriamo soltanto fasce di passaggio dopo un ritardo. Nessuna identità, traccia o orario esatto è ricostruibile." />
            <MethodCard icon={ShieldCheck} number="03" title="Verifica micologica" text="Segnalazioni e modifiche del catalogo entrano in revisione e sono assegnabili per regione e gruppo tassonomico." />
            <div className="min-w-0 rounded-[24px] border border-[#ead58c] bg-[#fff8dc] p-5 lg:col-span-3 sm:p-6">
              <div className="flex items-start gap-4">
                <CircleAlert className="mt-1 size-7 shrink-0 text-[#a86e08]" />
                <div className="min-w-0">
                  <h2 className="text-xl font-black">Regola fondamentale</h2>
                  <p className="mt-2 max-w-4xl leading-relaxed text-[#67541f]">
                    Una fotografia, un algoritmo o una scheda online non possono stabilire da soli la commestibilità. Per il consumo serve una determinazione certa e, quando previsto, il controllo dell’Ispettorato micologico competente.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {isMobile && selectedArea && selectedForecast && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[82dvh] rounded-t-[24px] pb-[env(safe-area-inset-bottom)]">
            <DrawerHeader className="px-4 pb-2 text-left">
              <DrawerTitle className="break-words text-xl font-black">{selectedArea.name}</DrawerTitle>
              <DrawerDescription>{selectedArea.region} · area vasta</DrawerDescription>
            </DrawerHeader>
            <div className="min-w-0 overflow-y-auto px-4 pb-6">
              <AreaDetails area={selectedArea} forecast={selectedForecast} taxa={selectedTaxa} />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <div className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 sm:hidden">
        <Button asChild className="h-12 w-full rounded-2xl bg-[#174f2b] text-base shadow-[0_12px_30px_rgba(16,58,30,0.28)] hover:bg-[#0f3f20]">
          <a href="/observations/new">
            <Upload />
            Segnala una specie
          </a>
        </Button>
      </div>
    </main>
  );
}

function CatalogSearchResultCard({
  item,
  onOpen,
}: {
  item: PublicCatalogSearchDocument;
  onOpen: (item: PublicCatalogSearchDocument) => void;
}) {
  const edibility = item.edibilityCategory
    ? {
        EDIBLE: "Commestibile",
        EDIBLE_AFTER_TREATMENT: "Dopo trattamento",
        DISCOURAGED: "Sconsigliato",
        NO_FOOD_VALUE: "Privo di valore alimentare",
        NOT_EDIBLE: "Non commestibile",
        POISONOUS: "Tossico",
        NOT_ASSESSED: "Non valutato",
      }[item.edibilityCategory]
    : null;

  return (
    <article className="min-w-0 rounded-2xl border border-[#dde6db] bg-[#fbfcfa] p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-[#66806d]">
            {item.kind === "teachingGroup" ? "Genere / gruppo didattico" : "Taxon Minimo"}
          </p>
          <h2 className="mt-1 break-words text-lg font-black">{item.title}</h2>
          {item.sourceLabel !== item.title && (
            <p className="mt-1 break-words text-sm text-[#5f7064]">
              S1: {item.sourceLabel}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-[#eaf1e8] px-2.5 py-1 text-xs font-bold text-[#315d3c]">
          {item.rank}
        </span>
      </div>
      {item.currentNames.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#6d7e72]">Nomi correnti</p>
          <p className="mt-1 break-words font-serif italic text-[#31553b]">
            {item.currentNames.join(" · ")}
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.genera.slice(0, 5).map((genus) => (
          <span key={genus} className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#4e6655] ring-1 ring-[#dce5da]">
            {genus}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#617266]">
        <span>{edibility ?? "Valutazione riferita al gruppo"}</span>
        <span>{item.reviewStatus === "reviewNeeded" ? "In revisione" : item.reviewStatus}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpen(item)}
        className="mt-4 h-11 w-full rounded-xl border-[#b9cbb8] text-[#315d3c]"
      >
        Apri scheda
      </Button>
    </article>
  );
}

function AreaFilters({
  query,
  setQuery,
  region,
  setRegion,
  regions,
}: {
  query: string;
  setQuery: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  regions: string[];
}) {
  return (
    <div className="border-b border-[#e1e8df] p-4">
      <div className="mb-4 flex min-w-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#58705e]">Aree consigliate</p>
          <h1 className="break-words text-2xl font-black tracking-[-0.04em]">Dove vale la pena cercare</h1>
        </div>
        <span className="shrink-0 rounded-full bg-[#eff5ed] px-3 py-1 text-xs font-bold text-[#386047]">Italia</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f8173]" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Zona, regione o bosco"
          className="h-11 rounded-xl border-[#d4dfd2] bg-[#f8faf7] pl-10 text-base"
        />
      </div>
      <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filtro regione">
        {regions.map((entry) => (
          <button
            type="button"
            key={entry}
            onClick={() => setRegion(entry)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              region === entry
                ? "border-[#174f2b] bg-[#174f2b] text-white"
                : "border-[#d7e1d5] bg-white text-[#4e6655] hover:border-[#9bb29f]",
            )}
          >
            {entry}
          </button>
        ))}
      </div>
    </div>
  );
}

function AreaButton({
  area,
  forecast,
  index,
  active,
  onSelect,
}: {
  area: Area;
  forecast: ForecastResult;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(area.id)}
      className={cn(
        "w-full min-w-0 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6fa67b]/30",
        active
          ? "border-[#3f7d50] bg-[#f1f8ef] shadow-[0_8px_25px_rgba(23,79,43,0.10)]"
          : "border-[#e0e7de] bg-white hover:border-[#a9bea9] hover:bg-[#fafcf9]",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf3eb] text-sm font-black text-[#4b6852]">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="break-words font-extrabold leading-tight tracking-[-0.02em]">{area.name}</div>
              <div className="mt-1 flex min-w-0 items-center gap-1 text-sm text-[#617266]">
                <MapPin className="size-3.5 shrink-0" />
                <span className="break-words">{area.region}</span>
              </div>
            </div>
            <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs font-black", scoreStyles[forecast.recommendation])}>
              {forecast.recommendation}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {area.habitat.slice(0, 3).map((habitat) => (
              <span key={habitat} className="rounded-full bg-[#eaf1e8] px-2 py-1 text-xs font-semibold text-[#3e6548]">
                {habitat}
              </span>
            ))}
          </div>
          <div className="mt-3 flex min-w-0 items-center justify-between gap-2 text-xs font-semibold text-[#627268]">
            <span className="flex min-w-0 items-center gap-1">
              <Users className="size-3.5 shrink-0" />
              <span>{getVisitPressure(area.delayedVisitors)} passaggi</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[#1f6333]">
              Dettagli <ChevronRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function AreaDetails({
  area,
  forecast,
  taxa,
  compact = false,
}: {
  area: Area;
  forecast: ForecastResult;
  taxa: Taxon[];
  compact?: boolean;
}) {
  return (
    <article className="min-w-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-[#5d7362]">
            <MapPin className="size-4 shrink-0" />
            <span className="break-words">{area.region}</span>
          </div>
          <h2 className="break-words text-2xl font-black leading-tight tracking-[-0.04em]">{area.name}</h2>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("inline-flex rounded-full border px-3 py-1 text-sm font-black", scoreStyles[forecast.recommendation])}>
            {forecast.recommendation}
          </div>
          <div className="mt-1 text-xs font-bold text-[#637369]">
            indice {forecast.score}/100 · confidenza {confidenceLabel(forecast.confidence)}
          </div>
        </div>
      </div>

      <div className={cn("mt-4 grid gap-2", compact ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" : "grid-cols-2")}>
        <Metric icon={Trees} label="Ecologia" value={String(forecast.components.ecologicalSuitability) + "/100"} />
        <Metric icon={CloudRain} label="Meteo" value={forecast.components.weatherFit === null ? "non disponibile" : String(forecast.components.weatherFit) + "/100"} />
        <Metric icon={Sparkles} label="Crescita" value={forecast.components.fruitingTriggerFit === null ? "non disponibile" : String(forecast.components.fruitingTriggerFit) + "/100"} />
        <Metric icon={CloudRain} label="Piogge 7/14/26g" value={forecast.components.rainHistoryFit === null ? "non disponibile" : String(forecast.components.rainHistoryFit) + "/100"} />
        <Metric icon={Leaf} label="Fenologia" value={String(forecast.components.speciesPhenologyFit) + "/100"} />
        <Metric icon={MapPin} label="Quota" value={String(forecast.components.altitudeSeasonFit) + "/100"} />
        <Metric icon={Users} label="Pressione" value={getVisitPressure(area.delayedVisitors)} />
      </div>

      {forecast.weather && (
        <div className="mt-3 min-w-0 rounded-xl border border-[#dce7d9] bg-[#f8fbf7] p-3">
          <div className="text-xs font-black uppercase tracking-[0.08em] text-[#597160]">Dati Open-Meteo usati</div>
          <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 text-sm">
            <span><strong>{forecast.weather.temperatureC ?? "–"} °C</strong><br /><small>temperatura</small></span>
            <span><strong>{forecast.weather.relativeHumidity ?? "–"}%</strong><br /><small>umidità relativa</small></span>
            <span><strong>{forecast.weather.precipitation7dMm ?? "–"} mm</strong><br /><small>pioggia 7 giorni osservati</small></span>
            <span><strong>{forecast.weather.precipitation14dMm ?? "–"} mm</strong><br /><small>pioggia 14 giorni osservati</small></span>
            <span><strong>{forecast.weather.precipitation26dMm ?? "–"} mm</strong><br /><small>pioggia 26 giorni osservati</small></span>
            <span><strong>{forecast.weather.meanTemperature20dC ?? "–"} °C</strong><br /><small>temperatura media 20 giorni</small></span>
            <span><strong>{forecast.weather.waterBalance14dMm ?? "–"} mm</strong><br /><small>bilancio idrico 14 giorni</small></span>
            <span><strong>{forecast.weather.elevationM ?? "–"} m</strong><br /><small>quota modello meteo</small></span>
          </div>
          <p className="mt-2 break-words text-xs text-[#708076]">
            Rilevazione {forecast.weatherObservedAt ? new Date(forecast.weatherObservedAt).toLocaleString("it-IT") : "non disponibile"}; probabilità pioggia odierna {forecast.weather.precipitationProbability ?? "–"}%.
          </p>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#597160]">Perché</h3>
        <ul className="mt-2 space-y-2">
          {forecast.reasons.map((reason) => (
            <li key={reason.code} className="flex min-w-0 gap-2 text-sm leading-relaxed">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[#ce8a18]" />
              <span className="min-w-0 break-words">{reason.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {area.evidenceSources && area.evidenceSources.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#597160]">Fonti territoriali</h3>
          <div className="mt-2 space-y-2">
            {area.evidenceSources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-[#dfe7dc] bg-white p-3 text-sm font-semibold text-[#315d3c] underline-offset-2 hover:underline"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#597160]">Taxa compatibili</h3>
        <div className={cn("mt-2 grid min-w-0 gap-2", compact && "sm:grid-cols-2")}>
          {taxa.map((taxon) => (
            <div key={taxon.id} className="min-w-0 rounded-xl bg-[#f2f6f0] p-3">
              <div className="break-words font-bold leading-snug">
                {taxon.commonName}{" "}
                <em className="font-medium text-[#52675a]">{taxon.scientificName}</em>
              </div>
              <div className="mt-1 break-words text-xs leading-relaxed text-[#647568]">
                Livello: {taxon.rank}. Associazioni: {taxon.hosts?.join(", ") || "da documentare"}.
              </div>
            </div>
          ))}
          {taxa.length === 0 && (
            <div className="rounded-xl bg-[#f2f6f0] p-3 text-sm text-[#647568]">
              Nessun taxon pubblicabile associato a questa area.
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 flex min-w-0 gap-2 rounded-xl border border-[#ead58c] bg-[#fff8dc] p-3 text-xs leading-relaxed text-[#67541f]">
        <CircleAlert className="mt-0.5 size-4 shrink-0" />
        <span>Previsione di condizioni favorevoli, non conferma di presenza né identificazione.</span>
      </p>
    </article>
  );
}

function TaxonCard({ taxon }: { taxon: AtlasTaxon }) {
  const [images, setImages] = useState<Array<{ id: string; imageUrl: string; sourceUrl: string; author: string; license: string; licenseUrl: string; caption: string; verified: boolean }> | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const loadGallery = () => {
    if (images !== null || galleryLoading) return;
    setGalleryLoading(true);
    fetch(`/api/media?taxon=${encodeURIComponent(taxon.acceptedName)}`)
      .then((response) => response.json() as Promise<{ images?: typeof images }>)
      .then((payload) => setImages(payload.images ?? []))
      .catch(() => setImages([]))
      .finally(() => setGalleryLoading(false));
  };
  return (
    <article className="min-w-0 rounded-2xl border border-[#dde6db] bg-[#fbfcfa] p-4 transition hover:border-[#9fb6a2] hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-black tracking-[-0.02em]">{taxon.commonName}</h2>
          <p className="mt-0.5 break-words font-serif text-[17px] italic leading-snug text-[#31553b]">{taxon.scientificName}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#eaf2e8] px-2 py-1 text-xs font-bold text-[#416549]">{taxon.rank}</span>
      </div>
      {taxon.regionalNames.length > 0 && (
        <div className="mt-3 min-w-0 rounded-xl bg-white p-3 text-sm">
          <div className="font-bold text-[#516657]">Nomi regionali</div>
          {taxon.regionalNames.map((entry) => (
            <div key={[entry.name, ...entry.regions].join("-")} className="mt-1 break-words">
              <strong>{entry.name}</strong> · {entry.regions.join(", ")}
            </div>
          ))}
        </div>
      )}
      {taxon.aliases.length > 0 && (
        <p className="mt-3 break-words text-sm text-[#5f7064]">
          Sinonimi: <em>{taxon.aliases.join(", ")}</em>
        </p>
      )}
      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-[#e3e9e1] pt-3 text-sm">
        <span className="font-bold text-[#315d3c]">{edibilityLabels[taxon.edibility]}</span>
        <span className="text-xs font-semibold text-[#708076]">Livello {taxon.recognitionLevel}</span>
      </div>
      <p className="mt-3 flex min-w-0 gap-2 text-xs leading-relaxed text-[#6b5c30]">
        <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-[#b27c16]" />
        <span className="min-w-0 break-words">{taxon.safetyNote}</span>
      </p>
      <details className="mt-3 min-w-0 rounded-xl border border-[#dfe7dc] bg-white p-3 text-sm">
        <summary className="cursor-pointer font-bold text-[#315d3c]">Caratteri, ecologia e galleria</summary>
        <div className="mt-3 space-y-2 break-words leading-relaxed text-[#52675a]">
          <p><strong>Ordine:</strong> {taxon.order}{taxon.family ? ` · ${taxon.family}` : ""}</p>
          <p><strong>Caratteri:</strong> {taxon.diagnosticCharacters.length ? taxon.diagnosticCharacters.join("; ") : "Scheda diagnostica in revisione editoriale."}</p>
          <p><strong>Odore:</strong> {taxon.odor ?? "Non documentato come carattere distintivo nelle fonti di base."}</p>
          <p><strong>Habitat e associazioni:</strong> {taxon.ecology.length ? taxon.ecology.join("; ") : "Da integrare con fonte micologica verificata."}</p>
          <Button type="button" variant="outline" className="h-11 w-full rounded-xl" onClick={loadGallery}>{galleryLoading ? "Ricerca immagini…" : "Apri galleria con licenze"}</Button>
          {images !== null && images.length === 0 && <p className="rounded-xl bg-[#f2f6f0] p-3 text-center font-bold">Galleria in preparazione</p>}
          {images && images.length > 0 && <div className="grid grid-cols-2 gap-2">{images.map((image) => <div key={image.id} className="min-w-0 overflow-hidden rounded-xl border bg-white">
            <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={image.imageUrl} alt={image.caption} className="aspect-square w-full object-cover" loading="lazy" />
            </a>
            <div className="break-words p-2 text-[11px]">
              <p>{image.author}</p>
              <a href={image.licenseUrl} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">{image.license}</a>
              {image.verified && <span className="ml-1 text-[#315d3c]">· verificata</span>}
            </div>
          </div>)}</div>}
        </div>
      </details>
      {taxon.objectiveSummary && (
        <details className="mt-3 min-w-0 rounded-xl border border-[#dfe7dc] bg-white p-3 text-sm">
          <summary className="cursor-pointer font-bold text-[#315d3c]">Obiettivi e fonti</summary>
          <div className="mt-2 space-y-2 break-words leading-relaxed text-[#52675a]">
            {taxon.objectiveSummary.minimum && <p><strong>Minimo:</strong> {taxon.objectiveSummary.minimum}</p>}
            {taxon.objectiveSummary.desirable && <p><strong>Auspicabile:</strong> {taxon.objectiveSummary.desirable}</p>}
            {taxon.objectiveSummary.advanced && <p><strong>Approfondimento:</strong> {taxon.objectiveSummary.advanced}</p>}
            {taxon.sources && (
              <p className="text-xs text-[#708076]">
                Fonti: {taxon.sources.map((source) => `${source.title}, p. ${source.page}`).join("; ")}.
              </p>
            )}
          </div>
        </details>
      )}
      <Button asChild variant="outline" className="mt-4 h-11 w-full rounded-xl border-[#b9cbb8] text-[#315d3c]">
        <Link href="/catalog/proposals/new">Proponi una correzione</Link>
      </Button>
    </article>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#edf4eb] p-2.5">
      <Icon className="size-4 text-[#3f7049]" />
      <div className="mt-1 text-xs font-bold uppercase tracking-wide text-[#718077]">{label}</div>
      <div className="mt-0.5 break-words text-sm font-black capitalize">{value}</div>
    </div>
  );
}

function MethodCard({ icon: Icon, number, title, text }: { icon: typeof Leaf; number: string; title: string; text: string }) {
  return (
    <article className="min-w-0 rounded-[24px] border border-[#dce5da] bg-white p-6 shadow-[0_16px_45px_rgba(23,79,43,0.07)]">
      <div className="flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-2xl bg-[#e7f0e4] text-[#205d34]"><Icon className="size-6" /></div>
        <span className="font-serif text-3xl italic text-[#b7c5b7]">{number}</span>
      </div>
      <h2 className="mt-5 break-words text-xl font-black tracking-[-0.03em]">{title}</h2>
      <p className="mt-2 break-words leading-relaxed text-[#5d7062]">{text}</p>
    </article>
  );
}

function confidenceLabel(confidence: ForecastResult["confidence"]) {
  if (confidence === "high") return "alta";
  if (confidence === "medium") return "media";
  return "bassa";
}
