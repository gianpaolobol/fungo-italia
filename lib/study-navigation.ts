export function adjacentStudyIds(ids: readonly string[], selectedId: string | null) {
  const index = selectedId === null ? -1 : ids.indexOf(selectedId);
  return { index, total: ids.length, previousId: index > 0 ? ids[index - 1] : null, nextId: index >= 0 && index + 1 < ids.length ? ids[index + 1] : null };
}
export function studyFeedLimit(value: unknown, total: number): number {
  const parsed = typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : 10;
  return Math.min(total, Math.max(10, Math.min(500, Number.isSafeInteger(parsed) ? parsed : 10)));
}
