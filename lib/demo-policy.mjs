// Select by the primary taxon label, never by an alias of a different genus.
export function agaricusOnly(rows){return rows.filter(t=>/^Agaricus(?:\s|$)/.test(t.scientificName??t.name??''));}
