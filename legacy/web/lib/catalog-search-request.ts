const searchKeys = new Set([
  "q",
  "kind",
  "rank",
  "genus",
  "edibility",
  "reviewStatus",
  "limit",
  "offset",
]);

export function shouldUseCatalogServerSearch(params: URLSearchParams) {
  for (const key of searchKeys) {
    if (params.has(key)) return true;
  }
  return false;
}
