export const LEARNING_VERSION = 1;
export type LearningProgress = { version: 1; userId: string; studied: string[]; review: string[]; attempts: Record<string, { correct: number; incorrect: number }>; };
export function emptyLearningProgress(userId: string): LearningProgress { return { version: 1, userId, studied: [], review: [], attempts: {} }; }
export function learningStorageKey(userId: string) { return "fungo-learning-v1:" + encodeURIComponent(userId); }
export function parseLearningProgress(raw: string | null, userId: string, allowedIds: readonly string[]): LearningProgress {
  const empty = emptyLearningProgress(userId);
  if (!raw) return empty;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return empty;
    const input = value as Record<string, unknown>;
    if (input.version !== LEARNING_VERSION || input.userId !== userId) return empty;
    const allowed = new Set(allowedIds);
    const ids = (v: unknown) => Array.isArray(v) ? [...new Set(v.filter((id): id is string => typeof id === "string" && allowed.has(id)))] : [];
    const attempts: LearningProgress["attempts"] = {};
    if (input.attempts && typeof input.attempts === "object" && !Array.isArray(input.attempts)) {
      for (const [id, attempt] of Object.entries(input.attempts)) {
        if (!allowed.has(id) || !attempt || typeof attempt !== "object") continue;
        const a = attempt as Record<string, unknown>;
        if (Number.isSafeInteger(a.correct) && Number.isSafeInteger(a.incorrect) && Number(a.correct) >= 0 && Number(a.incorrect) >= 0) attempts[id] = { correct: Number(a.correct), incorrect: Number(a.incorrect) };
      }
    }
    return { ...empty, studied: ids(input.studied), review: ids(input.review), attempts };
  } catch { return empty; }
}
export function recordLearningAttempt(progress: LearningProgress, id: string, correct: boolean): LearningProgress {
  const previous = progress.attempts[id] ?? { correct: 0, incorrect: 0 };
  return { ...progress, attempts: { ...progress.attempts, [id]: { correct: previous.correct + Number(correct), incorrect: previous.incorrect + Number(!correct) } }, review: correct ? progress.review.filter((entry) => entry !== id) : [...new Set([...progress.review, id])] };
}
