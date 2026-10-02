export type ObservationInput = {
  description: string;
  observedAt: string;
  latitude: number;
  longitude: number;
  photoCount: number;
};

export function aggregateCoordinates(latitude: number, longitude: number) {
  const grid = 0.2;
  const center = (value: number) => Number((Math.floor(value / grid) * grid + grid / 2).toFixed(1));
  return { lat: Math.max(-89.9, Math.min(89.9, center(latitude))), lng: Math.max(-179.9, Math.min(179.9, center(longitude))) };
}

export function validateObservation(input: ObservationInput, now = new Date()) {
  const errors: string[] = [];
  if (input.description.trim().length < 20) {
    errors.push("Descrivi habitat e caratteri osservati (almeno 20 caratteri).");
  }
  if (!input.observedAt) {
    errors.push("Inserisci la data dell'osservazione.");
  } else {
    const isoDate = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
    const timestamp = Date.parse(input.observedAt);
    const day = new Date(input.observedAt.slice(0, 10) + "T00:00:00Z");
    const validDay = Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === input.observedAt.slice(0, 10);
    if (!isoDate.test(input.observedAt) || !Number.isFinite(timestamp) || !validDay) {
      errors.push("Inserisci una data di osservazione valida.");
    } else if (timestamp > now.getTime() + 24 * 60 * 60 * 1000) {
      errors.push("La data di osservazione non può essere futura.");
    }
  }
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude) || input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) {
    errors.push("Inserisci coordinate valide.");
  }
  if (input.photoCount < 1) errors.push("Allega almeno una fotografia.");
  else if (!Number.isInteger(input.photoCount) || input.photoCount > 6) errors.push("Allega da una a sei fotografie.");
  return errors;
}

export function normalizeProposedTaxonId(value: string, allowedIds: ReadonlySet<string>) {
  return value && allowedIds.has(value) ? value : null;
}
