export function normalizeCommonsLicense(license: string) {
  return license
    .toLocaleLowerCase("en")
    .replace(/[–—]/g, "-")
    .replace(/[_\s]+/g, " ")
    .trim();
}

export function isCompatibleCommonsLicense(license: string) {
  const value = normalizeCommonsLicense(license);
  if (!value) return false;

  // The beta may later contain commercial components; reject NC and ND
  // variants instead of relying on a permissive substring match.
  if (/\bnon[- ]?commercial\b|\bnc\b|\bno[- ]?derivatives\b|\bnd\b/.test(value)) {
    return false;
  }

  return (
    /\bcc0\b/.test(value) ||
    value.includes("public domain") ||
    /\bcc by(?:-sa)?(?:\s|$)/.test(value) ||
    value.includes("creative commons attribution") ||
    value.includes("creative commons share alike")
  );
}

export function stripHtml(value: string | undefined) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTaxonForMedia(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/\b(?:s\.?\s*l\.?|s\.?\s*str\.?)\b/g, " ")
    .replace(/[^a-z0-9-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function taxonMediaMatchScore(
  requestedTaxon: string,
  fields: readonly string[],
) {
  const requested = normalizeTaxonForMedia(requestedTaxon);
  if (!requested) return 0;

  const terms = requested.split(" ").filter(Boolean);
  const genus = terms[0] ?? "";
  const epithet = terms[1] ?? "";
  const haystack = normalizeTaxonForMedia(fields.join(" "));

  if (haystack.includes(requested)) return 3;
  if (genus && epithet && haystack.includes(genus) && haystack.includes(epithet)) return 2;
  if (genus && haystack.includes(genus)) return 1;
  return 0;
}

export type CommonsMediaCandidate = {
  id: string;
  imageUrl: string;
  sourceUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  caption: string;
  matchScore: number;
  verified: boolean;
};

export function buildCommonsCandidate(input: {
  id: string;
  requestedTaxon: string;
  imageUrl?: string;
  sourceUrl?: string;
  title: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  caption?: string;
  categories?: string;
}): CommonsMediaCandidate | null {
  const license = stripHtml(input.license);
  const licenseUrl = stripHtml(input.licenseUrl);
  const imageUrl = input.imageUrl?.trim();
  const sourceUrl = input.sourceUrl?.trim();
  if (!imageUrl || !sourceUrl || !licenseUrl || !isCompatibleCommonsLicense(license)) {
    return null;
  }

  const caption = stripHtml(input.caption) || input.title.replace(/^File:/, "");
  const matchScore = taxonMediaMatchScore(input.requestedTaxon, [
    input.title,
    caption,
    input.categories ?? "",
  ]);

  // Species queries require at least genus + epithet evidence in metadata.
  // Broader source concepts may still be shown at genus level.
  const requestedTerms = normalizeTaxonForMedia(input.requestedTaxon).split(" ").filter(Boolean);
  const minimumScore = requestedTerms.length >= 2 ? 2 : 1;
  if (matchScore < minimumScore) return null;

  return {
    id: input.id,
    imageUrl,
    sourceUrl,
    author: stripHtml(input.author) || "Autore indicato su Wikimedia Commons",
    license,
    licenseUrl,
    caption,
    matchScore,
    verified: true,
  };
}
