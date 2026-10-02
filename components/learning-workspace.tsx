"use client";
import { useEffect, useState } from "react";
import type { TrainingObjectiveRecord } from "@/lib/atlas-catalog";
import { emptyLearningProgress, learningStorageKey, parseLearningProgress, recordLearningAttempt, type LearningProgress } from "@/lib/learning-progress";
import { glossaryEditorialNote, mycologyGlossary } from "@/lib/mycology-glossary";

export function LearningWorkspace({ userId, objectives }: { userId: string; objectives: TrainingObjectiveRecord[] }) {
  const [progress, setProgress] = useState<LearningProgress>(() => emptyLearningProgress(userId));
  const [ready, setReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("Caricamento del progresso…");
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setProgress(parseLearningProgress(window.localStorage.getItem(learningStorageKey(userId)), userId, objectives.map((item) => item.id)));
        setStorageMessage("Progresso locale caricato. Disponibile solo in questo browser e per questo account.");
      } catch { setStorageMessage("Archivio del browser non disponibile: puoi studiare, ma il progresso resta solo nella sessione."); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId, objectives]);
  const visible = objectives.filter((item) => item.scientificName.toLocaleLowerCase("it").includes(query.toLocaleLowerCase("it")) && (!reviewOnly || progress.review.includes(item.id)));
  const selected = visible[Math.min(index, Math.max(0, visible.length - 1))];
  const save = (next: LearningProgress) => {
    setProgress(next);
    try {
      window.localStorage.setItem(learningStorageKey(userId), JSON.stringify(next));
      setStorageMessage("Progresso salvato in questo browser per il tuo account.");
    } catch { setStorageMessage("Salvataggio non disponibile: progresso mantenuto solo nella sessione."); }
  };
  const resetExercise = () => { setNotes(""); setFeedback(null); };
  const move = (direction: number) => { setIndex(Math.max(0, Math.min(visible.length - 1, index + direction))); resetExercise(); };
  const answer = (understood: boolean) => {
    if (!selected) return;
    save(recordLearningAttempt(progress, selected.id, understood));
    const explanation = understood
      ? "Autoverifica registrata. Confronta comunque gli appunti con il testo della fonte: la tua valutazione non prova una determinazione sul campo."
      : "Argomento aggiunto al ripasso. Rileggi i livelli richiesti e identifica quali passaggi o taxa devi discutere con il docente.";
    setFeedback(explanation + " Fonte del confronto: " + selected.sources.minimumObjectives.title + ", p. " + selected.sources.minimumObjectives.page + ". Il formato dell’esercizio è editoriale.");
  };
  return <div className="space-y-6">
    <section aria-labelledby="study-phases" className="rounded-2xl border p-4">
      <h2 id="study-phases" className="text-xl font-bold">Tre fasi del tuo percorso</h2>
      <ol className="mt-3 list-decimal space-y-3 pl-5">
        <li><strong>Amiata · studio con docente.</strong> Seleziona gli obiettivi affrontati, osserva l’esemplare completo e annota i dubbi da discutere. <a className="underline" href="/?tab=cerca&amp;area=amiata">Consulta Monte Amiata</a>. Gli obiettivi nazionali non attestano la presenza locale.</li>
        <li><strong>Durante Tenerife · fino al rientro del 20 ottobre.</strong> Ripassa gli argomenti segnati; le osservazioni locali richiedono fonti e regole territoriali proprie. Per consultare le schede senza rete <a className="underline" href="/?tab=schede">scarica il pacchetto pubblico</a> prima della partenza. Questo percorso di obiettivi richiede ancora connessione.</li>
        <li><strong>Settimana dopo il rientro.</strong> Parti dagli argomenti “Da ripassare”, confronta gli appunti con le fonti e discuti gli errori con il docente.</li>
      </ol>
    </section>
    <section aria-labelledby="learning-progress" className="rounded-2xl border p-4">
      <h2 id="learning-progress" className="text-xl font-bold">Attività di studio</h2>
      <p data-testid="learning-counts">{progress.studied.length} argomenti studiati · {progress.review.length} da ripassare</p>
      <p role="status" data-testid="learning-storage-status" className="mt-2 text-sm">{storageMessage}</p>
      <p className="mt-2 text-sm">I risultati sono autovalutazioni. Tutti gli argomenti restano accessibili.</p>
    </section>
    <label className="block">Cerca un argomento
      <input value={query} onChange={(event) => { setQuery(event.target.value); setIndex(0); resetExercise(); }} className="mt-1 min-h-11 w-full rounded-lg border p-2 text-base" />
    </label>
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={reviewOnly} onChange={(event) => { setReviewOnly(event.target.checked); setIndex(0); resetExercise(); }} />Solo argomenti da ripassare</label>
    {feedback && <p role="status" data-testid="learning-feedback" className="rounded-lg bg-green-50 p-3">{feedback}</p>}
    {selected ? <article className="space-y-4 rounded-2xl border p-4" data-testid="learning-objective">
      <h2 className="text-2xl font-bold">{selected.scientificName}</h2>
      <p>Obiettivo formativo · {selected.rank}</p>
      <p className="rounded-lg bg-amber-50 p-3 text-sm">Testo della fonte didattica, non giudizio di commestibilità approvato dell’app. Per raccolta e consumo usa il percorso di verifica micologica.</p>
      {(["minimum", "desirable", "advanced"] as const).map((level, i) => selected.objectives[level] && <section key={level}>
        <h3 className="font-bold">{["Minimo", "Auspicabile", "Approfondimento"][i]}</h3>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{selected.objectives[level]}</p>
      </section>)}
      <p className="text-sm" data-testid="learning-source">Fonte del testo: {selected.sources.minimumObjectives.title}, p. {selected.sources.minimumObjectives.page}. Trascrizione del corpus dell’app; non verifica indipendente della pubblicazione.</p>
      <details className="rounded-lg border p-3">
        <summary className="min-h-11 cursor-pointer font-bold">Glossario per questa lettura</summary>
        <p className="text-sm">{glossaryEditorialNote}</p>
        <dl className="mt-3 space-y-3">{mycologyGlossary.map((entry) => <div key={entry.term}><dt className="font-bold">{entry.term}</dt><dd>{entry.definition}</dd></div>)}</dl>
      </details>
      <section className="space-y-3 border-t pt-4">
        <h3 className="font-bold">Esercizio di richiamo</h3>
        <p>Prima di rileggere: quali livelli di riconoscimento richiede questo obiettivo e quali argomenti devi ancora verificare? Scrivi i tuoi appunti, poi confrontali con il testo sopra.</p>
        <label className="block">Appunti dell’esercizio (solo per questa sessione)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-28 w-full rounded-lg border p-2 text-base" /></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!ready || !notes.trim()} onClick={() => answer(true)} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Ho confrontato: obiettivo chiaro</button>
          <button type="button" disabled={!ready} onClick={() => answer(false)} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Ho dubbi: aggiungi al ripasso</button>
        </div>
      </section>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!ready} onClick={() => save({...progress, studied: progress.studied.includes(selected.id) ? progress.studied.filter(id => id !== selected.id) : [...progress.studied, selected.id]})} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">{progress.studied.includes(selected.id) ? "Rimuovi dai già studiati" : "Segna argomento studiato"}</button>
        <button type="button" disabled={index === 0} onClick={() => move(-1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Argomento precedente</button>
        <button type="button" disabled={index >= visible.length - 1} onClick={() => move(1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Argomento successivo</button>
      </div>
    </article> : <p role="status">Nessun argomento corrisponde ai filtri.</p>}
  </div>;
}
