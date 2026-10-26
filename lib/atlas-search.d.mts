export interface AtlasSearchItem {
  id: string;
  scientificName: string;
  commonNames?: string[];
  aliases?: string[];
  currentAcceptedNames?: string[];
  currentGenera?: string[];
  curriculum?: { level?: string };
}

export interface AtlasSearchOptions {
  level?: 'minimum' | 'desirable' | 'deep';
  onlyFavorites?: boolean;
  favoriteIds?: string[];
}

export function atlasSearchText<T extends AtlasSearchItem>(taxon: T): string;
export function searchAtlas<T extends AtlasSearchItem>(
  taxa: T[],
  query: string,
  options?: AtlasSearchOptions
): T[];
