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
  return { lat: center(latitude), lng: center(longitude) };
}

export function validateObservation(input: ObservationInput) {
  const errors: string[] = [];
  if (input.description.trim().length < 20) {
    errors.push("Descrivi habitat e caratteri osservati (almeno 20 caratteri).");
  }
  if (!input.observedAt) errors.push("Inserisci la data dell'osservazione.");
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude) || input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) {
    errors.push("Inserisci coordinate valide.");
  }
  if (input.photoCount < 1) errors.push("Allega almeno una fotografia.");
  return errors;
}

export function normalizeProposedTaxonId(value: string, allowedIds: ReadonlySet<string>) {
  return value && allowedIds.has(value) ? value : null;
}
