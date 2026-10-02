"use client";
import { Button } from "@/components/ui/button";
import { adjacentStudyIds } from "@/lib/study-navigation";
export function StudyNavigation({ ids, selectedId, onSelect, onClose }: { ids: readonly string[]; selectedId: string; onSelect: (id: string) => void; onClose: () => void }) {
  const navigation = adjacentStudyIds(ids, selectedId);
  return <nav aria-label="Navigazione delle schede" className="sticky top-16 z-30 mb-4 rounded-2xl border border-[#dce5da] bg-white/95 p-2 backdrop-blur">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Torna all’elenco</Button>
      <span role="status" aria-live="polite" className="text-sm font-semibold">{navigation.index >= 0 ? (navigation.index + 1) + " di " + navigation.total : "Scheda fuori dai filtri correnti"}</span>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" className="min-h-11" disabled={!navigation.previousId} onClick={() => { if (navigation.previousId) onSelect(navigation.previousId); }}>← Scheda precedente</Button>
      <Button type="button" variant="outline" className="min-h-11" disabled={!navigation.nextId} onClick={() => { if (navigation.nextId) onSelect(navigation.nextId); }}>Scheda successiva →</Button>
    </div>
  </nav>;
}
