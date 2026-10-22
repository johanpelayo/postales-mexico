export const STORAGE_KEY = "postales-mexico:album:v1";
export interface AlbumSnapshot {
  schemaVersion: 1;
  savedIds: string[];
  exploredIds: string[];
  updatedAt: string | null;
}
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type AlbumAction = { type: "explore" | "save" | "remove"; id: string };
export const emptyAlbum = (): AlbumSnapshot => ({
  schemaVersion: 1,
  savedIds: [],
  exploredIds: [],
  updatedAt: null,
});

export function parseAlbum(
  raw: string | null,
  knownIds: readonly string[],
): AlbumSnapshot {
  if (raw === null) return emptyAlbum();
  const value = JSON.parse(raw) as AlbumSnapshot;
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.savedIds) ||
    !Array.isArray(value.exploredIds) ||
    ![...value.savedIds, ...value.exploredIds].every(
      (id) => typeof id === "string",
    )
  )
    throw new Error("Álbum incompatible o dañado.");
  const filter = (ids: string[]) =>
    [...new Set(ids)].filter((id) => knownIds.includes(id));
  const savedIds = filter(value.savedIds);
  return {
    schemaVersion: 1,
    savedIds,
    exploredIds: filter([...value.exploredIds, ...savedIds]),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}
export function loadAlbum(
  storage: StorageLike | undefined,
  knownIds: readonly string[],
) {
  try {
    if (!storage) throw new Error("Almacenamiento no disponible.");
    return {
      snapshot: parseAlbum(storage.getItem(STORAGE_KEY), knownIds),
      issue: null as string | null,
    };
  } catch {
    return {
      snapshot: emptyAlbum(),
      issue:
        "No pudimos recuperar el álbum de este navegador. Puedes seguir explorando y guardar postales durante esta sesión.",
    };
  }
}
export function saveAlbum(
  storage: StorageLike | undefined,
  snapshot: AlbumSnapshot,
) {
  try {
    if (!storage) throw new Error("Almacenamiento no disponible.");
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}
export function albumReducer(
  state: AlbumSnapshot,
  action: AlbumAction,
  knownIds: readonly string[],
  now = new Date().toISOString(),
): AlbumSnapshot {
  if (!knownIds.includes(action.id)) return state;
  const saved = new Set(state.savedIds),
    explored = new Set(state.exploredIds);
  if (action.type === "explore") explored.add(action.id);
  if (action.type === "save") {
    explored.add(action.id);
    saved.add(action.id);
  }
  if (action.type === "remove") saved.delete(action.id);
  if (
    [...saved].join("|") === state.savedIds.join("|") &&
    [...explored].join("|") === state.exploredIds.join("|")
  )
    return state;
  return {
    schemaVersion: 1,
    savedIds: [...saved],
    exploredIds: [...explored],
    updatedAt: now,
  };
}
